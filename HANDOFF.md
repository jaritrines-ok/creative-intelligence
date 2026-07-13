# Handoff — Creative Intelligence App (Online Klik)

> Nieuwe chat? Zeg: **"Lees HANDOFF.md en WERKLOG.md"** en je bent bij.

## Context
Interne Nederlandstalige tool voor Social Ads-bureau Online Klik. Leidt elke klant door de
"Creative Loop": Intake → Trigger Map (AI) → Matrix → Brief → Sprint, met Claude-ondersteuning
per stap, alles gelogd. Al gebouwd, live gedeployed op Vercel.

**Lees eerst `WERKLOG.md`** — dat is de bron van waarheid voor alle bouwkeuzes, migraties
(0001–0009 gedraaid) en AI-strategie per generatie. Deze handoff bevat alleen wat daar NOG NIET
in staat: de nieuwe strategische richting uit de laatste sessie.

## Techstack
SvelteKit 2 + Svelte 5 (runes) + TS + Vite. Tailwind v4 + shadcn-svelte. Supabase (auth +
Postgres + RLS, service-role admin). Anthropic Claude (`claude-sonnet-5`, structured outputs,
adaptive thinking, effort per generatie). Vercel (adapter-vercel, maxDuration 60 op AI-routes).
Windows lokaal build faalt (EPERM symlink) → gebruik `npm run check` voor typecheck; Vercel bouwt wel.
Repo: https://github.com/jaritrines-ok/creative-intelligence.git

## Status van de review (afgerond)
Volledige flow kritisch doorgelopen. Fundering sterk; AI-keten transparant (scorekaart +
onderbouwing). Grootste winst: navigatie/"volgende stap" + de loop écht sluiten.

## AFGESPROKEN RICHTING (de kern — nog niet gebouwd)

### 1. Lagen strak trekken (belangrijkste herontwerp)
- **Trigger map = alleen inzicht**: pijnpunten, wensen, bezwaren, taal, routines, kansen +
  persona's. UITGEBREID tonen. GEEN scoring-UI meer hier (nu propt die 't vol: 9 invalshoeken ×
  4 selects = 36 dropdowns).
- **Invalshoeken = geprioriteerde test-backlog** (de brug inzicht→test). Elke invalshoek =
  hypothese over welke boodschap/hoek aanslaat (bijv. VIVI Cap "insulinepen vs. medicijn").
  RICE-light draait AUTOMATISCH (AI), handmatig tweaken optioneel/ingeklapt. Tonen als
  RANGLIJST bovenaan de Matrix, niet als vette kaarten in de trigger map.
  → RICE hoort conceptueel bij invalshoeken want het beantwoordt "welke hoek testen we eerst?"
    (testvolgorde = Invalshoek → Format → Structuur → Creator).
- **Matrix = actieve testronde** (top van backlog → concrete concepten, schoon testen, 1 variabele).
- **Sprint = resultaten + learnings**, voedt terug.

NB: check bij de bouw of de gebruiker akkoord is met "invalshoeken als aparte backlog-laag"
(open vraag, zie onder).

### 2. Matrix + learnings
- Rijen SLEEPBAAR maken om te herordenen → `volgorde`-kolom bestaat al in DB maar wordt niet
  gebruikt. Testvolgorde = handmatige volgorde (test 1 bovenaan).
- Learnings zitten nu verstopt in Sprint. Bouw een LEARNINGS-LOG per klant (tijdlijn: "invalshoek
  X won van Y, omdat…") en geef dat als context mee aan volgende generaties (compounding).
- Loop sluiten: sprint-winnaar → invalshoek-status automatisch "Getest — werkt" (gebeurt nu NIET,
  daardoor draait de "sla geteste invalshoeken over"-logica in matrix-generatie nooit).

### 3. Brief format-bewust maken (quick win)
Brief leunt nu op video (hook 0-3s). Geef concept-`format` mee aan de generator: Video →
hook/kern/CTA; Static → eye-catcher/headline/copy/CTA (geen "hook 0-3s"); Carousel →
kaart-voor-kaart. Brief is nu ook niet kopieerbaar/exporteerbaar → voeg "kopieer/export
(Markdown)" toe.

### 4. Automatisering intake (groter traject, gefaseerd)
Doel: concurrenten- + reviews-scan automatisch invullen (Bron 3/4).
- Techniek: AI-scan via Claude web search + web fetch → gestructureerde output.
- EERLIJKE haalbaarheid: websites + reviewsites (Trustpilot/Kiyoh/Google) = goed doenbaar.
  Meta Ad Library / TikTok = lastig (JS-zwaar, bot-detectie, beperkte officiële API) → partiële
  dekking of betaalde databron.
- Duurt te lang voor inline (>60s Vercel-timeout) → moet ACHTERGROND-JOB worden (job starten →
  status pollen). Vereist infra-keuze: Vercel Pro (langere timeout) of Supabase Edge Function/queue.
- Fase 1: websites + reviews. Fase 2: ad libraries.
- Altijd presenteren als "AI-concept, strateeg verifieert".

## Aanbevolen bouwvolgorde
1. Trigger map opschonen + invalshoeken als auto-geprioriteerde backlog bovenaan Matrix
2. Matrix slepen/herordenen + learnings-log + winnaar→invalshoek-status
3. Brief format-bewust + kopiëren/export
4. Automatisering intake (fase 1) — eerst infra-keuze maken

## Open vragen aan gebruiker
- Akkoord met "invalshoeken = aparte geprioriteerde backlog-laag tussen trigger map en matrix"?
- Automatisering: mag naar Vercel Pro / Supabase Edge Functions voor achtergrond-jobs, of binnen
  gratis blijven?

## Openstaand / hygiëne (uit WERKLOG)
- Tijdelijk admin-wachtwoord voor j.trines@onlineklik.nl MOET nog gewijzigd.
- In chat geplakte keys (Supabase secret/publishable, Anthropic) moeten geroteerd blijven;
  Anthropic is al geroteerd (lokale .env geldig). Vercel-env checken bij live 401's.
- NOOIT echte klanten (Names4Ever, Soccerfanshop) of het admin-account aanraken bij testcleanup.
- Google-login en Meta Ads-integratie staan nog op de wensenlijst.
