"use client";

import { useSmartLeadCampaigns, useHeyReachCampaigns, useGoogleAdsCampaigns } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent, formatCurrency } from "@/lib/utils";
import {
  Mail,
  Users,
  BarChart3,
  MessageSquare,
  Target,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export function OverviewCards() {
  const { data: smartlead, isLoading: slLoading } = useSmartLeadCampaigns();
  const { data: heyreach, isLoading: hrLoading } = useHeyReachCampaigns();
  const { data: googleads, isLoading: gaLoading } = useGoogleAdsCampaigns();

  const isLoading = slLoading || hrLoading || gaLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  // SmartLead aggregates
  const slTotals = (smartlead ?? []).reduce(
    (acc, c) => ({
      sent: acc.sent + c.stats.sent,
      opened: acc.opened + c.stats.opened,
      replied: acc.replied + c.stats.replied,
      interested: acc.interested + c.stats.interested,
    }),
    { sent: 0, opened: 0, replied: 0, interested: 0 }
  );

  // HeyReach aggregates
  const hrTotals = (heyreach ?? []).reduce(
    (acc, c) => ({
      requests: acc.requests + c.stats.connection_requests_sent,
      accepted: acc.accepted + c.stats.connections_accepted,
      messages: acc.messages + c.stats.messages_sent,
      replies: acc.replies + c.stats.messages_replied,
    }),
    { requests: 0, accepted: 0, messages: 0, replies: 0 }
  );

  // Google Ads aggregates
  const gaTotals = (googleads ?? []).reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.stats.impressions,
      clicks: acc.clicks + c.stats.clicks,
      conversions: acc.conversions + c.stats.conversions,
      cost: acc.cost + c.stats.cost,
    }),
    { impressions: 0, clicks: 0, conversions: 0, cost: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Top-level summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outreach</p>
                <p className="text-2xl font-bold">
                  {formatNumber(slTotals.sent + hrTotals.requests + hrTotals.messages)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Replies</p>
                <p className="text-2xl font-bold">
                  {formatNumber(slTotals.replied + hrTotals.replies)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ad Conversions</p>
                <p className="text-2xl font-bold">
                  {formatNumber(gaTotals.conversions)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ad Spend</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(gaTotals.cost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* SmartLead Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">SmartLead</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Campaigns</span>
              <span className="font-medium">{smartlead?.length ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Emails Sent</span>
              <span className="font-medium">{formatNumber(slTotals.sent)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Opened</span>
              <span className="font-medium">
                {formatNumber(slTotals.opened)}{" "}
                <span className="text-muted-foreground">
                  ({slTotals.sent > 0 ? formatPercent((slTotals.opened / slTotals.sent) * 100) : "0%"})
                </span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Replied</span>
              <span className="font-medium">
                {formatNumber(slTotals.replied)}{" "}
                <span className="text-muted-foreground">
                  ({slTotals.sent > 0 ? formatPercent((slTotals.replied / slTotals.sent) * 100) : "0%"})
                </span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interested</span>
              <span className="font-medium">{formatNumber(slTotals.interested)}</span>
            </div>
          </CardContent>
        </Card>

        {/* HeyReach Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-700" />
              <CardTitle className="text-base">HeyReach</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Campaigns</span>
              <span className="font-medium">{heyreach?.length ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Connection Requests</span>
              <span className="font-medium">{formatNumber(hrTotals.requests)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accepted</span>
              <span className="font-medium">
                {formatNumber(hrTotals.accepted)}{" "}
                <span className="text-muted-foreground">
                  ({hrTotals.requests > 0 ? formatPercent((hrTotals.accepted / hrTotals.requests) * 100) : "0%"})
                </span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Messages Sent</span>
              <span className="font-medium">{formatNumber(hrTotals.messages)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Replies</span>
              <span className="font-medium">
                {formatNumber(hrTotals.replies)}{" "}
                <span className="text-muted-foreground">
                  ({hrTotals.messages > 0 ? formatPercent((hrTotals.replies / hrTotals.messages) * 100) : "0%"})
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Google Ads Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base">Google Ads</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Campaigns</span>
              <span className="font-medium">{googleads?.length ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Impressions</span>
              <span className="font-medium">{formatNumber(gaTotals.impressions)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Clicks</span>
              <span className="font-medium">
                {formatNumber(gaTotals.clicks)}{" "}
                <span className="text-muted-foreground">
                  (CTR: {gaTotals.impressions > 0 ? formatPercent((gaTotals.clicks / gaTotals.impressions) * 100) : "0%"})
                </span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conversions</span>
              <span className="font-medium">{formatNumber(gaTotals.conversions)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Cost</span>
              <span className="font-medium">{formatCurrency(gaTotals.cost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg CPC</span>
              <span className="font-medium">
                {formatCurrency(gaTotals.clicks > 0 ? gaTotals.cost / gaTotals.clicks : 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
