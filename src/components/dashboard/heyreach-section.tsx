"use client";

import { useHeyReachCampaigns } from "@/lib/hooks";
import { StatCard } from "./stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercent } from "@/lib/utils";
import {
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  Reply,
  Eye,
  AlertTriangle,
} from "lucide-react";

export function HeyReachSection() {
  const { data: campaigns, isLoading, error } = useHeyReachCampaigns();

  if (isLoading) return <SectionSkeleton />;
  if (error) return <ErrorState message="Failed to load HeyReach data" />;
  if (!campaigns?.length) return <EmptyState />;

  const totals = campaigns.reduce(
    (acc, c) => ({
      requests: acc.requests + c.stats.connection_requests_sent,
      accepted: acc.accepted + c.stats.connections_accepted,
      messages: acc.messages + c.stats.messages_sent,
      replies: acc.replies + c.stats.messages_replied,
      inmails: acc.inmails + c.stats.inmails_sent,
      views: acc.views + c.stats.profile_views,
    }),
    { requests: 0, accepted: 0, messages: 0, replies: 0, inmails: 0, views: 0 }
  );

  const acceptanceRate =
    totals.requests > 0 ? (totals.accepted / totals.requests) * 100 : 0;
  const replyRate =
    totals.messages > 0 ? (totals.replies / totals.messages) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-blue-700" />
        <h2 className="text-xl font-bold">HeyReach - LinkedIn Outreach</h2>
        <Badge variant="success">
          {campaigns.filter((c) => c.status === "ACTIVE" || c.status === "Active").length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Requests Sent" value={formatNumber(totals.requests)} icon={UserPlus} />
        <StatCard
          title="Accepted"
          value={formatNumber(totals.accepted)}
          subtitle={formatPercent(acceptanceRate)}
          icon={UserCheck}
        />
        <StatCard title="Messages Sent" value={formatNumber(totals.messages)} icon={MessageSquare} />
        <StatCard
          title="Replies"
          value={formatNumber(totals.replies)}
          subtitle={formatPercent(replyRate)}
          icon={Reply}
        />
        <StatCard title="InMails Sent" value={formatNumber(totals.inmails)} icon={MessageSquare} />
        <StatCard title="Profile Views" value={formatNumber(totals.views)} icon={Eye} />
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
                  <th className="pb-3 pr-4 font-medium text-right">Requests</th>
                  <th className="pb-3 pr-4 font-medium text-right">Accepted</th>
                  <th className="pb-3 pr-4 font-medium text-right">Accept Rate</th>
                  <th className="pb-3 pr-4 font-medium text-right">Messages</th>
                  <th className="pb-3 pr-4 font-medium text-right">Replies</th>
                  <th className="pb-3 font-medium text-right">Reply Rate</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          c.status === "ACTIVE" || c.status === "Active"
                            ? "success"
                            : "outline"
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatNumber(c.stats.connection_requests_sent)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatNumber(c.stats.connections_accepted)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatPercent(c.stats.acceptance_rate)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatNumber(c.stats.messages_sent)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatNumber(c.stats.messages_replied)}
                    </td>
                    <td className="py-3 text-right">
                      {formatPercent(c.stats.reply_rate)}
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
        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No HeyReach campaigns found</p>
        <p className="text-sm text-muted-foreground">
          Campaigns will appear here once they are created in HeyReach.
        </p>
      </CardContent>
    </Card>
  );
}
