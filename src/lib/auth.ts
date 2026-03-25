import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export function parseIds(idsString: string | null | undefined): string[] {
  if (!idsString || idsString.trim() === "") return [];
  return idsString.split(",").map((id) => id.trim()).filter(Boolean);
}
