create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  headline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled ProofFolio',
  slug text not null,
  selected_template_id text not null default 'developer-signature',
  status text not null default 'draft' check (status in ('draft', 'published')),
  onboarding_state text not null default 'sources' check (onboarding_state in ('sources', 'evidence', 'review', 'template', 'ready')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, slug)
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  source_type text not null check (source_type in ('cv', 'certificate', 'manual_project', 'github_placeholder')),
  title text not null,
  description text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_drafts (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  summary text not null,
  stack jsonb not null default '[]'::jsonb,
  evidence_references jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'approved', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposal_reviews (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  source_evidence_id uuid references public.evidence_items (id) on delete set null,
  proposed_title text not null,
  proposed_summary text not null,
  proposal_type text not null default 'prototype_project',
  review_state text not null default 'pending' check (review_state in ('pending', 'approved', 'edited', 'rejected')),
  edited_content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolios_owner_user_id_idx on public.portfolios (owner_user_id);
create index if not exists evidence_items_owner_portfolio_idx on public.evidence_items (owner_user_id, portfolio_id);
create index if not exists project_drafts_owner_portfolio_idx on public.project_drafts (owner_user_id, portfolio_id);
create index if not exists proposal_reviews_owner_portfolio_idx on public.proposal_reviews (owner_user_id, portfolio_id);
create unique index if not exists proposal_reviews_unique_source_type_idx
  on public.proposal_reviews (portfolio_id, owner_user_id, source_evidence_id, proposal_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists portfolios_set_updated_at on public.portfolios;
create trigger portfolios_set_updated_at
before update on public.portfolios
for each row execute function public.set_updated_at();

drop trigger if exists evidence_items_set_updated_at on public.evidence_items;
create trigger evidence_items_set_updated_at
before update on public.evidence_items
for each row execute function public.set_updated_at();

drop trigger if exists project_drafts_set_updated_at on public.project_drafts;
create trigger project_drafts_set_updated_at
before update on public.project_drafts
for each row execute function public.set_updated_at();

drop trigger if exists proposal_reviews_set_updated_at on public.proposal_reviews;
create trigger proposal_reviews_set_updated_at
before update on public.proposal_reviews
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.evidence_items enable row level security;
alter table public.project_drafts enable row level security;
alter table public.proposal_reviews enable row level security;

create policy "profiles_select_own"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "portfolios_select_own"
on public.portfolios for select to authenticated
using (owner_user_id = auth.uid());

create policy "portfolios_insert_own"
on public.portfolios for insert to authenticated
with check (owner_user_id = auth.uid());

create policy "portfolios_update_own"
on public.portfolios for update to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "portfolios_delete_own"
on public.portfolios for delete to authenticated
using (owner_user_id = auth.uid());

create policy "evidence_items_select_own"
on public.evidence_items for select to authenticated
using (owner_user_id = auth.uid());

create policy "evidence_items_insert_own"
on public.evidence_items for insert to authenticated
with check (owner_user_id = auth.uid());

create policy "evidence_items_update_own"
on public.evidence_items for update to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "evidence_items_delete_own"
on public.evidence_items for delete to authenticated
using (owner_user_id = auth.uid());

create policy "project_drafts_select_own"
on public.project_drafts for select to authenticated
using (owner_user_id = auth.uid());

create policy "project_drafts_insert_own"
on public.project_drafts for insert to authenticated
with check (owner_user_id = auth.uid());

create policy "project_drafts_update_own"
on public.project_drafts for update to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "project_drafts_delete_own"
on public.project_drafts for delete to authenticated
using (owner_user_id = auth.uid());

create policy "proposal_reviews_select_own"
on public.proposal_reviews for select to authenticated
using (owner_user_id = auth.uid());

create policy "proposal_reviews_insert_own"
on public.proposal_reviews for insert to authenticated
with check (owner_user_id = auth.uid());

create policy "proposal_reviews_update_own"
on public.proposal_reviews for update to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "proposal_reviews_delete_own"
on public.proposal_reviews for delete to authenticated
using (owner_user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "evidence_files_select_own"
on storage.objects for select to authenticated
using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "evidence_files_insert_own"
on storage.objects for insert to authenticated
with check (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "evidence_files_update_own"
on storage.objects for update to authenticated
using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "evidence_files_delete_own"
on storage.objects for delete to authenticated
using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);
