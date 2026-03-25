"use client";

import { BarChart3 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CampaignTable } from "@/components/dashboard/campaign-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PlatformSection } from "@/components/dashboard/platform-section";
import { useGoogleAdsCampaigns } from "@/hooks/use-google-ads";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";
import { GoogleAdsCampaignWithMetrics } from "@/types/google-ads";

export default function GoogleAdsPage() {
  const { data, isLoading } = useGoogleAdsCampaigns();
  const campaigns = data || [];

  const totalImpressions = campaigns.reduce((s, c) => s + c.metrics.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.metrics.clicks, 0);
  const totalCost = campaigns.reduce((s, c) => s + c.metrics.cost, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.metrics.conversions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;

  const columns = [
    { header: "Campaign", accessor: "name" as keyof GoogleAdsCampaignWithMetrics },
    {
      header: "Status",
      accessor: (row: GoogleAdsCampaignWithMetrics) => <StatusBadge status={row.status} />,
    },
    {
      header: "Impressions",
      accessor: (row: GoogleAdsCampaignWithMetrics) => formatNumber(row.metrics.impressions),
      className: "text-right" as const,
    },
    {
      header: "Clicks",
      accessor: (row: GoogleAdsCampaignWithMetrics) => formatNumber(row.metrics.clicks),
      className: "text-right" as const,
    },
    {
      header: "CTR",
      accessor: (row: GoogleAdsCampaignWithMetrics) => formatPercent(row.metrics.ctr),
      className: "text-right" as const,
    },
    {
      header: "Conversions",
      accessor: (row: GoogleAdsCampaignWithMetrics) => (
        <span className="font-semibold text-emerald-700">{formatNumber(row.metrics.conversions)}</span>
      ),
      className: "text-right" as const,
    },
    {
      header: "Cost",
      accessor: (row: GoogleAdsCampaignWithMetrics) => formatCurrency(row.metrics.cost),
      className: "text-right" as const,
    },
    {
      header: "CPC",
      accessor: (row: GoogleAdsCampaignWithMetrics) => formatCurrency(row.metrics.cpc),
      className: "text-right" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PlatformSection title="Google Ads" icon={BarChart3}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <MetricCard label="Impressions" value={formatNumber(totalImpressions)} loading={isLoading} />
          <MetricCard label="Clicks" value={formatNumber(totalClicks)} loading={isLoading} />
          <MetricCard label="CTR" value={formatPercent(avgCtr)} loading={isLoading} />
          <MetricCard label="Conversions" value={formatNumber(totalConversions)} loading={isLoading} />
          <MetricCard label="Total Spend" value={formatCurrency(totalCost)} loading={isLoading} />
          <MetricCard label="Avg CPC" value={formatCurrency(avgCpc)} loading={isLoading} />
        </div>

        <CampaignTable
          columns={columns}
          data={campaigns}
          loading={isLoading}
          emptyMessage="No Google Ads campaigns connected"
        />
      </PlatformSection>
    </div>
  );
}
