"use client";

import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SmartLeadSection } from "@/components/dashboard/smartlead-section";
import { HeyReachSection } from "@/components/dashboard/heyreach-section";
import { GoogleAdsSection } from "@/components/dashboard/googleads-section";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all campaign activity across platforms
        </p>
      </div>

      <OverviewCards />

      <div className="space-y-10">
        <SmartLeadSection />
        <HeyReachSection />
        <GoogleAdsSection />
      </div>
    </div>
  );
}
