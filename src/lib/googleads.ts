import { GoogleAdsCampaign } from "@/types";

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID ?? "",
      client_secret: CLIENT_SECRET ?? "",
      refresh_token: REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  return data.access_token;
}

async function googleAdsFetch(query: string) {
  const accessToken = await getAccessToken();
  const customerId = (CUSTOMER_ID ?? "").replace(/-/g, "");

  const res = await fetch(
    `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": DEVELOPER_TOKEN ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  if (!res.ok) throw new Error(`Google Ads API error: ${res.status}`);
  return res.json();
}

export async function getCampaigns(): Promise<GoogleAdsCampaign[]> {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.conversions,
      metrics.cost_micros,
      metrics.average_cpc,
      metrics.average_cpm
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY metrics.impressions DESC
  `;

  const data = await googleAdsFetch(query);
  const results = data?.[0]?.results ?? [];

  return results.map(
    (r: {
      campaign: { id: string; name: string; status: string; advertisingChannelType: string };
      metrics: {
        impressions: string;
        clicks: string;
        ctr: number;
        conversions: number;
        costMicros: string;
        averageCpc: number;
        averageCpm: number;
      };
    }) => {
      const costMicros = parseInt(r.metrics.costMicros ?? "0", 10);
      const clicks = parseInt(r.metrics.clicks ?? "0", 10);
      const impressions = parseInt(r.metrics.impressions ?? "0", 10);

      return {
        id: r.campaign.id,
        name: r.campaign.name,
        status: r.campaign.status,
        campaign_type: r.campaign.advertisingChannelType,
        stats: {
          impressions,
          clicks,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          conversions: r.metrics.conversions ?? 0,
          conversion_rate: clicks > 0 ? ((r.metrics.conversions ?? 0) / clicks) * 100 : 0,
          cost_micros: costMicros,
          cost: costMicros / 1_000_000,
          cpc: clicks > 0 ? costMicros / 1_000_000 / clicks : 0,
          cpm: impressions > 0 ? (costMicros / 1_000_000 / impressions) * 1000 : 0,
        },
      };
    }
  );
}
