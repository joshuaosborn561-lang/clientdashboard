# Cursor Prompt — Supabase Consolidation & CRM Automation Retirement

**DONE 2026-08-13.** Do not re-run this prompt as a fresh execution plan.
Canonical map for a new chat: **DATA_MAP.md** and `_meta.*` on
campaignintelligence (`azpapwtnrbzywlnxxecz`). Client is **Vasco**, not Basco.
Culture Fits (418275) and TechEvolution (521881) are verified — do not apply
the original `06` that marked them `verified = false`.

Historical prompt follows.

---

Paste everything below into Cursor. The `migrations/` folder,
`load_suppression.sql`, and `TEARDOWN.md` should be in the workspace.

---

I'm consolidating my Supabase estate for a B2B cold outbound agency. An
audit found a half-finished migration: two projects have been writing
simultaneously, one of them broken. I have SQL migrations already written
and verified against the live schemas. Your job is to execute them safely,
in order, verifying at each gate — not to redesign anything.

## The estate

| Project | Ref | Role |
|---|---|---|
| `campaignintelligence` | `azpapwtnrbzywlnxxecz` | **System of record.** 177k leads, 168k sends, synced hourly. Keep. |
| `google-maps-scraper-leads` | `kemvxzhcxvynmoutwdrh` | **Raw acquisition.** Scrapes, parcels, permits. Keep. |
| `CRM automation` | `klomihumrgwoixbzxypr` | **Retiring.** Superseded predecessor. |

Two Railway workers:

- `smartlead-supabase-sync` (project `30975433-b55f-4cd5-82d6-96b2202a89ab`) → writes to campaignintelligence. **Healthy. Keep.**
- `agency-intel-sync` + `agency-intel-web` (project `3fcadb86-beb3-458f-8565-8c1aeb98ea6c`) → writes to CRM automation. **Delete.**

## Why CRM automation is being retired

It was the agency intelligence platform (Mar–Apr 2026): a Next.js app plus
an hourly sync, with Gemini inferring ICP and offer angle per campaign.
`campaignintelligence` is a simpler rebuild of the same idea that was never
finished switching over. Current state of the old sync:

- Smartlead API returns **401 on every run, every hour** — the key was
  rotated. Its Smartlead campaigns froze on 2026-07-25.
- The HeyReach half still runs but writes **empty shells**: 27 rows for 14
  distinct campaigns (each written twice under two duplicate client rows),
  `send_volume = 0`, `positive_reply_count = 0`, `reply_rate` null on all 27.

So nothing of value is being produced. One asset must be salvaged first:
**2,658 contacts flagged `is_hostile`**, a hand-built do-not-contact list
with no copy anywhere else.

## Rules

1. **Never run a migration without reading its verification output first.**
   Every file has gate queries. If a gate returns an unexpected number,
   stop and report rather than proceeding.
2. **Check which project you're connected to before every migration.**
   `04_reclaim_scrape_leads.sql` targets `google-maps-scraper-leads`; all
   others target `campaignintelligence`. Running `04` against the wrong
   project does nothing useful and the delete would error — but confirm
   anyway.
3. **Do not modify the migration SQL.** It was written against verified
   live schemas: column order was confirmed identical for the per-client
   table copies, and parcel coverage was confirmed at 315,841 of 315,841
   before the delete in `04` was written. Changing the SQL invalidates
   those checks.
4. **Never `DROP TABLE` before the corresponding verification passes.**
   `03` deliberately leaves its drops commented out. Leave them commented
   until counts are confirmed, then uncomment and run separately.
5. **Deletion of Railway services and Supabase projects is manual.** Do not
   attempt to script it. Follow `TEARDOWN.md` and tell me when it's my turn.
6. **Pause, don't delete, the old Supabase project.** Seven-day wait.
   Pausing is reversible.

## Order of execution

**Phase 1 — Salvage** (blocks everything else)
1. Run `load_suppression.sql` against `campaignintelligence`. Idempotent
   (`ON CONFLICT`), safe to re-run. 900 of 2,658 rows are already loaded;
   this tops up the remainder and backfills names.
2. Run `migrations/01_suppression_verify.sql`. **Gate: `total` must be 2658.**
   Stop if it isn't.

**Phase 2 — Stop the writer** (manual, mine)
3. Tell me to do Steps 0–3 of `TEARDOWN.md`. Wait for my confirmation that
   `agency-intel-sync` is deleted and `smartlead-supabase-sync` still runs
   clean. Do not continue on your own.

**Phase 3 — Hygiene** (yours, one at a time)
4. `02_backfill_nieto_client.sql` — **gate: `remaining_unassigned` = 0**
5. `03_consolidate_client_schemas.sql` — **gate: basco 25/25/0, peterson
   0/0/1310.** Then uncomment the drop block and run it separately.
6. `04_reclaim_scrape_leads.sql` — *(different project)* — **gate:
   `not_covered` = 0.** Expect ~278 MB → single-digit MB.
7. `05_purge_leads_staging.sql` — **gate: `still_pending` unchanged at 2**
8. `06_registry_and_overlap_guard.sql` — no gate; report the overlap counts

**Phase 4 — Report**
9. Summarize: rows suppressed, storage reclaimed, leads reattributed,
   tables dropped, and anything that didn't match expectations.

## Two things I need you to flag, not fix

- **Client ID mismatch.** The database says `418275 = Culture Fits` and
  `521881 = TechEvolution`. My own notes say 418275 is Parlay and 521881 is
  TJ Johnson. `06` records both as `verified = false`. Don't guess — I'll
  confirm against Smartlead. Flag it in your final report.
- **Recurring parcel duplication.** The Maps Scraper MCP's
  `sync_to_supabase` writes parcels into both `permit_parcel.parcels`
  (canonical) and `public.scrape_leads` (redundant). `04` cleans up today's
  mess but not the cause. If that code is in this workspace, identify the
  write path and propose a patch. Do not apply it without showing me first.

## Definition of done

- `public.suppression` holds 2,658 rows in `campaignintelligence`
- `public.leads` has zero NULL `client_name`
- Per-client data lives only in `client_<slug>` schemas
- `public.scrape_leads` is single-digit MB and holds only contractor and
  property-finder rows
- `_meta.data_domains`, `_meta.client_registry`, `_meta.retired_systems`
  populated
- `public.v_suppression_check` and `public.v_cross_client_overlap` exist
- `agency-intel-sync` and `agency-intel-web` deleted; CRM automation paused
