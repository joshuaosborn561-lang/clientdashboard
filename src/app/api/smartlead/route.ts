import { NextResponse } from "next/server";
import { getCampaigns } from "@/lib/smartlead";

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("SmartLead API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch SmartLead data" },
      { status: 500 }
    );
  }
}
