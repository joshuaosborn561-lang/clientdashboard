"use client";

import { Network as Linkedin } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CampaignTable } from "@/components/dashboard/campaign-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PlatformSection } from "@/components/dashboard/platform-section";
import { useHeyReachCampaigns } from "@/hooks/use-heyreach";
import { formatNumber, formatPercent } from "@/lib/utils";
import { HeyReachCampaignWithStats } from "@/types/heyreach";

export default function HeyReachPage() {
  const { data, isLoading } = useHeyReachCampaigns();
  const campaigns = data || [];

  const totalLeads = campaigns.reduce((s, c) => s + c.stats.totalLeads, 0);
  const totalRequests = campaigns.reduce((s, c) => s + c.stats.connectionRequestsSent, 0);
  const totalAccepted = campaigns.reduce((s, c) => s + c.stats.connectionsAccepted, 0);
  const totalMessages = campaigns.reduce((s, c) => s + c.stats.messagesSent, 0);
  const totalReplies = campaigns.reduce((s, c) => s + c.stats.replies, 0);

  const columns = [
    { header: "Campaign", accessor: "name" as keyof HeyReachCampaignWithStats },
    {
      header: "Status",
      accessor: (row: HeyReachCampaignWithStats) => <StatusBadge status={row.status} />,
    },
    {
      header: "Leads",
      accessor: (row: HeyReachCampaignWithStats) => formatNumber(row.stats.totalLeads),
      className: "text-right" as const,
    },
    {
      header: "Requests Sent",
      accessor: (row: HeyReachCampaignWithStats) => formatNumber(row.stats.connectionRequestsSent),
      className: "text-right" as const,
    },
    {
      header: "Accepted",
      accessor: (row: HeyReachCampaignWithStats) => formatNumber(row.stats.connectionsAccepted),
      className: "text-right" as const,
    },
    {
      header: "Messages",
      accessor: (row: HeyReachCampaignWithStats) => formatNumber(row.stats.messagesSent),
      className: "text-right" as const,
    },
    {
      header: "Replies",
      accessor: (row: HeyReachCampaignWithStats) => (
        <span className="font-semibold text-emerald-700">{formatNumber(row.stats.replies)}</span>
      ),
      className: "text-right" as const,
    },
    {
      header: "Response Rate",
      accessor: (row: HeyReachCampaignWithStats) => formatPercent(row.stats.responseRate),
      className: "text-right" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PlatformSection title="LinkedIn Outreach" icon={Linkedin}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Total Leads" value={formatNumber(totalLeads)} loading={isLoading} />
          <MetricCard label="Requests Sent" value={formatNumber(totalRequests)} loading={isLoading} />
          <MetricCard label="Accepted" value={formatNumber(totalAccepted)} loading={isLoading} />
          <MetricCard label="Messages Sent" value={formatNumber(totalMessages)} loading={isLoading} />
          <MetricCard label="Replies" value={formatNumber(totalReplies)} loading={isLoading} />
        </div>

        <CampaignTable
          columns={columns}
          data={campaigns}
          loading={isLoading}
          emptyMessage="No HeyReach campaigns connected"
        />
      </PlatformSection>
    </div>
  );
}
