-- ============================================================
-- Creative Intelligence App — 0004 FK ON DELETE-gedrag
-- Zet de profiel-verwijzingen op ON DELETE SET NULL, zodat een
-- gebruiker verwijderd kan worden zonder z'n historie te blokkeren.
-- Voer uit NA 0003. Niet urgent — nodig vóór gebruikersbeheer (stap 11).
-- ============================================================

alter table public.trigger_map_versions
	drop constraint if exists trigger_map_versions_gegenereerd_door_fkey,
	add constraint trigger_map_versions_gegenereerd_door_fkey
		foreign key (gegenereerd_door) references public.profiles(id) on delete set null;

alter table public.ai_logs
	drop constraint if exists ai_logs_gebruiker_id_fkey,
	add constraint ai_logs_gebruiker_id_fkey
		foreign key (gebruiker_id) references public.profiles(id) on delete set null;
