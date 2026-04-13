"use client";

import { Mail, Network as Linkedin, Send, Eye, MessageSquare, Users } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PlatformSection } from "@/components/dashboard/platform-section";
import { useSmartLeadCampaigns } from "@/hooks/use-smartlead";
import { useHeyReachCampaigns } from "@/hooks/use-heyreach";
import { formatNumber, formatPercent } from "@/lib/utils";

export default function OverviewPage() {
  const smartlead = useSmartLeadCampaigns();
  const heyreach = useHeyReachCampaigns();

  const loading = smartlead.isLoading || heyreach.isLoading;

  // Aggregate SmartLead metrics
  const slData = smartlead.data || [];
  const slSent = slData.reduce((sum, c) => sum + c.stats.sent, 0);
  const slOpened = slData.reduce((sum, c) => sum + c.stats.opened, 0);
  const slReplied = slData.reduce((sum, c) => sum + c.stats.replied, 0);
  const slInterested = slData.reduce((sum, c) => sum + c.stats.interested, 0);

  // Aggregate HeyReach metrics
  const hrData = heyreach.data || [];
  const hrRequests = hrData.reduce((sum, c) => sum + c.stats.connectionRequestsSent, 0);
  const hrAccepted = hrData.reduce((sum, c) => sum + c.stats.connectionsAccepted, 0);
  const hrReplies = hrData.reduce((sum, c) => sum + c.stats.replies, 0);

  // Totals
  const totalCampaigns = slData.length + hrData.length;
  const totalOutreach = slSent + hrRequests;
  const totalReplies = slReplied + hrReplies;
  const replyRate = totalOutreach > 0 ? totalReplies / totalOutreach : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Campaign Overview</h1>
        <p className="text-[var(--color-muted-foreground)] mt-1">
          Performance across all your active channels
        </p>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Campaigns" value={loading ? "..." : formatNumber(totalCampaigns)} icon={Users} loading={loading} />
        <MetricCard label="Total Outreach" value={loading ? "..." : formatNumber(totalOutreach)} icon={Send} loading={loading} />
        <MetricCard label="Total Replies" value={loading ? "..." : formatNumber(totalReplies)} icon={MessageSquare} loading={loading} />
        <MetricCard label="Reply Rate" value={loading ? "..." : formatPercent(replyRate)} icon={Eye} loading={loading} />
      </div>

      {/* SmartLead Section */}
      {(slData.length > 0 || smartlead.isLoading) && (
        <PlatformSection title="Cold Email (SmartLead)" icon={Mail}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard label="Emails Sent" value={formatNumber(slSent)} loading={loading} />
            <MetricCard label="Opened" value={formatNumber(slOpened)} loading={loading} />
            <MetricCard label="Replied" value={formatNumber(slReplied)} loading={loading} />
            <MetricCard label="Interested" value={formatNumber(slInterested)} loading={loading} />
            <MetricCard label="Open Rate" value={slSent > 0 ? formatPercent(slOpened / slSent) : "0%"} loading={loading} />
          </div>
        </PlatformSection>
      )}

      {/* HeyReach Section */}
      {(hrData.length > 0 || heyreach.isLoading) && (
        <PlatformSection title="LinkedIn (HeyReach)" icon={Linkedin}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Connection Requests" value={formatNumber(hrRequests)} loading={loading} />
            <MetricCard label="Accepted" value={formatNumber(hrAccepted)} loading={loading} />
            <MetricCard label="Replies" value={formatNumber(hrReplies)} loading={loading} />
            <MetricCard label="Accept Rate" value={hrRequests > 0 ? formatPercent(hrAccepted / hrRequests) : "0%"} loading={loading} />
          </div>
        </PlatformSection>
      )}

      {/* No data state */}
      {!loading && totalCampaigns === 0 && (
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-full mx-auto mb-4">
            <Mail className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No campaigns configured yet</h3>
          <p className="text-[var(--color-muted-foreground)] max-w-md mx-auto">
            Your dashboard will populate once your SalesGlider team connects your campaign platforms.
          </p>
        </div>
      )}
    </div>
  );
}
