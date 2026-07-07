-- ============================================================
-- Creative Intelligence App — 0001 TABELLEN
-- Voer de bestanden uit in volgorde: 0001 -> 0002 -> 0003
-- Plakken in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Helper: updated_at automatisch bijwerken bij UPDATE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

-- ------------------------------------------------------------
-- profiles (1-op-1 met auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	naam text,
	rol text not null default 'gebruiker' check (rol in ('admin', 'gebruiker')),
	created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- clients
-- ------------------------------------------------------------
create table if not exists public.clients (
	id uuid primary key default gen_random_uuid(),
	eigenaar_id uuid not null references public.profiles(id) on delete cascade,
	naam text not null,
	sector text,
	status text not null default 'actief'
		check (status in ('actief', 'gepauzeerd', 'gearchiveerd')),
	huidige_fase text not null default 'intake'
		check (huidige_fase in ('intake', 'trigger_map', 'matrix', 'sprint')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);
create index if not exists clients_eigenaar_id_idx on public.clients(eigenaar_id);
create or replace trigger clients_set_updated_at
	before update on public.clients
	for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- intake_bron1 — Klantgesprek (1 rij per vraag)
-- ------------------------------------------------------------
create table if not exists public.intake_bron1 (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients(id) on delete cascade,
	vraag_nummer int not null,
	antwoord text,
	updated_at timestamptz not null default now(),
	unique (client_id, vraag_nummer)
);
create index if not exists intake_bron1_client_idx on public.intake_bron1(client_id);
create or replace trigger intake_bron1_set_updated_at
	before update on public.intake_bron1
	for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- intake_bron2 — Interne interviews (1 rij per vraag)
-- ------------------------------------------------------------
create table if not exists public.intake_bron2 (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients(id) on delete cascade,
	vraag_nummer int not null,
	antwoord text,
	updated_at timestamptz not null default now(),
	unique (client_id, vraag_nummer)
);
create index if not exists intake_bron2_client_idx on public.intake_bron2(client_id);
create or replace trigger intake_bron2_set_updated_at
	before update on public.intake_bron2
	for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- intake_bron3_concurrenten — Concurrentieonderzoek (meerdere rijen)
-- ------------------------------------------------------------
create table if not exists public.intake_bron3_concurrenten (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients(id) on delete cascade,
	naam text,
	url text,
	meta_ad_library text,
	invalshoeken text,
	website_taal text,
	tiktok_observaties text,
	kansen text,
	created_at timestamptz not null default now()
);
create index if not exists intake_bron3_client_idx on public.intake_bron3_concurrenten(client_id);

-- ------------------------------------------------------------
-- intake_bron4 — Reviews & social listening (meerdere rijen per klant)
-- ------------------------------------------------------------
create table if not exists public.intake_bron4 (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients(id) on delete cascade,
	platform text,
	bron_naam text,
	ruwe_tekst text,
	updated_at timestamptz not null default now()
);
create index if not exists intake_bron4_client_idx on public.intake_bron4(client_id);
create or replace trigger intake_bron4_set_updated_at
	before update on public.intake_bron4
	for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- intake_bron5 — Eigen data klant (1 rij per klant)
-- unique(client_id) toegevoegd t.o.v. briefing: maakt auto-save via upsert schoon.
-- ------------------------------------------------------------
create table if not exists public.intake_bron5 (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients(id) on delete cascade,
	beste_advertenties text,
	best_verkopende_producten text,
	search_console text,
	organische_posts text,
	updated_at timestamptz not null default now(),
	unique (client_id)
);
create index if not exists intake_bron5_client_idx on public.intake_bron5(client_id);
create or replace trigger intake_bron5_set_updated_at
	before update on public.intake_bron5
	for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- trigger_map_versions — AI-gegenereerde trigger maps (versies bewaard)
-- ------------------------------------------------------------
create table if not exists public.trigger_map_versions (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients(id) on delete cascade,
	versie_nummer int not null,
	is_actief boolean not null default true,
	pijnpunten jsonb,
	wensen jsonb,
	bezwaren jsonb,
	taal_doelgroep jsonb,
	routines jsonb,
	kansen_vs_concurrenten jsonb,
	invalshoeken jsonb,
	gegenereerd_door uuid references public.profiles(id),
	created_at timestamptz not null default now(),
	unique (client_id, versie_nummer)
);
create index if not exists trigger_map_client_idx on public.trigger_map_versions(client_id);
create index if not exists trigger_map_actief_idx on public.trigger_map_versions(client_id, is_actief);

-- ------------------------------------------------------------
-- concepts — Variabelenmatrix
-- ------------------------------------------------------------
create table if not exists public.concepts (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients(id) on delete cascade,
	funnelfase text check (funnelfase in ('TOFU', 'MOFU', 'BOFU')),
	invalshoek text,
	format text,
	structuur text,
	creator_type text,
	hypothese text,
	variabele text,
	prioriteit text check (prioriteit in ('Hoog', 'Middel', 'Laag')),
	status text not null default 'Idee'
		check (status in ('Idee', 'In productie', 'Live', 'Afgerond')),
	volgorde int,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);
create index if not exists concepts_client_idx on public.concepts(client_id);
create or replace trigger concepts_set_updated_at
	before update on public.concepts
	for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- ai_logs — elke AI-call wordt hier gelogd
-- ------------------------------------------------------------
create table if not exists public.ai_logs (
	id uuid primary key default gen_random_uuid(),
	client_id uuid references public.clients(id) on delete set null,
	gebruiker_id uuid references public.profiles(id),
	module text,
	model text,
	prompt text,
	response text,
	tokens_input int,
	tokens_output int,
	duur_ms int,
	created_at timestamptz not null default now()
);
create index if not exists ai_logs_client_idx on public.ai_logs(client_id);
create index if not exists ai_logs_gebruiker_idx on public.ai_logs(gebruiker_id);
