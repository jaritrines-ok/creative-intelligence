-- ============================================================
-- Creative Intelligence App — 0007 Persona's + Testplan
-- Voer uit NA 0006.
-- - personas: doelgroep-segmenten op de trigger map (per versie).
-- - testplan: AI-gegenereerd stap-voor-stap testplan per klant.
-- Beide zijn jsonb; nodig vóór persona's genereren en het testplan werken.
-- ============================================================

alter table public.trigger_map_versions
	add column if not exists personas jsonb;

alter table public.clients
	add column if not exists testplan jsonb;
