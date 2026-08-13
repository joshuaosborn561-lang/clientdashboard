-- =====================================================================
-- 04 · RECLAIM DUPLICATED PARCEL STORAGE
-- PROJECT: google-maps-scraper-leads  (kemvxzhcxvynmoutwdrh)   <-- NOT campaignintelligence
-- =====================================================================
-- public.scrape_leads is 278 MB / 322,969 rows. Only 5,439 rows have an
-- email. The bulk is four permit-parcels-* jobs that re-store data already
-- held canonically in permit_parcel.parcels, with the full raw JSONB
-- duplicated per row.
--
-- scrape_leads.place_id encodes as: parcel:{county}:{account_id}
--
-- VERIFIED before writing this migration:
--   315,841 parcel rows in scrape_leads
--   315,841 covered by permit_parcel.parcels on (county, account_id)
--         0 NOT covered
--
-- So deletion is lossless. Re-verify below anyway before deleting.
-- =====================================================================

-- ---- Gate. MUST return not_covered = 0. -----------------------------
select count(*) as total_parcel_rows,
       count(*) filter (where not exists (
         select 1 from permit_parcel.parcels p
         where p.county     = split_part(sl.place_id, ':', 2)
           and p.account_id = split_part(sl.place_id, ':', 3)
       )) as not_covered
from public.scrape_leads sl
where sl.job_id like 'permit-parcels%';

-- ---- Delete only if the gate returned 0 -----------------------------
begin;

delete from public.scrape_leads
where job_id like 'permit-parcels%';

-- Expect ~7,128 rows left: the Shovels contractor job (6,124, of which
-- 5,435 carry an email) plus the small property_pm_finder runs.
select job_id, count(*) rows,
       count(*) filter (where email is not null and email <> '') with_email
from public.scrape_leads
group by 1 order by 2 desc;

commit;

vacuum full public.scrape_leads;

-- Expect roughly 3-6 MB, down from 278 MB.
select pg_size_pretty(pg_total_relation_size('public.scrape_leads')) as size_after;

-- ---- Stop the recurrence -------------------------------------------
-- The Maps Scraper MCP's sync_to_supabase writes parcels to BOTH
-- permit_parcel.parcels and public.scrape_leads. Only the former is
-- canonical. Fix the writer or this grows back on the next sync.
