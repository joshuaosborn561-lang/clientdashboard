"use client";

import { useQuery } from "@tanstack/react-query";
import { HeyReachCampaignWithStats } from "@/types/heyreach";

export function useHeyReachCampaigns() {
  return useQuery<HeyReachCampaignWithStats[]>({
    queryKey: ["heyreach", "campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/heyreach/campaigns");
      if (!res.ok) throw new Error("Failed to fetch HeyReach campaigns");
      return res.json();
    },
  });
}
