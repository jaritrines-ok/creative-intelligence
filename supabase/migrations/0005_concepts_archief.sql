-- ============================================================
-- Creative Intelligence App — 0005 Concepten archiveren
-- Voegt een 'gearchiveerd'-vlag toe aan concepts (variabelenmatrix),
-- zodat rijen gearchiveerd kunnen worden zonder ze te verwijderen.
-- Voer uit NA 0004. Nodig vóór stap 9 (variabelenmatrix) werkt.
-- ============================================================

alter table public.concepts
	add column if not exists gearchiveerd boolean not null default false;

create index if not exists concepts_actief_idx
	on public.concepts (client_id, gearchiveerd);
