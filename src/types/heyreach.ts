export interface HeyReachCampaign {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

export interface HeyReachCampaignStats {
  totalLeads: number;
  connectionRequestsSent: number;
  connectionsAccepted: number;
  messagesSent: number;
  replies: number;
  responseRate: number;
  connectionRate: number;
}

export interface HeyReachCampaignWithStats extends HeyReachCampaign {
  stats: HeyReachCampaignStats;
}
