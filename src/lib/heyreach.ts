import { HeyReachCampaign } from "@/types";

const API_KEY = process.env.HEYREACH_API_KEY;
const BASE_URL = "https://api.heyreach.io/api/v1";

async function heyreachFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "X-API-KEY": API_KEY ?? "",
      "Content-Type": "application/json",
      ...options?.headers,
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`HeyReach API error: ${res.status}`);
  return res.json();
}

export async function getCampaigns(): Promise<HeyReachCampaign[]> {
  const data = await heyreachFetch("/campaigns/ListAll", {
    method: "POST",
    body: JSON.stringify({ offset: 0, limit: 100 }),
  });

  const campaigns = data.items ?? data ?? [];
  return campaigns.map(
    (c: {
      id: number;
      name: string;
      status: string;
      createdAt: string;
      connectionRequestsSent?: number;
      connectionsAccepted?: number;
      acceptanceRate?: number;
      messagesSent?: number;
      messagesReplied?: number;
      replyRate?: number;
      inmailsSent?: number;
      inmailsReplied?: number;
      profileViews?: number;
    }) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      created_at: c.createdAt,
      stats: {
        connection_requests_sent: c.connectionRequestsSent ?? 0,
        connections_accepted: c.connectionsAccepted ?? 0,
        acceptance_rate: c.acceptanceRate ?? 0,
        messages_sent: c.messagesSent ?? 0,
        messages_replied: c.messagesReplied ?? 0,
        reply_rate: c.replyRate ?? 0,
        inmails_sent: c.inmailsSent ?? 0,
        inmails_replied: c.inmailsReplied ?? 0,
        profile_views: c.profileViews ?? 0,
      },
    })
  );
}
