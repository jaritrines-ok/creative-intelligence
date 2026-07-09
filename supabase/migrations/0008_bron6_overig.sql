-- ============================================================
-- Creative Intelligence App — 0008 Intake Bron 6 "Overig"
-- Voer uit NA 0007.
-- Vrije, optionele databron: meerdere blokken (titel + inhoud) per klant,
-- bijv. Pinterest-data, Reddit, analyses van eerdere campagnes.
-- ============================================================

create table if not exists public.intake_bron6 (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients(id) on delete cascade,
	titel text,
	inhoud text,
	created_at timestamptz not null default now()
);
create index if not exists intake_bron6_client_idx on public.intake_bron6(client_id);

alter table public.intake_bron6 enable row level security;
drop policy if exists intake_bron6_all on public.intake_bron6;
create policy intake_bron6_all on public.intake_bron6
	for all to authenticated
	using (public.can_access_client(client_id))
	with check (public.can_access_client(client_id));
