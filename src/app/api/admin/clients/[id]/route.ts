import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { password, ...data } = body;

  const updateData: Record<string, unknown> = { ...data };
  if (password) {
    updateData.password = await hash(password, 12);
  }

  const client = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: { id: true, email: true, name: true, companyName: true },
  });

  return NextResponse.json(client);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
