// SmartLead Types
export interface SmartLeadCampaign {
  id: number;
  name: string;
  status: string;
  created_at: string;
  stats: {
    sent: number;
    opened: number;
    open_rate: number;
    clicked: number;
    click_rate: number;
    replied: number;
    reply_rate: number;
    bounced: number;
    bounce_rate: number;
    interested: number;
    unsubscribed: number;
  };
}

// HeyReach Types
export interface HeyReachCampaign {
  id: number;
  name: string;
  status: string;
  created_at: string;
  stats: {
    connection_requests_sent: number;
    connections_accepted: number;
    acceptance_rate: number;
    messages_sent: number;
    messages_replied: number;
    reply_rate: number;
    inmails_sent: number;
    inmails_replied: number;
    profile_views: number;
  };
}

// Google Ads Types
export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  campaign_type: string;
  stats: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    conversion_rate: number;
    cost_micros: number;
    cost: number;
    cpc: number;
    cpm: number;
  };
}

// Unified Dashboard Types
export interface DashboardOverview {
  smartlead: {
    total_campaigns: number;
    active_campaigns: number;
    total_sent: number;
    total_opened: number;
    total_replied: number;
    total_bounced: number;
    total_interested: number;
    avg_open_rate: number;
    avg_reply_rate: number;
  };
  heyreach: {
    total_campaigns: number;
    active_campaigns: number;
    total_connection_requests: number;
    total_accepted: number;
    total_messages_sent: number;
    total_replies: number;
    avg_acceptance_rate: number;
    avg_reply_rate: number;
  };
  googleads: {
    total_campaigns: number;
    active_campaigns: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_cost: number;
    avg_ctr: number;
    avg_cpc: number;
  };
}

export interface DateRange {
  from: string;
  to: string;
}

export type Platform = "smartlead" | "heyreach" | "googleads";
