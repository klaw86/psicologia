-- ==============================================================================
-- Migration: Segurança e Papéis de Usuário (Admin exclusivo klaw.com@gmail.com)
-- Garante papel 'demo', restrição estrita de admin no banco e auto-associação
-- ==============================================================================

-- 1. Garante que o tipo public.app_role contenha os papéis necessários
do $$
begin
  -- Adiciona 'demo' se ainda não existir no enum
  if not exists (
    select 1
    from pg_enum
    join pg_type on pg_type.oid = pg_enum.enumtypid
    where pg_type.typname = 'app_role' and enumlabel = 'demo'
  ) then
    alter type public.app_role add value 'demo';
  end if;
end $$;

-- 2. Tabela user_roles (caso ainda não exista)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to anon, authenticated;
grant all on public.user_roles to authenticated, service_role;
alter table public.user_roles enable row level security;

-- Políticas de RLS para user_roles
drop policy if exists "Usuário lê seus papéis" on public.user_roles;
create policy "Usuário lê seus papéis"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Leitura de papéis por serviço" on public.user_roles;
create policy "Leitura de papéis por serviço"
  on public.user_roles for select
  to service_role
  using (true);

-- 3. Função has_role com suporte a admin e demo
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated, service_role;

-- 4. Função auxiliar para o usuário autenticado consultar seus papéis
create or replace function public.get_my_roles()
returns table (role public.app_role) language sql stable security definer set search_path = public as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

grant execute on function public.get_my_roles() to authenticated;

-- 5. Restrição de Segurança no Banco:
-- O papel 'admin' é restrito exclusivamente ao e-mail 'klaw.com@gmail.com'
create or replace function public.check_admin_role_restriction()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_email text;
begin
  if new.role = 'admin' then
    select lower(email) into v_email from auth.users where id = new.user_id;
    if v_email is null or v_email <> 'klaw.com@gmail.com' then
      raise exception 'Acesso negado: o papel de administrador é restrito exclusivamente ao e-mail klaw.com@gmail.com';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_admin_role on public.user_roles;
create trigger trg_check_admin_role
before insert or update on public.user_roles
for each row execute function public.check_admin_role_restriction();

-- 6. Trigger automático para atribuir papel no momento em que o usuário for criado no auth.users
create or replace function public.handle_new_user_roles()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'klaw.com@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  elsif lower(new.email) like '%demo%' or coalesce(new.raw_user_meta_data->>'role', '') = 'demo' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'demo')
    on conflict (user_id, role) do nothing;
  else
    insert into public.user_roles (user_id, role)
    values (new.id, 'user')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_assign_role on auth.users;
create trigger on_auth_user_created_assign_role
after insert on auth.users
for each row execute function public.handle_new_user_roles();

-- 7. Seed defensivo: Se o usuário klaw.com@gmail.com já tiver sido criado no Supabase Auth,
-- associa imediatamente o papel 'admin' a ele
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = 'klaw.com@gmail.com'
on conflict (user_id, role) do nothing;

-- 8. Função RPC segura para confirmar o papel de admin após login via Google OAuth ou Magic Link
create or replace function public.claim_admin_role()
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_email text;
begin
  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email = 'klaw.com@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (auth.uid(), 'admin')
    on conflict (user_id, role) do nothing;
    return true;
  end if;
  return false;
end;
$$;

grant execute on function public.claim_admin_role() to authenticated;

