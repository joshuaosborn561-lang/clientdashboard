import { NextResponse } from "next/server";
import { getCurrentUser, parseIds } from "@/lib/auth";
import { GoogleAdsService } from "@/lib/services/google-ads";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.googleAdsCustomerId) {
      return NextResponse.json([]);
    }

    const service = new GoogleAdsService(user.googleAdsCustomerId);
    const campaignIds = parseIds(user.googleAdsCampaignIds);
    const campaigns = await service.getCampaignsWithMetrics(
      campaignIds.length > 0 ? campaignIds : undefined
    );

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Google Ads API error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
