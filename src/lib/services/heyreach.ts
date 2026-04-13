import { HeyReachCampaign, HeyReachCampaignStats, HeyReachCampaignWithStats } from "@/types/heyreach";

const BASE_URL = "https://api.heyreach.io/api/public";

export class HeyReachService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "X-API-KEY": this.apiKey,
        "Content-Type": "application/json",
        ...options?.headers,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      throw new Error(`HeyReach API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async getCampaigns(offset = 0, limit = 100): Promise<HeyReachCampaign[]> {
    const data = await this.fetch<{ items: HeyReachCampaign[] }>(
      `/campaigns?offset=${offset}&limit=${limit}`
    );
    return data.items || [];
  }

  async getCampaignStats(campaignId: number): Promise<HeyReachCampaignStats> {
    const data = await this.fetch<Record<string, unknown>>(`/campaigns/${campaignId}/statistics`);
    return {
      totalLeads: Number(data.totalLeads) || 0,
      connectionRequestsSent: Number(data.connectionRequestsSent) || 0,
      connectionsAccepted: Number(data.connectionsAccepted) || 0,
      messagesSent: Number(data.messagesSent) || 0,
      replies: Number(data.replies) || 0,
      responseRate: Number(data.responseRate) || 0,
      connectionRate: Number(data.connectionRate) || 0,
    };
  }

  async getCampaignsWithStats(campaignIds?: number[]): Promise<HeyReachCampaignWithStats[]> {
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
      .filter((r): r is PromiseFulfilledResult<HeyReachCampaignWithStats> => r.status === "fulfilled")
      .map((r) => r.value);
  }
}
