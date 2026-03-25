"use client";

import { useQuery } from "@tanstack/react-query";
import { GoogleAdsCampaignWithMetrics } from "@/types/google-ads";

export function useGoogleAdsCampaigns() {
  return useQuery<GoogleAdsCampaignWithMetrics[]>({
    queryKey: ["google-ads", "campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/google-ads/campaigns");
      if (!res.ok) throw new Error("Failed to fetch Google Ads campaigns");
      return res.json();
    },
  });
}
