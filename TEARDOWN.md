# Teardown Runbook — CRM automation

**Status 2026-08-13:** Salvage is done (`public.suppression` = 2,658 with names).
`smartlead-supabase-sync` is still healthy (last `public.leads.synced_at` 2026-08-13 00:00 UTC).
Railway `agency-intel-*` is **not** deleted — the agent token cannot access that project.
Josh still does Steps 2–4 in the dashboards. Agent must not pause CRM automation.

Canonical map: `DATA_MAP.md` and `_meta.*` on campaignintelligence.

Ordering matters. The writer dies before the database does, or the sync
spends its last hours writing errors into a project you're deleting.

---

## Step 0 · Confirm before touching anything

In the Railway dashboard, open `clientdatabase-agency-intel-sync` →
`agency-intel-sync` → **Variables** and read `SUPABASE_URL`.

- Contains `klomihumrgwoixbzxypr` → correct, proceed.
- Contains `azpapwtnrbzywlnxxecz` → **STOP.** That's the live project.
  Everything below is wrong and would break current reporting.

This check exists because the Railway API does not expose variable values
to connected apps, so it could not be verified programmatically.

---

## Step 1 · Salvage (do first, it's the only irreversible loss)

Run `load_suppression.sql` against **campaignintelligence**
(`azpapwtnrbzywlnxxecz`), then `migrations/01_suppression_verify.sql`.

Expect `total = 2658`. Do not continue until you see that number.

`suppression_hostile_2658.csv` is a flat backup independent of any database.
Keep it somewhere outside Supabase.

---

## Step 2 · Kill the writer

Railway → `clientdatabase-agency-intel-sync`:

1. Delete service `agency-intel-sync` (`ca287a58-da65-4368-8c8e-ffbab9dd7fcf`)
2. Delete service `agency-intel-web` (`30e196bb-a38d-4518-99b7-1c252d561f16`)
3. Delete the project

CLI equivalent:

```bash
railway link --project 3fcadb86-beb3-458f-8565-8c1aeb98ea6c
railway service delete agency-intel-sync
railway service delete agency-intel-web
```

This is what stops the hourly 401 loop and the duplicate HeyReach writes.

---

## Step 3 · Confirm nothing else broke

`smartlead-supabase-sync` (project `30975433-b55f-4cd5-82d6-96b2202a89ab`)
is the keeper. Watch one full cycle.

```bash
railway logs --service smartlead-supabase-sync
```

Healthy output ends with a totals line in the shape of:

```
[sync] totals — campaigns: 58, sequence_steps: 114, leads: 183963, sends: 166017, messages: 5043
```

Also confirm freshness in campaignintelligence:

```sql
select max(synced_at) from public.leads;   -- should be within the last few hours
```

---

## Step 4 · Pause, wait, then delete

Supabase → `CRM automation` (`klomihumrgwoixbzxypr`) → Settings → **Pause**.

Leave it paused **7 days**. Pausing is reversible; deleting is not. If
nothing has broken by then, delete the project.

Before deleting, note what goes with it — all idle, but gone for good:

| Table | Rows | Last write |
|---|---|---|
| `contact_campaigns` | 12,492 | Aug 12 (duplicate HeyReach writes) |
| `webhook_events` | 3,936 | Aug 1 |
| `interaction_log` | 1,724 | Jul 18 |
| `contacts` | 1,089 | Aug 12 (duplicate HeyReach writes) |
| `review_queue` | 658 | Jul 29 |
| `hubspot_cleanup_approval_queue` | 252 | Jul 18 |
| `hubspot_cleanup_audit_reports` | 149 | Jul 18 |
| `fireflies_transcripts` | 52 | Jul 18 |
| `leads` | 139,748 | **Jul 22** (frozen; superseded) |

The reply-management chain (`webhook_events` → `identity_map` →
`review_queue` → `interaction_log`) was the landing zone for the reply
handler's one-way push. If that ever gets rebuilt, it goes in
`campaignintelligence` under a `crm` schema, not in a separate project.

If you want any of it kept, export to CSV from the dashboard before
deleting. Total is a few MB.

---

## Step 5 · Hygiene (independent of the teardown)

Run in this order, reading the verification output of each before moving on:

| File | Project | Effect |
|---|---|---|
| `02_backfill_nieto_client.sql` | campaignintelligence | 19,403 orphaned leads get a client |
| `03_consolidate_client_schemas.sql` | campaignintelligence | one per-client convention |
| `04_reclaim_scrape_leads.sql` | **google-maps-scraper-leads** | reclaims ~270 MB |
| `05_purge_leads_staging.sql` | campaignintelligence | drains a 39 MB buffer |
| `06_registry_and_overlap_guard.sql` | campaignintelligence | registry + overlap view |

`04` runs against a **different project** than the others. Check the
connection before running it.

---

## End state

Two projects, one clear boundary:

- **`google-maps-scraper-leads`** — raw acquisition only. Scrapers,
  parcels, permits, Maps. Never campaign-aware.
- **`campaignintelligence`** — system of record. `public` for shared and
  Smartlead-mirrored tables, `client_<slug>` schemas per client,
  `_meta` for the registry.

`_meta.data_domains` and `_meta.retired_systems` mean the next session can
read the answer out of the database instead of rediscovering it.
