-- ============================================================
-- Creative Intelligence App — 0006 Sprint-fase (Fase 4)
-- Voegt resultaat-, brief-, analyse- en winnaar-velden toe aan concepts.
-- Voer uit NA 0005. Nodig vóór de Sprint-tab werkt.
-- ============================================================

alter table public.concepts
	add column if not exists hook_rate numeric,
	add column if not exists hold_rate numeric,
	add column if not exists ctr numeric,
	add column if not exists roas numeric,
	add column if not exists cpa numeric,
	add column if not exists observatie text,
	add column if not exists ai_analyse jsonb,
	add column if not exists brief jsonb,
	add column if not exists is_winnaar boolean not null default false;
