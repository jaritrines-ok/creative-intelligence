-- ============================================================
-- Creative Intelligence App — 0003 ROW LEVEL SECURITY
-- Voer uit NA 0002_auth.sql
-- Regel: admin ziet/bewerkt alles; gebruiker alleen eigen klanten.
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- Kolomrechten voorkomen dat een gebruiker zichzelf tot admin promoveert:
-- via de client mag alleen de kolom 'naam' aangepast worden.
-- Rolwijzigingen lopen server-side via de service role (admin-paneel).
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
revoke update on public.profiles from authenticated;
grant update (naam) on public.profiles to authenticated;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
	for select to authenticated
	using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
	for update to authenticated
	using (id = auth.uid() or public.is_admin())
	with check (id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------
-- clients
-- ------------------------------------------------------------
alter table public.clients enable row level security;

drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients
	for select to authenticated
	using (eigenaar_id = auth.uid() or public.is_admin());

drop policy if exists clients_insert on public.clients;
create policy clients_insert on public.clients
	for insert to authenticated
	with check (eigenaar_id = auth.uid() or public.is_admin());

drop policy if exists clients_update on public.clients;
create policy clients_update on public.clients
	for update to authenticated
	using (eigenaar_id = auth.uid() or public.is_admin())
	with check (eigenaar_id = auth.uid() or public.is_admin());

drop policy if exists clients_delete on public.clients;
create policy clients_delete on public.clients
	for delete to authenticated
	using (eigenaar_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------
-- Client-gerelateerde tabellen: toegang via can_access_client()
-- (intake_bron1..5, trigger_map_versions, concepts)
-- ------------------------------------------------------------

-- intake_bron1
alter table public.intake_bron1 enable row level security;
drop policy if exists intake_bron1_all on public.intake_bron1;
create policy intake_bron1_all on public.intake_bron1
	for all to authenticated
	using (public.can_access_client(client_id))
	with check (public.can_access_client(client_id));

-- intake_bron2
alter table public.intake_bron2 enable row level security;
drop policy if exists intake_bron2_all on public.intake_bron2;
create policy intake_bron2_all on public.intake_bron2
	for all to authenticated
	using (public.can_access_client(client_id))
	with check (public.can_access_client(client_id));

-- intake_bron3_concurrenten
alter table public.intake_bron3_concurrenten enable row level security;
drop policy if exists intake_bron3_all on public.intake_bron3_concurrenten;
create policy intake_bron3_all on public.intake_bron3_concurrenten
	for all to authenticated
	using (public.can_access_client(client_id))
	with check (public.can_access_client(client_id));

-- intake_bron4
alter table public.intake_bron4 enable row level security;
drop policy if exists intake_bron4_all on public.intake_bron4;
create policy intake_bron4_all on public.intake_bron4
	for all to authenticated
	using (public.can_access_client(client_id))
	with check (public.can_access_client(client_id));

-- intake_bron5
alter table public.intake_bron5 enable row level security;
drop policy if exists intake_bron5_all on public.intake_bron5;
create policy intake_bron5_all on public.intake_bron5
	for all to authenticated
	using (public.can_access_client(client_id))
	with check (public.can_access_client(client_id));

-- trigger_map_versions
alter table public.trigger_map_versions enable row level security;
drop policy if exists trigger_map_all on public.trigger_map_versions;
create policy trigger_map_all on public.trigger_map_versions
	for all to authenticated
	using (public.can_access_client(client_id))
	with check (public.can_access_client(client_id));

-- concepts
alter table public.concepts enable row level security;
drop policy if exists concepts_all on public.concepts;
create policy concepts_all on public.concepts
	for all to authenticated
	using (public.can_access_client(client_id))
	with check (public.can_access_client(client_id));

-- ------------------------------------------------------------
-- ai_logs
-- Inserten: alleen eigen logs. Lezen: admin (logviewer) of eigen logs.
-- ------------------------------------------------------------
alter table public.ai_logs enable row level security;

drop policy if exists ai_logs_select on public.ai_logs;
create policy ai_logs_select on public.ai_logs
	for select to authenticated
	using (public.is_admin() or gebruiker_id = auth.uid());

drop policy if exists ai_logs_insert on public.ai_logs;
create policy ai_logs_insert on public.ai_logs
	for insert to authenticated
	with check (gebruiker_id = auth.uid());
