"use client";

import { useSmartLeadCampaigns } from "@/lib/hooks";
import { StatCard } from "./stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Mail, Eye, MessageSquare, AlertTriangle, Star, Send } from "lucide-react";

export function SmartLeadSection() {
  const { data: campaigns, isLoading, error } = useSmartLeadCampaigns();

  if (isLoading) return <SectionSkeleton />;
  if (error) return <ErrorState message="Failed to load SmartLead data" />;
  if (!campaigns?.length) return <EmptyState platform="SmartLead" />;

  const totals = campaigns.reduce(
    (acc, c) => ({
      sent: acc.sent + c.stats.sent,
      opened: acc.opened + c.stats.opened,
      replied: acc.replied + c.stats.replied,
      bounced: acc.bounced + c.stats.bounced,
      interested: acc.interested + c.stats.interested,
    }),
    { sent: 0, opened: 0, replied: 0, bounced: 0, interested: 0 }
  );

  const avgOpenRate = totals.sent > 0 ? (totals.opened / totals.sent) * 100 : 0;
  const avgReplyRate = totals.sent > 0 ? (totals.replied / totals.sent) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold">SmartLead - Email Outreach</h2>
        <Badge variant="success">{campaigns.filter(c => c.status === "ACTIVE" || c.status === "START").length} Active</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Emails Sent" value={formatNumber(totals.sent)} icon={Send} />
        <StatCard title="Opened" value={formatNumber(totals.opened)} subtitle={formatPercent(avgOpenRate)} icon={Eye} />
        <StatCard title="Replied" value={formatNumber(totals.replied)} subtitle={formatPercent(avgReplyRate)} icon={MessageSquare} />
        <StatCard title="Bounced" value={formatNumber(totals.bounced)} icon={AlertTriangle} />
        <StatCard title="Interested" value={formatNumber(totals.interested)} icon={Star} />
        <StatCard title="Campaigns" value={String(campaigns.length)} icon={Mail} />
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
                  <th className="pb-3 pr-4 font-medium text-right">Sent</th>
                  <th className="pb-3 pr-4 font-medium text-right">Opened</th>
                  <th className="pb-3 pr-4 font-medium text-right">Open Rate</th>
                  <th className="pb-3 pr-4 font-medium text-right">Replied</th>
                  <th className="pb-3 pr-4 font-medium text-right">Reply Rate</th>
                  <th className="pb-3 pr-4 font-medium text-right">Bounced</th>
                  <th className="pb-3 font-medium text-right">Interested</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={c.status === "ACTIVE" || c.status === "START" ? "success" : "outline"}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-right">{formatNumber(c.stats.sent)}</td>
                    <td className="py-3 pr-4 text-right">{formatNumber(c.stats.opened)}</td>
                    <td className="py-3 pr-4 text-right">{formatPercent(c.stats.open_rate)}</td>
                    <td className="py-3 pr-4 text-right">{formatNumber(c.stats.replied)}</td>
                    <td className="py-3 pr-4 text-right">{formatPercent(c.stats.reply_rate)}</td>
                    <td className="py-3 pr-4 text-right">{formatNumber(c.stats.bounced)}</td>
                    <td className="py-3 text-right">{formatNumber(c.stats.interested)}</td>
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

function EmptyState({ platform }: { platform: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No {platform} campaigns found</p>
        <p className="text-sm text-muted-foreground">
          Campaigns will appear here once they are created in {platform}.
        </p>
      </CardContent>
    </Card>
  );
}
