-- ============================================================
-- Creative Intelligence App — 0002 AUTH-HELPERS & TRIGGERS
-- Voer uit NA 0001_tables.sql
-- ============================================================

-- is_admin(): veilige rolcheck.
-- SECURITY DEFINER zodat aanroepen binnen RLS-policies op profiles
-- geen oneindige recursie veroorzaken.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
	select exists (
		select 1 from public.profiles p
		where p.id = auth.uid() and p.rol = 'admin'
	);
$$;

-- can_access_client(): true als de huidige gebruiker eigenaar is of admin.
-- Gebruikt door RLS-policies op alle client-gerelateerde tabellen.
create or replace function public.can_access_client(cid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
	select exists (
		select 1 from public.clients c
		where c.id = cid
			and (c.eigenaar_id = auth.uid() or public.is_admin())
	);
$$;

-- Automatisch een profiel aanmaken bij nieuwe registratie.
-- Nieuwe gebruikers krijgen altijd rol 'gebruiker'; een admin promoveert later.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, naam, rol)
	values (
		new.id,
		coalesce(new.raw_user_meta_data->>'naam', new.email),
		'gebruiker'
	)
	on conflict (id) do nothing;
	return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- EERSTE ADMIN AANMAKEN
-- 1) Registreer je account via de app (of Dashboard > Authentication > Users).
-- 2) Voer daarna onderstaande query los uit met jouw e-mailadres:
--
-- update public.profiles set rol = 'admin'
-- where id = (select id from auth.users where email = 'j.trines@onlineklik.nl');
-- ------------------------------------------------------------
