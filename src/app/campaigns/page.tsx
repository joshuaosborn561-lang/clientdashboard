"use client";

import { useSearchParams } from "next/navigation";
import { SmartLeadSection } from "@/components/dashboard/smartlead-section";
import { HeyReachSection } from "@/components/dashboard/heyreach-section";
import { GoogleAdsSection } from "@/components/dashboard/googleads-section";
import { Suspense } from "react";

function CampaignsContent() {
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform");

  const titles: Record<string, string> = {
    smartlead: "SmartLead Campaigns",
    heyreach: "HeyReach Campaigns",
    googleads: "Google Ads Campaigns",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {platform ? titles[platform] ?? "Campaigns" : "All Campaigns"}
        </h1>
        <p className="text-muted-foreground">
          Detailed campaign performance metrics
        </p>
      </div>

      {(!platform || platform === "smartlead") && <SmartLeadSection />}
      {(!platform || platform === "heyreach") && <HeyReachSection />}
      {(!platform || platform === "googleads") && <GoogleAdsSection />}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
      <CampaignsContent />
    </Suspense>
  );
}
