export interface SmartLeadCampaign {
  id: number;
  name: string;
  status: "DRAFTED" | "ACTIVE" | "PAUSED" | "STOPPED" | "COMPLETED" | "ARCHIVED";
  created_at: string;
}

export interface SmartLeadCampaignStats {
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  interested: number;
  not_interested: number;
  total: number;
}

export interface SmartLeadCampaignWithStats extends SmartLeadCampaign {
  stats: SmartLeadCampaignStats;
}
