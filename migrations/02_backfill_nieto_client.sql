-- =====================================================================
-- 02 · BACKFILL ORPHANED CLIENT ATTRIBUTION
-- PROJECT: campaignintelligence  (azpapwtnrbzywlnxxecz)
-- =====================================================================
-- 19,403 leads across 6 campaigns have client_name = NULL. All six are
-- Nieto campaigns from before client IDs were being assigned. The sync
-- logs them as client=Unassigned. Left alone, they silently drop out of
-- every per-client report.
-- =====================================================================

begin;

-- Preview first. Expect 6 campaigns, 19,403 leads, all named 'Nieto %'.
select c.name, count(*) as leads
from public.leads l
join public.campaigns c on c.id = l.campaign_id
where l.client_name is null
group by 1
order by 2 desc;

update public.leads l
set client_name = 'Nieto Technology Partners',
    updated_at  = now()
from public.campaigns c
where c.id = l.campaign_id
  and l.client_name is null
  and c.name ilike 'Nieto%';

update public.campaigns
set client_name = 'Nieto Technology Partners',
    updated_at  = now()
where client_name is null
  and name ilike 'Nieto%';

-- Expect 0. If non-zero, there are NULL-client leads outside the Nieto set
-- and you should inspect before committing.
select count(*) as remaining_unassigned
from public.leads
where client_name is null;

commit;
