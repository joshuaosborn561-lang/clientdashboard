import { GoogleAdsCampaign, GoogleAdsCampaignMetrics, GoogleAdsCampaignWithMetrics } from "@/types/google-ads";

// Google Ads REST API v17
const GOOGLE_ADS_API_URL = "https://googleads.googleapis.com/v17";

interface GoogleAdsTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class GoogleAdsService {
  private customerId: string;
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private developerToken: string;
  private accessToken: string | null = null;

  constructor(customerId: string) {
    this.customerId = customerId.replace(/-/g, "");
    this.clientId = process.env.GOOGLE_ADS_CLIENT_ID || "";
    this.clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || "";
    this.refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN || "";
    this.developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) {
      throw new Error(`Google OAuth error: ${res.status}`);
    }

    const data: GoogleAdsTokenResponse = await res.json();
    this.accessToken = data.access_token;
    return data.access_token;
  }

  private async query(gaql: string): Promise<Record<string, unknown>[]> {
    const token = await this.getAccessToken();
    const url = `${GOOGLE_ADS_API_URL}/customers/${this.customerId}/googleAds:searchStream`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "developer-token": this.developerToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: gaql }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Ads API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    // searchStream returns an array of result batches
    const results: Record<string, unknown>[] = [];
    for (const batch of data) {
      if (batch.results) {
        results.push(...batch.results);
      }
    }
    return results;
  }

  async getCampaignsWithMetrics(campaignIds?: string[]): Promise<GoogleAdsCampaignWithMetrics[]> {
    let gaql = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_micros,
        metrics.average_cpc
      FROM campaign
      WHERE campaign.status != 'REMOVED'
    `;

    if (campaignIds && campaignIds.length > 0) {
      gaql += ` AND campaign.id IN (${campaignIds.join(",")})`;
    }

    const rows = await this.query(gaql);

    return rows.map((row) => {
      const campaign = row.campaign as Record<string, string>;
      const metrics = row.metrics as Record<string, string>;
      const costMicros = Number(metrics?.costMicros || 0);
      const avgCpcMicros = Number(metrics?.averageCpc || 0);

      return {
        id: String(campaign?.id || ""),
        name: campaign?.name || "",
        status: campaign?.status || "",
        metrics: {
          impressions: Number(metrics?.impressions || 0),
          clicks: Number(metrics?.clicks || 0),
          ctr: Number(metrics?.ctr || 0),
          conversions: Number(metrics?.conversions || 0),
          cost: costMicros / 1_000_000,
          cpc: avgCpcMicros / 1_000_000,
        },
      };
    });
  }
}
