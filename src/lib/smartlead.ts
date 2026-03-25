import { SmartLeadCampaign } from "@/types";

const API_KEY = process.env.SMARTLEAD_API_KEY;
const BASE_URL = "https://server.smartlead.ai/api/v1";

async function smartleadFetch(endpoint: string) {
  const url = `${BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`SmartLead API error: ${res.status}`);
  return res.json();
}

export async function getCampaigns(): Promise<SmartLeadCampaign[]> {
  const campaigns = await smartleadFetch("/campaigns");
  const detailed = await Promise.all(
    campaigns.map(async (c: { id: number; name: string; status: string; created_at: string }) => {
      const stats = await smartleadFetch(`/campaigns/${c.id}/statistics`);
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        created_at: c.created_at,
        stats: {
          sent: stats.sent_count ?? 0,
          opened: stats.open_count ?? 0,
          open_rate: stats.open_rate ?? 0,
          clicked: stats.click_count ?? 0,
          click_rate: stats.click_rate ?? 0,
          replied: stats.reply_count ?? 0,
          reply_rate: stats.reply_rate ?? 0,
          bounced: stats.bounce_count ?? 0,
          bounce_rate: stats.bounce_rate ?? 0,
          interested: stats.interested_count ?? 0,
          unsubscribed: stats.unsubscribe_count ?? 0,
        },
      };
    })
  );
  return detailed;
}

export async function getCampaignById(id: number): Promise<SmartLeadCampaign> {
  const campaign = await smartleadFetch(`/campaigns/${id}`);
  const stats = await smartleadFetch(`/campaigns/${id}/statistics`);
  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    created_at: campaign.created_at,
    stats: {
      sent: stats.sent_count ?? 0,
      opened: stats.open_count ?? 0,
      open_rate: stats.open_rate ?? 0,
      clicked: stats.click_count ?? 0,
      click_rate: stats.click_rate ?? 0,
      replied: stats.reply_count ?? 0,
      reply_rate: stats.reply_rate ?? 0,
      bounced: stats.bounce_count ?? 0,
      bounce_rate: stats.bounce_rate ?? 0,
      interested: stats.interested_count ?? 0,
      unsubscribed: stats.unsubscribe_count ?? 0,
    },
  };
}
