# Werklog — Creative Intelligence App

Dit bestand houdt bij **wat er gebouwd is, waarom, en hoe het geverifieerd is**. Doel: terugleesbaar voor het team, en een vangnet om op terug te vallen als er iets misgaat. Nieuwste bovenaan. Elke wijziging is ook een git-commit (hash vermeld).

> Onderhoud: bij elke afgeronde wijziging wordt hier een entry toegevoegd (datum, commit, wat, waarom, verificatie, migratie). Kritisch blijven: bekende beperkingen staan expliciet onder "Kritische noten".

---

## Architectuur in het kort

- **Stack:** SvelteKit + TypeScript, Tailwind v4 + shadcn-svelte, Supabase (auth + Postgres, RLS), Anthropic Claude API, Vercel.
- **Model:** `claude-sonnet-5` (env `ANTHROPIC_MODEL` overschrijft; default in `src/lib/config.ts`).
- **De keten (Creative Loop):** Intake (5 bronnen + document-upload + "Overig") → Trigger Map → Matrix → Brief → Sprint → (winnaar) → volgende matrix-ronde.
- **Principes:** AI draait nooit automatisch (altijd expliciete knop); alle invoer auto-save; trigger map-versies worden nooit overschreven (nieuwe generatie = nieuwe versie); elke AI-call wordt gelogd in `ai_logs`; werkt met gedeeltelijke intake.

---

## AI-strategie per generatie (naslag)

Alle generaties gebruiken **structured outputs** (JSON-schema → gegarandeerd valide vorm) en **adaptive thinking** (het model bepaalt zelf de denk-diepte, gestuurd door `effort`). Gedeelde helper: `src/lib/server/claude.ts` → `claudeJSON(system, prompt, schema, maxTokens=16000, effort='high')`.

### Trigger map (`src/lib/server/trigger-map-generator.ts`)
- **Input:** alle ingevulde intake-data (Bron 1 t/m 6) als tekst — vraag + antwoord per bron, samengevoegd door `bouwIntakeTekst`.
- **Output:** pijnpunten (4-6), wensen (4-6), bezwaren (3-5), taal doelgroep (8-12 letterlijke termen), routines (3-5), kansen t.o.v. concurrenten (3-5), **persona's** (2-4 segmenten), **invalshoeken (3 per funnelfase = 9)**.
- **Effort:** `medium` (zwaarste generatie; `high` liep ~67s, over de Vercel-timeout).
- **Let op:** het is een *synthese/distillatie*, geen 1-op-1 afvinklijst. Alle input gaat erin; het model vat samen.

### Scorekaart (`src/lib/trigger-map.ts` + `src/lib/server/scoring-ai.ts`) — prioriteit per invalshoek
- **Doel:** de prioriteit transparant en controleerbaar maken vóórdat de matrix wordt gemaakt (mens in de lus).
- **Model:** RICE-light per invalshoek — **Bereik** (persona-segment), **Impact** (kernpijnpunt/wens), **Bewijskracht** (hoeveel intake-bronnen ondersteunen), **Effort** (productie-inspanning), elk Laag/Middel/Hoog.
- **Formule:** `(Bereik × Impact × Bewijskracht) / Effort` met L/M/H → 1/2/3. Prioriteit-banden: ≥8 = Hoog, ≥3 = Middel, anders Laag (`afgeleidePrioriteit`).
- **Werkwijze:** "Scores voorstellen" laat Claude de scores + toelichting voorstellen (effort `low`); de strateeg controleert/stelt bij (L/M/H-selects, auto-save). De matrix erft de afgeleide prioriteit exact.
- **Kritische noot:** de RICE-getallen blijven schattingen; de winst zit in *expliciet en consistent* maken + menselijke controle, niet in schijnprecisie. Echte validatie volgt uit de kalibratie-loop (voorspelde prio vs. sprintresultaten).

### Matrix (`src/lib/server/matrix-ai.ts`) — trigger map → testopzet
- **Input aan Claude:** de invalshoeken per funnelfase (met omschrijving + **onderbouwing** + status; gearchiveerde worden overgeslagen, en "Getest — werkt" worden overgeslagen tenzij er te weinig overblijven), de **persona's**, pijnpunten, wensen, bezwaren, taal, kansen, én optioneel de **extra sturing** (vrij tekstveld van de strateeg).
- **Methode / principe:**
  1. **Eén concept per invalshoek**, dekt TOFU/MOFU/BOFU af.
  2. **Schoon testen:** de eerste ronde test de *invalshoek*, dus per funnelfase blijven format/structuur/creator **gelijk** en varieert alleen de invalshoek. Testvolgorde = Invalshoek → Format → Structuur → Creator.
  3. **Prioriteit (Hoog/Middel/Laag)** komt uit de **scorekaart** (zie hieronder): de matrix neemt de door de strateeg goedgekeurde prioriteit exact over. Alleen als een invalshoek nog niet gescoord is, weegt Claude zelf af (aansluiting pijnpunt/wens/kans, persona-bereik, funnelfase).
  4. **Onderbouwing per concept:** 1-3 zinnen die (a) de invalshoek koppelen aan een concreet trigger map-element en (b) de prioriteit verantwoorden. Zichtbaar via de ℹ️-knop in de matrix.
- **Weergavevolgorde in de tabel** (`sorteerConcepten`, `src/lib/matrix.ts`): funnelfase (TOFU→MOFU→BOFU) → prioriteit (Hoog→Middel→Laag) → aanmaakdatum. Dit is mechanisch/deterministisch.
- **Effort:** `low` (met de rijke context is diep nadenken minder nodig; `high`/`medium` liepen ~100s/~88s, over de 60s Vercel-timeout; `low` ≈ 41s).

### Testplan (`src/lib/server/testplan-ai.ts`) — onder de matrix
- **Input:** persona's + de matrix-concepten + pijnpunten/wensen + optionele feedback.
- **Output:** toelichting + 4-6 sprints (focus/persona, welke concepten, wat testen, succescriterium, budget, duur). "Verfijn met feedback" hergenereert. Effort `high` (~35s).

### Brief (`src/lib/server/sprint-ai.ts` → `genereerBrief`)
- Per concept een productieklare creative brief (hypothese, wie, gedrag, format, structuur, hook, kern, cta, variabele, succes). Effort `high` (~19s). Eigen tab tussen Matrix en Sprint.

### Learning-analyse & volgende testronde (`src/lib/server/sprint-ai.ts`)
- **`analyseerResultaat`:** o.b.v. metrics + observatie → "wat werkte" + "volgende stap".
- **`genereerVolgendeTestronde`** (de loop): bij een winnaar → 2-4 varianten van de **volgende** testvariabele (invalshoek + winnende dimensies constant), onderbouwd met de learning van de vorige ronde. Effort `medium`.

### Kritische noten (bewust eerlijk)
- De weging/prioriteit is **transparant** (onderbouwing) en **gefundeerd** (persona's + onderbouwing worden meegegeven), maar het blijft de **inschatting van het model** gestuurd door de prompt — géén deterministisch numeriek scoringsmodel. Te controleren via de onderbouwing.
- Trigger map = synthese, geen gegarandeerde 1-op-1 dekking van elk intake-antwoord.
- Om onder de Vercel-timeout (60s) te blijven staan de zwaarste generaties op lagere `effort`. Op Vercel **Pro** (maxDuration tot 300s) kan `effort` omhoog voor meer diepgang.

---

## Openstaande / bekende punten
- Tijdelijk admin-wachtwoord voor `j.trines@onlineklik.nl` moet nog gewijzigd worden (er is nog geen wachtwoord-scherm in de app).
- Google-login is gevraagd maar niet gebouwd.
- Meta Ads-koppeling: bewust uitgesteld.
- Vercel-plan onbekend: bij Pro kan `maxDuration` naar 300 + `effort` omhoog.
- Testklant "Test" bevat testdata (mag opgeruimd worden).

---

## Wijzigingen (nieuwste boven)

### 2026-07-10 — Scorekaart: RICE-light prioriteit per invalshoek · `2b10220`
- **Wat:** transparante tussenstap tussen trigger map en matrix. Per invalshoek een RICE-light score (Bereik · Impact · Bewijskracht · Effort, elk L/M/H) → deterministisch afgeleide prioriteit. "Scores voorstellen" (AI) vult de scores + toelichting; de strateeg controleert/stelt bij (L/M/H-selects). De matrix neemt de goedgekeurde prioriteit exact over.
- **Waarom:** de prioriteit navolgbaar en controleerbaar maken (niet meer "de LLM gokt"), met de mens in de lus vóórdat de matrix gemaakt wordt.
- **Model/formule:** RICE-light = (Bereik × Impact × Bewijskracht) / Effort, met L/M/H → 1/2/3. Prioriteit-banden: ≥8 Hoog, ≥3 Middel, anders Laag. Zie `src/lib/trigger-map.ts` (`riceScore`, `afgeleidePrioriteit`).
- **Bug onderweg:** het model zette de funnelfase vóór de naam → koppeling faalde (0/9). Opgelost met een schone prompt + robuuste naam-normalisatie (strip `[FASE]`-prefix).
- **Verificatie (klant Test):** 9/9 invalshoeken gescoord; RICE→prioriteit klopt; matrix-prioriteit matcht 9/9 met de scorekaart; UI rendert (knop + 36 selects + 9 badges); 0 console-fouten; `svelte-check` 0 fouten.
- **Migratie:** geen (scores in `trigger_map_versions.invalshoeken` jsonb).

### 2026-07-10 — Matrix: betere weging, extra sturing & sluitende loop · `62044ae`
- **Wat:** (1) persona's + invalshoek-onderbouwing meegegeven aan de matrix-generatie; prioriteit weegt persona-bereik + aansluiting mee. (2) Vrij "Extra sturing"-veld bij "Opzet genereren" (bv. benaming insuline vs. medicatie, gezicht-in-beeld). (3) Loop gesloten: "Volgende testronde genereren" gebruikt de learning-analyse om 2-4 varianten van de volgende testvariabele te maken i.p.v. één lege kopie.
- **Waarom:** het team wilde weten *waarom* de matrix eruitziet zoals 'ie is, of de prio betrouwbaar is en of het een doorlopende loop vormt.
- **Effort-tuning:** matrix → `low`, vervolg → `medium` (met de rijke context liep `high` ~100s, over de 60s-timeout).
- **Verificatie (klant Test):** matrix 41s, alle 9 concepten onderbouwd; onderbouwing verwijst naar persona's (weging werkt) + verwerkt de sturing; vervolg → 4 format-varianten met invalshoek constant en learning verwerkt. `svelte-check` 0 fouten.
- **Migratie:** geen.

### 2026-07-10 — Onderbouwing per matrix-concept · `4e532e5`
- **Wat:** Claude geeft + toont per concept waarom deze invalshoek en waarom deze prioriteit (ℹ️-knop klapt het uit in de matrix).
- **Waarom:** de matrix-keuzes waren een "zwart gat" — geen zichtbare redenering.
- **Verificatie:** `svelte-check` 0 fouten; end-to-end getest na migratie.
- **Migratie:** `0009_concept_onderbouwing.sql` (`concepts.onderbouwing`).

### 2026-07-09 — Fix: document-upload parse · `90ae8fd`
- **Wat:** document-parser gaf "geen valide JSON". Oorzaak: `max_tokens` stond nog op 8000 terwijl adaptive thinking de denk-tokens meetelt → JSON knapte af. Fix: `max_tokens` 16000 + `effort` `low` (extractie, geen strategie) + `maxDuration` 60 op /api/intake.
- **Verificatie:** ~5000-teken document → 16 Bron 1- + 4 Bron 2-antwoorden, valide, ~17s.
- **Migratie:** geen.

### 2026-07-09 — Extended (adaptive) thinking aan · `890656c`
- **Wat:** alle AI-generaties van `thinking: disabled` naar `adaptive` + `effort`. `max_tokens` naar 16000. `maxDuration` 60 op de AI-routes.
- **Waarom:** betere kwaliteit (klassiek `budget_tokens` is deprecated + wordt door sonnet-5 geweigerd).
- **Verificatie:** trigger map 51s (medium), matrix/testplan ~35s, brief 19s — valide JSON, geen truncatie.
- **Migratie:** geen.

### 2026-07-09 — Intake-bron "Overig" + Brief als eigen tab · `8da05ef`
- **Wat:** optionele Bron 6 "Overig" (vrije blokken, telt niet mee in voortgang, wél in trigger map-generatie). Creative brief verplaatst naar eigen tab tussen Matrix en Sprint.
- **Verificatie:** "Overig"-tab + Brief-tab renderen; brief-generatie → 10 velden opgeslagen; Bron 6 blok opgeslagen na migratie.
- **Migratie:** `0008_bron6_overig.sql` (tabel `intake_bron6`).

### 2026-07-09 — Persona's in trigger map + AI-testplan · `dc2878c`
- **Wat:** persona's/doelgroep-segmenten op de trigger map (generator + bewerkbaar). AI-testplan onder de matrix (sprintplan + "verfijn met feedback").
- **Verificatie:** trigger map v3 → 4 persona's; testplan → 6 sprints; feedback "begin met BOFU" → Sprint 1 werd BOFU.
- **Migratie:** `0007_personas_testplan.sql` (`trigger_map_versions.personas`, `clients.testplan`).

### 2026-07-09 — Invalshoeken per funnelfase + schone matrix · `6a1905e`
- **Wat:** trigger map genereert 3 invalshoeken per funnelfase (9); invalshoeken gegroepeerd per TOFU/MOFU/BOFU met status/levenscyclus + archiveren. Matrix houdt per fase format/structuur/creator constant (schoon testen).
- **Verificatie:** 9 invalshoeken (3/fase), status persist, archiveren werkt; matrix `variabeleConstant` per fase.
- **Migratie:** geen (invalshoeken is jsonb).

### 2026-07-09 — Fix: intake Bron 4 (Reviews) laadde niet terug · `e5c0b1d`
- **Wat:** load sorteerde `intake_bron4` op `created_at`, maar die kolom bestaat niet (tabel heeft `updated_at`) → query errorde naar null → tab altijd leeg. Data stond wél in de DB. Fix: sorteren op `updated_at`.
- **Migratie:** geen.

### 2026-07-08 — Intake-verdieping, Sprint-fase, matrix-generatie, document-upload · `00a5429`
- **Wat:** grote uitbreiding — verdiepte intake (Bron 1 → 43 vragen), volledige Sprint-fase, matrix auto-generatie, en de document-upload (Google Doc/tekst → Claude vult intake-vragen).
- **Migratie:** `0006_sprint.sql` (sprint-velden op `concepts`).

### 2026-07-07 — Volledige applicatie (basis) · `c73d5a0`
- **Wat:** eerste volledige app: setup, auth, DB (migraties 0001-0005), sidebar, klantbeheer, intake, Claude + trigger map, trigger map-bewerken, matrix, AI-logging, admin.
