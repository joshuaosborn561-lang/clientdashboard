"use client";

import { Mail } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CampaignTable } from "@/components/dashboard/campaign-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PlatformSection } from "@/components/dashboard/platform-section";
import { useSmartLeadCampaigns } from "@/hooks/use-smartlead";
import { formatNumber, formatPercent } from "@/lib/utils";
import { SmartLeadCampaignWithStats } from "@/types/smartlead";

export default function SmartLeadPage() {
  const { data, isLoading } = useSmartLeadCampaigns();
  const campaigns = data || [];

  const totalSent = campaigns.reduce((s, c) => s + c.stats.sent, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.stats.opened, 0);
  const totalReplied = campaigns.reduce((s, c) => s + c.stats.replied, 0);
  const totalBounced = campaigns.reduce((s, c) => s + c.stats.bounced, 0);
  const totalInterested = campaigns.reduce((s, c) => s + c.stats.interested, 0);

  const columns = [
    { header: "Campaign", accessor: "name" as keyof SmartLeadCampaignWithStats },
    {
      header: "Status",
      accessor: (row: SmartLeadCampaignWithStats) => <StatusBadge status={row.status} />,
    },
    {
      header: "Sent",
      accessor: (row: SmartLeadCampaignWithStats) => formatNumber(row.stats.sent),
      className: "text-right" as const,
    },
    {
      header: "Opened",
      accessor: (row: SmartLeadCampaignWithStats) => formatNumber(row.stats.opened),
      className: "text-right" as const,
    },
    {
      header: "Replied",
      accessor: (row: SmartLeadCampaignWithStats) => formatNumber(row.stats.replied),
      className: "text-right" as const,
    },
    {
      header: "Bounced",
      accessor: (row: SmartLeadCampaignWithStats) => formatNumber(row.stats.bounced),
      className: "text-right" as const,
    },
    {
      header: "Interested",
      accessor: (row: SmartLeadCampaignWithStats) => (
        <span className="font-semibold text-emerald-700">{formatNumber(row.stats.interested)}</span>
      ),
      className: "text-right" as const,
    },
    {
      header: "Open Rate",
      accessor: (row: SmartLeadCampaignWithStats) =>
        row.stats.sent > 0 ? formatPercent(row.stats.opened / row.stats.sent) : "—",
      className: "text-right" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PlatformSection title="Cold Email Outreach" icon={Mail}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Total Sent" value={formatNumber(totalSent)} loading={isLoading} />
          <MetricCard label="Total Opened" value={formatNumber(totalOpened)} loading={isLoading} />
          <MetricCard label="Total Replied" value={formatNumber(totalReplied)} loading={isLoading} />
          <MetricCard label="Total Bounced" value={formatNumber(totalBounced)} loading={isLoading} />
          <MetricCard label="Interested Leads" value={formatNumber(totalInterested)} loading={isLoading} />
        </div>

        <CampaignTable
          columns={columns}
          data={campaigns}
          loading={isLoading}
          emptyMessage="No SmartLead campaigns connected"
        />
      </PlatformSection>
    </div>
  );
}
