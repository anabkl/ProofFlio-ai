alter table public.portfolios
  add column if not exists profile_settings jsonb not null default '{}'::jsonb,
  add column if not exists design_settings jsonb not null default '{}'::jsonb;

alter table public.project_drafts
  add column if not exists repository_url text,
  add column if not exists live_demo_url text;

update public.project_drafts as project
set
  repository_url = coalesce(project.repository_url, evidence.metadata ->> 'repositoryUrl'),
  live_demo_url = coalesce(project.live_demo_url, evidence.metadata ->> 'liveDemoUrl')
from public.evidence_items as evidence
where project.evidence_references ? evidence.id::text
  and evidence.source_type = 'manual_project'
  and (project.repository_url is null or project.live_demo_url is null);

comment on column public.portfolios.profile_settings is
  'Portfolio-specific identity and section visibility/order settings used by the private editor.';

comment on column public.portfolios.design_settings is
  'Allowlisted visual preferences used by the private editor preview.';

comment on column public.project_drafts.repository_url is
  'Optional repository URL edited by the portfolio owner.';

comment on column public.project_drafts.live_demo_url is
  'Optional live demo URL edited by the portfolio owner.';
