drop policy if exists "evidence_items_insert_own" on public.evidence_items;
drop policy if exists "evidence_items_update_own" on public.evidence_items;
drop policy if exists "project_drafts_insert_own" on public.project_drafts;
drop policy if exists "project_drafts_update_own" on public.project_drafts;
drop policy if exists "proposal_reviews_insert_own" on public.proposal_reviews;
drop policy if exists "proposal_reviews_update_own" on public.proposal_reviews;

create policy "evidence_items_insert_own"
on public.evidence_items for insert to authenticated
with check (
  owner_user_id = auth.uid()
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = evidence_items.portfolio_id
      and portfolios.owner_user_id = auth.uid()
  )
);

create policy "evidence_items_update_own"
on public.evidence_items for update to authenticated
using (owner_user_id = auth.uid())
with check (
  owner_user_id = auth.uid()
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = evidence_items.portfolio_id
      and portfolios.owner_user_id = auth.uid()
  )
);

create policy "project_drafts_insert_own"
on public.project_drafts for insert to authenticated
with check (
  owner_user_id = auth.uid()
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = project_drafts.portfolio_id
      and portfolios.owner_user_id = auth.uid()
  )
);

create policy "project_drafts_update_own"
on public.project_drafts for update to authenticated
using (owner_user_id = auth.uid())
with check (
  owner_user_id = auth.uid()
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = project_drafts.portfolio_id
      and portfolios.owner_user_id = auth.uid()
  )
);

create policy "proposal_reviews_insert_own"
on public.proposal_reviews for insert to authenticated
with check (
  owner_user_id = auth.uid()
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = proposal_reviews.portfolio_id
      and portfolios.owner_user_id = auth.uid()
  )
);

create policy "proposal_reviews_update_own"
on public.proposal_reviews for update to authenticated
using (owner_user_id = auth.uid())
with check (
  owner_user_id = auth.uid()
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = proposal_reviews.portfolio_id
      and portfolios.owner_user_id = auth.uid()
  )
);
