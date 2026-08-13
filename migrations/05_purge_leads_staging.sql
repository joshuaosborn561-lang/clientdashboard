-- =====================================================================
-- 05 · PURGE DRAINED STAGING ROWS
-- PROJECT: campaignintelligence  (azpapwtnrbzywlnxxecz)
-- =====================================================================
-- public.leads_staging holds 103,498 rows / 39 MB. Every row except two
-- smoke-test rows is imported = true, meaning already pushed to Smartlead.
-- It is a transfer buffer that has never been drained.
--
-- The authoritative record of what was loaded lives in public.leads and
-- public.lead_import_runs, so purged staging rows are not a loss.
-- =====================================================================

begin;

-- Snapshot what is being removed, per campaign.
create table if not exists public.leads_staging_purge_log (
  purged_at     timestamptz not null default now(),
  campaign_name text,
  rows_purged   bigint
);

insert into public.leads_staging_purge_log (campaign_name, rows_purged)
select campaign_name, count(*)
from public.leads_staging
where imported = true
group by 1;

-- Keep 30 days for traceability; drop the rest.
delete from public.leads_staging
where imported = true
  and created_at < now() - interval '30 days';

commit;

vacuum full public.leads_staging;

select count(*) as rows_remaining,
       count(*) filter (where imported = false) as still_pending,
       pg_size_pretty(pg_total_relation_size('public.leads_staging')) as size_after
from public.leads_staging;

-- Recurring hygiene. Run monthly, or wire into the import job.
--   delete from public.leads_staging
--   where imported = true and created_at < now() - interval '30 days';
