-- =====================================================================
-- 03 · CONSOLIDATE PER-CLIENT TABLES ONTO ONE CONVENTION
-- PROJECT: campaignintelligence  (azpapwtnrbzywlnxxecz)
-- =====================================================================
-- SUPERSEDED 2026-08-13. Do not run this file.
-- The client is Vasco, not Basco. Live counts were 368/214/0, not 25/25/0.
-- Already executed as:
--   rename_client_basco_to_vasco
--   drop_public_prefixed_client_tables
-- Canonical location: client_vasco / client_peterson.
-- See DATA_MAP.md and _meta.estate.
--
-- Original notes below are stale (Basco + 25/25 gate). Kept for history.
-- =====================================================================
-- Two naming conventions exist for the same concept:
--
--   client_basco.{leads,contacts,companies}       0 rows  (empty shells)
--   client_peterson.{leads,contacts,companies}    0 rows  (empty shells)
--   public.basco_{leads,contacts,companies}       0 / 25 / 25
--   public.peterson_{leads,contacts,companies}    1310 / 0 / 0
--
-- Verified: client_peterson.leads and public.peterson_leads have identical
-- column names AND identical ordinal positions (34/34), so positional
-- INSERT ... SELECT * is safe.
--
-- WINNER: client_<name> schemas. Scales per client, keeps `public` for
-- shared tables, and matches what the Maps Scraper MCP's
-- ensure_client_tables() expects.
-- =====================================================================

begin;

-- ---- Move data into the winning convention -------------------------
insert into client_basco.companies     select * from public.basco_companies;
insert into client_basco.contacts      select * from public.basco_contacts;
insert into client_basco.leads         select * from public.basco_leads;

insert into client_peterson.companies  select * from public.peterson_companies;
insert into client_peterson.contacts   select * from public.peterson_contacts;
insert into client_peterson.leads      select * from public.peterson_leads;

-- ---- Verify BEFORE dropping ----------------------------------------
-- Expect: basco 25/25/0, peterson 0/0/1310. Do not proceed on a mismatch.
select 'client_basco.companies'    t, count(*) from client_basco.companies
union all select 'client_basco.contacts',     count(*) from client_basco.contacts
union all select 'client_basco.leads',        count(*) from client_basco.leads
union all select 'client_peterson.companies', count(*) from client_peterson.companies
union all select 'client_peterson.contacts',  count(*) from client_peterson.contacts
union all select 'client_peterson.leads',     count(*) from client_peterson.leads
order by 1;

commit;

-- =====================================================================
-- RUN THIS BLOCK ONLY AFTER eyeballing the counts above.
-- =====================================================================
-- begin;
-- drop table public.basco_companies, public.basco_contacts, public.basco_leads;
-- drop table public.peterson_companies, public.peterson_contacts, public.peterson_leads;
-- commit;

-- ---- Template for every future client ------------------------------
-- create schema if not exists client_<slug>;
-- create table client_<slug>.leads     (like client_peterson.leads     including all);
-- create table client_<slug>.contacts  (like client_peterson.contacts  including all);
-- create table client_<slug>.companies (like client_peterson.companies including all);
