import { SmartLeadCampaign, SmartLeadCampaignStats, SmartLeadCampaignWithStats } from "@/types/smartlead";

const BASE_URL = "https://server.smartlead.ai/api/v1";

export class SmartLeadService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const separator = endpoint.includes("?") ? "&" : "?";
    const url = `${BASE_URL}${endpoint}${separator}api_key=${this.apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      throw new Error(`SmartLead API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async getCampaigns(): Promise<SmartLeadCampaign[]> {
    return this.fetch<SmartLeadCampaign[]>("/campaigns");
  }

  async getCampaignStats(campaignId: number): Promise<SmartLeadCampaignStats> {
    const data = await this.fetch<Record<string, number>>(`/campaigns/${campaignId}/lead-statistics`);
    return {
      sent: data.sent || 0,
      opened: data.opened || 0,
      replied: data.replied || 0,
      bounced: data.bounced || 0,
      interested: data.interested || 0,
      not_interested: data.not_interested || 0,
      total: data.total || 0,
    };
  }

  async getCampaignsWithStats(campaignIds?: number[]): Promise<SmartLeadCampaignWithStats[]> {
    let campaigns = await this.getCampaigns();

    if (campaignIds && campaignIds.length > 0) {
      campaigns = campaigns.filter((c) => campaignIds.includes(c.id));
    }

    const results = await Promise.allSettled(
      campaigns.map(async (campaign) => {
        const stats = await this.getCampaignStats(campaign.id);
        return { ...campaign, stats };
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<SmartLeadCampaignWithStats> => r.status === "fulfilled")
      .map((r) => r.value);
  }
}
