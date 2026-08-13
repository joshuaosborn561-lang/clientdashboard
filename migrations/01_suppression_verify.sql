-- =====================================================================
-- 01 · SUPPRESSION VERIFY
-- PROJECT: campaignintelligence  (azpapwtnrbzywlnxxecz)
-- RUN AFTER: load_suppression.sql
-- =====================================================================
-- The suppression list holds 2,658 contacts recovered from the retired
-- CRM automation project, where they were flagged is_hostile. Losing it
-- means re-emailing people who already told us to stop.
-- =====================================================================

-- Expect: total = 2658
select count(*) as total,
       count(first_name) as with_names,
       count(distinct email_domain) as distinct_domains
from public.suppression;

-- Expect: 0 rows. Anything here is a live lead that should be suppressed.
select l.client_name, count(*) as suppressed_leads_still_in_leads
from public.leads l
join public.suppression s on lower(trim(l.email)) = s.email
group by 1
order by 2 desc;

-- Reusable guard. Check every list against this BEFORE loading to Smartlead.
create or replace view public.v_suppression_check as
select l.id,
       l.email,
       l.client_name,
       l.campaign_id,
       s.reason as suppression_reason
from public.leads l
join public.suppression s on lower(trim(l.email)) = s.email;

comment on view public.v_suppression_check is
  'Live leads that match the do-not-contact list. Should always be empty. Investigate any rows.';
