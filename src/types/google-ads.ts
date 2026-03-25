export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
}

export interface GoogleAdsCampaignMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cost: number; // dollars (converted from micros)
  cpc: number;  // dollars (converted from micros)
}

export interface GoogleAdsCampaignWithMetrics extends GoogleAdsCampaign {
  metrics: GoogleAdsCampaignMetrics;
}
