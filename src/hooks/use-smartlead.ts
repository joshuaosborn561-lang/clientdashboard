"use client";

import { useQuery } from "@tanstack/react-query";
import { SmartLeadCampaignWithStats } from "@/types/smartlead";

export function useSmartLeadCampaigns() {
  return useQuery<SmartLeadCampaignWithStats[]>({
    queryKey: ["smartlead", "campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/smartlead/campaigns");
      if (!res.ok) throw new Error("Failed to fetch SmartLead campaigns");
      return res.json();
    },
  });
}
