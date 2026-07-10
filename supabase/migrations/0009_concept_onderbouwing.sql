-- ============================================================
-- Creative Intelligence App — 0009 Onderbouwing per concept
-- Voer uit NA 0008.
-- Slaat per concept de redenering op (waarom deze invalshoek + waarom deze
-- prioriteit), zodat de matrix-keuzes transparant en navolgbaar zijn.
-- ============================================================

alter table public.concepts
	add column if not exists onderbouwing text;
