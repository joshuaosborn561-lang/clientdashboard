import { NextResponse } from "next/server";
import { getCampaigns } from "@/lib/googleads";

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Google Ads API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google Ads data" },
      { status: 500 }
    );
  }
}
