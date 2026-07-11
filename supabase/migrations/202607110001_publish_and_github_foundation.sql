alter table public.portfolios
  add column if not exists published_at timestamptz,
  add column if not exists public_settings jsonb not null default '{}'::jsonb;

alter table public.portfolios
  drop constraint if exists portfolios_status_check;

alter table public.portfolios
  add constraint portfolios_status_check
  check (status in ('draft', 'unpublished', 'published'));

create index if not exists portfolios_slug_lookup_idx
  on public.portfolios (lower(slug));

create unique index if not exists portfolios_published_slug_unique_idx
  on public.portfolios (lower(slug))
  where status = 'published';

alter table public.evidence_items
  drop constraint if exists evidence_items_source_type_check;

alter table public.evidence_items
  add constraint evidence_items_source_type_check
  check (source_type in ('cv', 'certificate', 'manual_project', 'github_placeholder', 'github_repository'));

create table if not exists public.github_connections (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  github_user_id bigint not null,
  github_login text not null,
  github_name text,
  avatar_url text,
  encrypted_access_token text not null,
  token_scope text,
  repository_cache jsonb not null default '[]'::jsonb,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id),
  unique (github_user_id)
);

drop trigger if exists github_connections_set_updated_at on public.github_connections;
create trigger github_connections_set_updated_at
before update on public.github_connections
for each row execute function public.set_updated_at();

alter table public.github_connections enable row level security;

create policy "github_connections_select_own"
on public.github_connections for select to authenticated
using (owner_user_id = auth.uid());

create policy "github_connections_insert_own"
on public.github_connections for insert to authenticated
with check (owner_user_id = auth.uid());

create policy "github_connections_update_own"
on public.github_connections for update to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "github_connections_delete_own"
on public.github_connections for delete to authenticated
using (owner_user_id = auth.uid());

create or replace function public.get_public_portfolio(requested_slug text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with published_portfolio as (
    select
      p.id,
      p.title,
      p.slug,
      p.selected_template_id,
      p.published_at,
      p.profile_settings,
      p.design_settings,
      p.public_settings,
      p.updated_at,
      coalesce(pr.display_name, 'ProofFolio User') as display_name,
      coalesce(nullif(p.profile_settings ->> 'headline', ''), pr.headline, '') as headline
    from public.portfolios as p
    left join public.profiles as pr
      on pr.id = p.owner_user_id
    where lower(p.slug) = lower(requested_slug)
      and p.status = 'published'
    limit 1
  )
  select jsonb_build_object(
    'id', portfolio.id,
    'slug', portfolio.slug,
    'title', portfolio.title,
    'selectedTemplateId', portfolio.selected_template_id,
    'publishedAt', portfolio.published_at,
    'updatedAt', portfolio.updated_at,
    'displayName', portfolio.display_name,
    'headline', portfolio.headline,
    'profileSettings', coalesce(portfolio.profile_settings, '{}'::jsonb),
    'designSettings', coalesce(portfolio.design_settings, '{}'::jsonb),
    'publicSettings', coalesce(portfolio.public_settings, '{}'::jsonb),
    'projects', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', project.id,
          'title', coalesce(nullif(review.edited_content ->> 'title', ''), project.title),
          'summary', coalesce(nullif(review.edited_content ->> 'summary', ''), project.summary),
          'technologies', coalesce(project.stack, '[]'::jsonb),
          'repositoryUrl', project.repository_url,
          'liveDemoUrl', project.live_demo_url,
          'sourceType', evidence.source_type,
          'sourceTitle', evidence.title,
          'proofContext', coalesce(
            nullif(evidence.metadata ->> 'proofContext', ''),
            case
              when evidence.source_type = 'github_repository' then 'Source-linked project from public GitHub repository metadata.'
              when evidence.source_type = 'manual_project' then 'User-provided project evidence approved for the public portfolio.'
              else 'Approved evidence-backed project.'
            end
          ),
          'reviewState', review.review_state
        )
        order by project.updated_at desc
      )
      from public.project_drafts as project
      join lateral (
        select
          evidence.id,
          evidence.source_type,
          evidence.title,
          evidence.metadata
        from public.evidence_items as evidence
        where evidence.portfolio_id = portfolio.id
          and evidence.id in (
            select jsonb_array_elements_text(project.evidence_references)::uuid
          )
        order by evidence.created_at desc
        limit 1
      ) as evidence on true
      join lateral (
        select
          proposal.id,
          proposal.review_state,
          proposal.edited_content
        from public.proposal_reviews as proposal
        where proposal.portfolio_id = portfolio.id
          and proposal.source_evidence_id = evidence.id
          and proposal.review_state in ('approved', 'edited')
        order by proposal.updated_at desc
        limit 1
      ) as review on true
      where project.portfolio_id = portfolio.id
        and project.status = 'approved'
    ), '[]'::jsonb),
    'evidence', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', evidence.id,
          'title', evidence.title,
          'description', evidence.description,
          'sourceType', evidence.source_type,
          'proofContext', coalesce(
            nullif(evidence.metadata ->> 'proofContext', ''),
            case
              when evidence.source_type = 'certificate' then 'User-approved certificate reference.'
              when evidence.source_type = 'cv' then 'User-approved CV-derived evidence summary.'
              when evidence.source_type = 'github_repository' then 'User-approved repository evidence from public metadata.'
              else 'User-approved evidence.'
            end
          )
        )
        order by evidence.created_at desc
      )
      from public.evidence_items as evidence
      join public.proposal_reviews as proposal
        on proposal.portfolio_id = portfolio.id
       and proposal.source_evidence_id = evidence.id
       and proposal.review_state in ('approved', 'edited')
      where evidence.portfolio_id = portfolio.id
        and evidence.source_type <> 'manual_project'
    ), '[]'::jsonb),
    'proofCount', (
      select count(*)
      from public.proposal_reviews as proposal
      where proposal.portfolio_id = portfolio.id
        and proposal.review_state in ('approved', 'edited')
    )
  )
  from published_portfolio as portfolio;
$$;

create or replace function public.list_published_portfolios()
returns table (slug text, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select p.slug, p.updated_at
  from public.portfolios as p
  where p.status = 'published'
  order by p.updated_at desc;
$$;

grant execute on function public.get_public_portfolio(text) to anon, authenticated;
grant execute on function public.list_published_portfolios() to anon, authenticated;
