import { NextResponse } from "next/server";
import { getCampaigns } from "@/lib/heyreach";

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("HeyReach API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch HeyReach data" },
      { status: 500 }
    );
  }
}
