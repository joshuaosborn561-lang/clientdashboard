"use client";

import { useQuery } from "@tanstack/react-query";
import { SmartLeadCampaign, HeyReachCampaign, GoogleAdsCampaign } from "@/types";

export function useSmartLeadCampaigns() {
  return useQuery<SmartLeadCampaign[]>({
    queryKey: ["smartlead", "campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/smartlead");
      if (!res.ok) throw new Error("Failed to fetch SmartLead campaigns");
      return res.json();
    },
  });
}

export function useHeyReachCampaigns() {
  return useQuery<HeyReachCampaign[]>({
    queryKey: ["heyreach", "campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/heyreach");
      if (!res.ok) throw new Error("Failed to fetch HeyReach campaigns");
      return res.json();
    },
  });
}

export function useGoogleAdsCampaigns() {
  return useQuery<GoogleAdsCampaign[]>({
    queryKey: ["googleads", "campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/googleads");
      if (!res.ok) throw new Error("Failed to fetch Google Ads campaigns");
      return res.json();
    },
  });
}
