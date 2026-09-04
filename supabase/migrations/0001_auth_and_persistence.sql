-- SileyaBook6: real auth + persistence schema
-- Replaces localStorage-based storage.ts with real per-user Postgres data.

-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Auteur',
  email text not null,
  credits_pages integer not null default 0,
  total_credits_utilises integer not null default 0,
  plan_tier text not null default 'Découverte',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- No insert/delete policies for authenticated/anon: profile rows are only
-- ever created by the handle_new_user trigger (as postgres/service role).

-- ============================================================
-- 2. ebooks
-- ============================================================
create table public.ebooks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  titre text not null default 'Manuscrit sans titre',
  sous_titre text not null default '',
  description text not null default '',
  statut text not null default 'draft',
  source_type text not null default 'prompt',
  source_detail text not null default '',
  plan jsonb not null default '[]'::jsonb,
  contenu jsonb not null default '{}'::jsonb,
  credits_consommes integer not null default 0,
  fichier_pdf_url text,
  cover_image_url text,
  cover_theme text,
  trim_size text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ebooks_profile_id_idx on public.ebooks(profile_id);

alter table public.ebooks enable row level security;

create policy "ebooks_select_own" on public.ebooks
  for select using (auth.uid() = profile_id);

create policy "ebooks_insert_own" on public.ebooks
  for insert with check (auth.uid() = profile_id);

create policy "ebooks_update_own" on public.ebooks
  for update using (auth.uid() = profile_id);

create policy "ebooks_delete_own" on public.ebooks
  for delete using (auth.uid() = profile_id);

-- ============================================================
-- 3. generation_logs
-- ============================================================
create table public.generation_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  ebook_id uuid references public.ebooks(id) on delete set null,
  ebook_titre text not null default '',
  date timestamptz not null default now(),
  source_type text not null default 'prompt',
  source_detail text not null default '',
  pages_generees integer not null default 0,
  tokens_utilises integer not null default 0,
  model_used text not null default '',
  duration_ms integer not null default 0,
  status text not null default 'success'
);

create index generation_logs_profile_id_idx on public.generation_logs(profile_id);

alter table public.generation_logs enable row level security;

create policy "generation_logs_select_own" on public.generation_logs
  for select using (auth.uid() = profile_id);

-- No insert policy for authenticated/anon: logs are written by the server
-- using the service_role key only.

-- ============================================================
-- 4. credit_transactions
-- ============================================================
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  montant integer not null,
  type text not null check (type in ('generation', 'bonus', 'achat')),
  description text,
  ebook_id uuid references public.ebooks(id) on delete set null,
  balance_after integer,
  created_at timestamptz not null default now()
);

create index credit_transactions_profile_id_idx on public.credit_transactions(profile_id);

alter table public.credit_transactions enable row level security;

create policy "credit_transactions_select_own" on public.credit_transactions
  for select using (auth.uid() = profile_id);

-- Deliberately no insert/update/delete policy for authenticated/anon:
-- the ledger is only ever written via apply_credit_transaction() below.

-- ============================================================
-- 5. handle_new_user trigger: auto-create a profile row on signup
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, credits_pages, plan_tier)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    0,
    'Découverte'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 6. apply_credit_transaction: the ONLY way credits_pages ever changes
-- ============================================================
create function public.apply_credit_transaction(
  p_profile_id uuid,
  p_montant integer,
  p_type text,
  p_ebook_id uuid default null,
  p_description text default null
)
returns public.credit_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
  v_transaction public.credit_transactions;
begin
  update public.profiles
  set
    credits_pages = greatest(0, credits_pages + p_montant),
    total_credits_utilises = total_credits_utilises + (case when p_montant < 0 then -p_montant else 0 end),
    updated_at = now()
  where id = p_profile_id
  returning credits_pages into v_new_balance;

  if not found then
    raise exception 'Profile % not found', p_profile_id;
  end if;

  insert into public.credit_transactions (profile_id, montant, type, description, ebook_id, balance_after)
  values (p_profile_id, p_montant, p_type, p_description, p_ebook_id, v_new_balance)
  returning * into v_transaction;

  return v_transaction;
end;
$$;

-- CRITICAL: Postgres grants EXECUTE on new functions to PUBLIC by default,
-- which anon/authenticated inherit. Without this revoke, any logged-in user
-- could call apply_credit_transaction directly over PostgREST's /rpc/
-- endpoint and mint themselves unlimited free credits.
revoke execute on function public.apply_credit_transaction(uuid, integer, text, uuid, text) from public, anon, authenticated;
grant execute on function public.apply_credit_transaction(uuid, integer, text, uuid, text) to service_role;
