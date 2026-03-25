"use client";

import { useGoogleAdsCampaigns } from "@/lib/hooks";
import { StatCard } from "./stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercent, formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export function GoogleAdsSection() {
  const { data: campaigns, isLoading, error } = useGoogleAdsCampaigns();

  if (isLoading) return <SectionSkeleton />;
  if (error) return <ErrorState message="Failed to load Google Ads data" />;
  if (!campaigns?.length) return <EmptyState />;

  const totals = campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.stats.impressions,
      clicks: acc.clicks + c.stats.clicks,
      conversions: acc.conversions + c.stats.conversions,
      cost: acc.cost + c.stats.cost,
    }),
    { impressions: 0, clicks: 0, conversions: 0, cost: 0 }
  );

  const avgCTR =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCPC = totals.clicks > 0 ? totals.cost / totals.clicks : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-bold">Google Ads - Paid Campaigns</h2>
        <Badge variant="success">
          {campaigns.filter((c) => c.status === "ENABLED").length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Impressions" value={formatNumber(totals.impressions)} icon={Eye} />
        <StatCard
          title="Clicks"
          value={formatNumber(totals.clicks)}
          subtitle={`CTR: ${formatPercent(avgCTR)}`}
          icon={MousePointerClick}
        />
        <StatCard title="Conversions" value={formatNumber(totals.conversions)} icon={Target} />
        <StatCard title="Total Spend" value={formatCurrency(totals.cost)} icon={DollarSign} />
        <StatCard title="Avg CPC" value={formatCurrency(avgCPC)} icon={DollarSign} />
        <StatCard title="Campaigns" value={String(campaigns.length)} icon={BarChart3} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Campaign</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium text-right">Impressions</th>
                  <th className="pb-3 pr-4 font-medium text-right">Clicks</th>
                  <th className="pb-3 pr-4 font-medium text-right">CTR</th>
                  <th className="pb-3 pr-4 font-medium text-right">Conversions</th>
                  <th className="pb-3 pr-4 font-medium text-right">Cost</th>
                  <th className="pb-3 font-medium text-right">CPC</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={c.status === "ENABLED" ? "success" : "outline"}
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {c.campaign_type}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatNumber(c.stats.impressions)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatNumber(c.stats.clicks)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatPercent(c.stats.ctr)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatNumber(c.stats.conversions)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatCurrency(c.stats.cost)}
                    </td>
                    <td className="py-3 text-right">
                      {formatCurrency(c.stats.cpc)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-3 p-6">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No Google Ads campaigns found</p>
        <p className="text-sm text-muted-foreground">
          Campaigns will appear here once connected to Google Ads.
        </p>
      </CardContent>
    </Card>
  );
}
