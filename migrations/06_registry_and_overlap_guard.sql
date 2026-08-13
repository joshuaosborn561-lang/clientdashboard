-- =====================================================================
-- 06 · POPULATE _meta  (campaignintelligence / azpapwtnrbzywlnxxecz)
-- =====================================================================
-- [REVISED 2026-08-13]
--
-- DO NOT apply the original 06 from CURSOR_PROMPT.md.
-- That version used a different client_registry PK (smartlead_client_id),
-- marked Culture Fits / TechEvolution as verified=false (they are verified),
-- and would have claimed Railway workers were already deleted.
--
-- DDL already applied as migration `estate_meta_registry_and_views`.
-- Views already exist: public.v_leads_by_campaign, public.v_cross_client_overlap.
-- This file is the idempotent data load matching the LIVE columns.
--
-- Live _meta columns (do not invent others):
--   estate:           sort_order, topic, rule
--   data_domains:     domain, owner_project, project_ref, canonical_location, description
--   client_registry:  slug, client_name, smartlead_client_id, schema_name, in_master_leads, verified, note
--   write_rules:      writer, target_project, project_ref, may_write, must_not_write
--   retired_systems:  name, retired_on, status, reason
--
-- Client is Vasco, not Basco.
-- =====================================================================

insert into _meta.estate (sort_order, topic, rule) values
  (10, 'two_projects', 'There are exactly two live data projects. campaignintelligence (azpapwtnrbzywlnxxecz) is the system of record for every sourced lead that entered a campaign. google-maps-scraper-leads (kemvxzhcxvynmoutwdrh) is raw acquisition only: Maps, parcels, permits, property-finder. Never write campaign or Smartlead data into the maps project. Never write parcel/maps raw data into campaignintelligence. Do not create a third project.'),
  (20, 'master_file', 'public.leads is the master file of all campaign leads. Split by campaign via campaign_id and public.v_leads_by_campaign. Do not duplicate campaign leads into client_* schemas. client_name is the Smartlead business logo, not the contact person. Zero NULL client_name is the invariant.'),
  (30, 'per_client_lists', 'client_<slug> schemas hold prospect lists that have not been loaded into Smartlead yet. That is not a second master. Current: client_vasco (Vasco Warranty lists), client_peterson (Roofs by Peterson maps leads). The client is Vasco, not Basco. Schema client_basco and public.basco_* must not exist.'),
  (40, 'suppression', 'Before any insert into public.leads, check public.v_suppression_check. public.suppression is the global do-not-contact file (2658 hostiles salvaged from CRM automation). All 2658 suppressed emails are still also in public.leads. Do not delete those leads without Josh.'),
  (50, 'maps_canonical', 'In google-maps-scraper-leads, permit_parcel.parcels is canonical for parcels. public.scrape_leads is for contractor / property-finder jobs only. Do not write job_id like permit-parcels% into scrape_leads. The Maps scraper sync_to_supabase still dual-writes parcels; that lives in a different repo.'),
  (60, 'do_not_resurrect', 'CRM automation (klomihumrgwoixbzxypr) is retired and frozen. Do not write to it. Do not export reply-management tables. Pause or delete it from the Supabase dashboard after a 7-day watch; the agent must not pause it. Railway agency-intel-sync and agency-intel-web should be deleted; smartlead-supabase-sync must not be touched.'),
  (70, 'nieto', 'Nieto Technology Partners has 19403 master leads and no Smartlead client id. Do not invent one. Campaign names are Nieto %.'),
  (80, 'new_chat_start_here', 'A new chat should: 1) select * from _meta.estate order by sort_order. 2) select * from _meta.client_registry. 3) select * from _meta.write_rules. 4) select * from _meta.data_domains. That is the map.'),
  (90, 'cross_client_overlap', 'public.v_cross_client_overlap lists emails that sit under two client_name values in public.leads. As of 2026-08-13: 214 Bolder+Parlay, 15 Bolder+Goliath (competing cybersecurity offers), 2 Bolder+Culture Fits. Informational. Do not delete without Josh.')
on conflict (sort_order) do update
  set topic = excluded.topic,
      rule  = excluded.rule;

insert into _meta.data_domains (domain, owner_project, project_ref, canonical_location, description) values
  ('campaign_leads_master', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'public.leads', 'Master file of every lead that reached a Smartlead campaign. Filter by client_name + campaign_id. View: public.v_leads_by_campaign. Do not split into per-client tables.'),
  ('campaign_sends', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'public.sends', 'Send events from Smartlead. Also public.messages, public.sequence_steps.'),
  ('campaigns', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'public.campaigns', 'client_name is the business logo from Smartlead.'),
  ('suppression', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'public.suppression', 'DNC emails with names. View: public.v_suppression_check. Check before every campaign load.'),
  ('per_client_vasco', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'client_vasco.{companies,contacts,leads}', 'Vasco Warranty prospect lists. Not in public.leads yet. Client is Vasco, not Basco.'),
  ('per_client_peterson', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'client_peterson.{companies,contacts,leads}', 'Roofs by Peterson maps leads. Not in public.leads yet.'),
  ('goliath_working_lists', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'gc.{contacts,companies}', 'Goliath working lists inside campaignintelligence. Different from maps project gc.shovels_gc. Do not merge blindly.'),
  ('lead_prep_jobs', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'lp.*', 'Lead-prep job runner. Promote into public.leads only after suppression check.'),
  ('maps_extract_stray', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'public.maps_leads', 'Maps extract sitting in the wrong project. Canonical maps leads are kemvxzhcxvynmoutwdrh.public.scrape_leads. Do not grow this table.'),
  ('property_finder_shell', 'campaignintelligence', 'azpapwtnrbzywlnxxecz', 'property_pm_finder.*', 'Empty shell in campaignintelligence. Canonical property_pm_finder is on kemvxzhcxvynmoutwdrh. Do not write here.'),
  ('raw_scrape_leads', 'google-maps-scraper-leads', 'kemvxzhcxvynmoutwdrh', 'public.scrape_leads', 'Contractor and property-finder jobs only. Not campaign-aware. Do not write permit-parcels% here.'),
  ('parcels', 'google-maps-scraper-leads', 'kemvxzhcxvynmoutwdrh', 'permit_parcel.parcels', 'Canonical parcels. Also operators, classifications, sync_runs, sync_log.'),
  ('property_finder_canonical', 'google-maps-scraper-leads', 'kemvxzhcxvynmoutwdrh', 'property_pm_finder.*', 'Canonical property-finder.'),
  ('maps_gc_contractors', 'google-maps-scraper-leads', 'kemvxzhcxvynmoutwdrh', 'gc.{shovels_gc,shovels_gc_v2}', 'Shovels contractor data in the maps project. Not the same as campaignintelligence.gc.contacts.')
on conflict (domain) do update
  set owner_project       = excluded.owner_project,
      project_ref         = excluded.project_ref,
      canonical_location  = excluded.canonical_location,
      description         = excluded.description,
      updated_at          = now();

insert into _meta.client_registry
  (slug, client_name, smartlead_client_id, schema_name, in_master_leads, verified, note)
values
  ('bolder-cyber-partners', 'Bolder Cyber Partners', 542838, null, true, true, 'Master leads. Contact: Mike Trpkosh. Largest client.'),
  ('salesglider', 'SalesGlider', 345263, null, true, true, 'Master leads. Agency book. Many of these emails are also in public.suppression.'),
  ('nieto-technology-partners', 'Nieto Technology Partners', null, null, true, true, 'Master leads. No Smartlead client id. Campaigns named Nieto %. Do not invent an id.'),
  ('goliath-cybersecurity', 'Goliath Cybersecurity', 548611, null, true, true, 'Master leads. Contact: Dave Ackley. Working lists also live in campaignintelligence.gc.'),
  ('parlay-tech', 'Parlay Tech', 418274, null, true, true, 'Master leads. Contact: Randy Haba.'),
  ('msrs', 'MSRS', 446286, null, true, true, 'Master leads. Contact: Randy Gaines.'),
  ('culture-fits', 'Culture Fits', 418275, null, true, true, 'Master leads. Contact: TJ Johnson. Verified against Smartlead /clients on 2026-08-12. Do not mark unverified.'),
  ('techevolution', 'TechEvolution', 521881, null, true, true, 'Master leads. Contact: Corey Tapper. Verified against Smartlead /clients on 2026-08-12. Do not mark unverified.'),
  ('vasco-warranty', 'Vasco Warranty', 548609, 'client_vasco', false, true, '0 rows in public.leads. Prospect lists in client_vasco. Client name is Vasco, not Basco. Contact: Carlos Vasquez.'),
  ('roofs-by-peterson', 'Roofs by Peterson', 548610, 'client_peterson', false, true, '0 rows in public.leads. Maps leads in client_peterson.leads. Contact: Kyle Peterson.')
on conflict (slug) do update
  set client_name          = excluded.client_name,
      smartlead_client_id  = excluded.smartlead_client_id,
      schema_name          = excluded.schema_name,
      in_master_leads      = excluded.in_master_leads,
      verified             = excluded.verified,
      note                 = excluded.note;

insert into _meta.write_rules (writer, target_project, project_ref, may_write, must_not_write) values
  ('smartlead-supabase-sync',
   'campaignintelligence',
   'azpapwtnrbzywlnxxecz',
   'public.leads, public.campaigns, public.sends, public.messages, public.sequence_steps, public.sync_log, public.lead_categories',
   'Do not touch this Railway worker (project 30975433-b55f-4cd5-82d6-96b2202a89ab). Do not write to client_* schemas, gc, lp, maps_leads, or the maps project.'),
  ('maps-scraper-sync_to_supabase',
   'google-maps-scraper-leads',
   'kemvxzhcxvynmoutwdrh',
   'permit_parcel.parcels (canonical), permit_parcel.operators, public.scrape_leads (contractors / property-finder jobs only), property_pm_finder.*, gc.shovels_gc, gc.shovels_gc_v2',
   'Do not write permit-parcels* into public.scrape_leads. Do not write anything into campaignintelligence. Dual-write of parcels into scrape_leads is a bug in a different repo.'),
  ('lead-prep-lp-job-runner',
   'campaignintelligence',
   'azpapwtnrbzywlnxxecz',
   'lp.*',
   'Stay inside lp. Promote into public.leads only after checking public.v_suppression_check and with client_name + campaign_id set.'),
  ('manual-or-agent-sql',
   'campaignintelligence',
   'azpapwtnrbzywlnxxecz',
   '_meta.*, client_vasco.*, client_peterson.*, public.suppression',
   'Always confirm project_id before execute_sql. campaignintelligence = azpapwtnrbzywlnxxecz. maps = kemvxzhcxvynmoutwdrh. Never recreate client_basco or public.basco_*. Never write campaign leads into the maps project.')
on conflict (writer) do update
  set target_project  = excluded.target_project,
      project_ref     = excluded.project_ref,
      may_write       = excluded.may_write,
      must_not_write  = excluded.must_not_write;

insert into _meta.retired_systems (name, retired_on, status, reason) values
  ('CRM automation',
   date '2026-08-12',
   'still_live_frozen',
   'Supabase project klomihumrgwoixbzxypr. Paid, broken, leads frozen since 2026-07-22. Hostiles salvaged into campaignintelligence.public.suppression. Do not write. Do not export reply-management. Josh pauses or deletes from the dashboard after 7 days. Agent must not pause it.'),
  ('agency-intel-sync',
   date '2026-08-12',
   'delete_pending_token_unauthorized',
   'Railway service ca287a58 in project 3fcadb86-beb3-458f-8565-8c1aeb98ea6c. Hourly 401. Injected RAILWAY_TOKEN cannot access this project. Josh deletes it in the Railway dashboard. Do not redeploy.'),
  ('agency-intel-web',
   date '2026-08-12',
   'delete_pending_token_unauthorized',
   'Railway service 30e196bb in the same project as agency-intel-sync. Delete with the sync worker. Do not touch smartlead-supabase-sync.')
on conflict (name) do update
  set retired_on = excluded.retired_on,
      status     = excluded.status,
      reason     = excluded.reason;

-- Informational only. Do not delete overlap rows from here.
-- select clients, count(*) as emails from public.v_cross_client_overlap group by 1 order by 2 desc;
