import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clients = await prisma.user.findMany({
    where: { role: "client" },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      createdAt: true,
      smartleadApiKey: true,
      smartleadCampaignIds: true,
      heyreachApiKey: true,
      heyreachCampaignIds: true,
      googleAdsCustomerId: true,
      googleAdsCampaignIds: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { email, name, password, companyName, ...platformConfig } = body;

  if (!email || !name || !password) {
    return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);

  const client = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      companyName: companyName || null,
      role: "client",
      smartleadApiKey: platformConfig.smartleadApiKey || null,
      smartleadCampaignIds: platformConfig.smartleadCampaignIds || null,
      heyreachApiKey: platformConfig.heyreachApiKey || null,
      heyreachCampaignIds: platformConfig.heyreachCampaignIds || null,
      googleAdsCustomerId: platformConfig.googleAdsCustomerId || null,
      googleAdsCampaignIds: platformConfig.googleAdsCampaignIds || null,
    },
  });

  return NextResponse.json({ id: client.id, email: client.email, name: client.name }, { status: 201 });
}
