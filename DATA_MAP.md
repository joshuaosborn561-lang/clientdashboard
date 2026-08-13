# Data map — where leads live and where they should go

Read this first. Then in Supabase MCP, confirm `project_id` and run:

```sql
select * from _meta.estate order by sort_order;
select * from _meta.client_registry;
select * from _meta.write_rules;
select * from _meta.data_domains;
```

That is the live map. This file is the human copy. If they disagree, trust `_meta` on **campaignintelligence**.

The client is **Vasco** (Vasco Warranty), not Basco. Schema `client_basco` must not exist.

---

## Two live projects. One boundary.

| Project | Ref | Role |
|---|---|---|
| **campaignintelligence** | `azpapwtnrbzywlnxxecz` | **System of record.** Every sourced lead that reached a campaign. |
| **google-maps-scraper-leads** | `kemvxzhcxvynmoutwdrh` | **Raw acquisition only.** Maps, parcels, permits, property-finder. Never campaign-aware. |
| CRM automation | `klomihumrgwoixbzxypr` | **Retired / frozen.** Do not write. Do not resurrect. Josh pauses it in the dashboard. |

Do not create a third project. Do not write campaign or Smartlead data into the maps project. Do not write parcels or maps raw data into campaignintelligence.

A new chat that lands on the maps project should `select * from _meta.estate order by sort_order` there too. It only says: this is raw acquisition; the master file is on campaignintelligence.

---

## Master file + campaign split

**Master file:** `campaignintelligence.public.leads`

- One row per Smartlead lead that reached a campaign.
- Split by `client_name` (the business / Smartlead logo, not the contact person) and `campaign_id`.
- Campaign view: `public.v_leads_by_campaign`.
- Invariant: **zero NULL `client_name`** on `public.leads`.

**Not a second master:** `client_<slug>` schemas. Those are prospect lists that have **not** been loaded into Smartlead yet.

| Schema | Client | What's in it | In master? |
|---|---|---|---|
| `client_vasco` | Vasco Warranty | 368 companies, 214 contacts, 0 leads | No |
| `client_peterson` | Roofs by Peterson | 0 / 0 / 1310 maps leads | No |

When those lists go into Smartlead, the hourly sync writes them into `public.leads`. Do not copy campaign leads back into `client_*`.

**Global DNC:** `public.suppression` (2,658 hostiles). Check `public.v_suppression_check` before any insert into `public.leads`. All 2,658 suppressed emails are still also in the master. Do not delete them without Josh.

---

## Clients (verified 2026-08-12 against Smartlead `/clients`)

| Slug | Business (`client_name`) | Smartlead ID | Contact | Master leads |
|---|---|---|---|---|
| bolder-cyber-partners | Bolder Cyber Partners | 542838 | Mike Trpkosh | 81,105 |
| salesglider | SalesGlider | 345263 | (agency) | 40,467 |
| nieto-technology-partners | Nieto Technology Partners | **none** | — | 19,403 |
| goliath-cybersecurity | Goliath Cybersecurity | 548611 | Dave Ackley | 13,905 |
| parlay-tech | Parlay Tech | 418274 | Randy Haba | 11,444 |
| msrs | MSRS | 446286 | Randy Gaines | 5,496 |
| culture-fits | Culture Fits | 418275 | TJ Johnson | 4,588 |
| techevolution | TechEvolution | 521881 | Corey Tapper | 853 |
| vasco-warranty | Vasco Warranty | 548609 | Carlos Vasquez | 0 (lists in `client_vasco`) |
| roofs-by-peterson | Roofs by Peterson | 548610 | Kyle Peterson | 0 (lists in `client_peterson`) |

Nieto has no Smartlead client id. Do not invent one. Campaigns are named `Nieto %`.

Culture Fits = 418275 and TechEvolution = 521881 are **verified**. Do not mark them unverified.

---

## Who may write where

| Writer | May write | Must not |
|---|---|---|
| **smartlead-supabase-sync** (Railway `30975433-b55f-4cd5-82d6-96b2202a89ab`) | campaignintelligence `public.leads`, `campaigns`, `sends`, `messages`, `sequence_steps`, `sync_log` | `client_*`, `gc`, `lp`, maps project. **Do not touch this worker.** |
| Maps scraper `sync_to_supabase` | maps project: `permit_parcel.parcels` (canonical), `scrape_leads` for contractors / property-finder only, `property_pm_finder.*`, `gc.shovels_gc(_v2)` | `permit-parcels%` into `scrape_leads`. Anything on campaignintelligence. |
| lead-prep (`lp`) | `lp.*` on campaignintelligence | Promote to `public.leads` only after suppression check, with `client_name` + `campaign_id` set. |
| Manual / agent SQL | `_meta.*`, `client_vasco.*`, `client_peterson.*`, `public.suppression` | Recreating `client_basco` or `public.basco_*`. Writing campaign leads into the maps project. |

Always confirm `project_id` before `execute_sql`:
- campaignintelligence = `azpapwtnrbzywlnxxecz`
- maps = `kemvxzhcxvynmoutwdrh`

---

## Leftovers (document, do not blindly drop)

On **campaignintelligence**:

- `gc.contacts` / `gc.companies` — Goliath **working lists**. Not the same as maps `gc.shovels_gc`.
- `lp.*` — lead-prep job runner.
- `public.maps_leads` — 604-row maps extract in the wrong project. Do not grow it.
- `property_pm_finder.*` — **empty shell**. Canonical is on the maps project (1,008 properties, 3 contacts). Do not write here.
- `public.leads_staging` — ~100k imported rows dated 2026-08-04..10, inside the 30-day keep. 2 pending rows must stay. Drain happens after 30 days from those dates.

On **maps** (after parcel reclaim):

- `permit_parcel.parcels` — 155,791 rows, 90 MB. Canonical.
- `permit_parcel.operators` — 9,904 rows, 17 MB.
- `public.scrape_leads` — 7,128 rows, 6.7 MB. Contractors / property-finder only.
- `property_pm_finder.properties` — 1,008.

The Maps scraper still dual-writes parcels into `scrape_leads` on the next sync. That writer is **not in this repo**. Flag it; do not try to patch it here.

---

## Cross-client overlap (informational)

`public.v_cross_client_overlap` — emails that sit under two `client_name` values. Do not delete without Josh.

| Pair | Emails |
|---|---|
| Bolder Cyber Partners + Parlay Tech | 214 |
| Bolder Cyber Partners + Goliath Cybersecurity | 15 |
| Bolder Cyber Partners + Culture Fits | 2 |

The 15 Bolder + Goliath rows are competing cybersecurity offers hitting the same people.

---

## Retired (do not resurrect)

| Thing | Status | What Josh still does |
|---|---|---|
| CRM automation `klomihumrgwoixbzxypr` | Still live, frozen since 2026-07-22 | Pause or delete from the **Supabase dashboard**. Agent must not pause it. |
| Railway `agency-intel-sync` / `agency-intel-web` (`3fcadb86-…`) | Delete pending. Token cannot access that project. | Delete in the **Railway dashboard**. |
| `smartlead-supabase-sync` | Keeper. Last `public.leads.synced_at` 2026-08-13 00:00 UTC. | Do not touch. |

Hostile list was salvaged into `public.suppression`. Do not export CRM automation reply-management tables.

---

## Efficiency snapshot (2026-08-13)

- Master: 177,261 leads, 59 campaigns, hourly sync healthy.
- Maps `scrape_leads`: 278 MB / 322k rows → **6.7 MB / 7,128 rows** after reclaiming parcels that already lived in `permit_parcel.parcels`.
- Per-client lists are in `client_vasco` / `client_peterson` only. `public.basco_*` and `public.peterson_*` are gone.
- Staging did **not** shrink by row count (dates still inside 30-day keep). Vacuum only.

---

## RLS note

Several tables have Row Level Security off, including `public.suppression`, `client_vasco.*`, `client_peterson.*`, `_meta.*`, and maps `gc.shovels_gc(_v2)`. Anyone with the anon key can read or write those rows. Do not enable RLS blindly — that would block existing writers. Decide policies with Josh before changing this.
