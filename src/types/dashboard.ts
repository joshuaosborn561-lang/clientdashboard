export interface AggregateMetrics {
  totalCampaigns: number;
  totalLeadsContacted: number;
  totalReplies: number;
  totalImpressions: number;
  totalClicks: number;
  totalAdSpend: number;
  overallReplyRate: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export type Platform = "smartlead" | "heyreach";

export interface PlatformStatus {
  platform: Platform;
  connected: boolean;
  campaignCount: number;
}
