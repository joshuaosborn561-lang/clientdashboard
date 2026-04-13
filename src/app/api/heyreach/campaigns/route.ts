import { NextResponse } from "next/server";
import { getCurrentUser, parseIds } from "@/lib/auth";
import { HeyReachService } from "@/lib/services/heyreach";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.heyreachApiKey) {
      return NextResponse.json([]);
    }

    const service = new HeyReachService(user.heyreachApiKey);
    const campaignIds = parseIds(user.heyreachCampaignIds).map(Number);
    const campaigns = await service.getCampaignsWithStats(
      campaignIds.length > 0 ? campaignIds : undefined
    );

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("HeyReach API error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
