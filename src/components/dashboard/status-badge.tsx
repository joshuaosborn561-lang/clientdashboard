"use client";

import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ENABLED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAUSED: "bg-amber-50 text-amber-700 border-amber-200",
  STOPPED: "bg-red-50 text-red-700 border-red-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  DRAFTED: "bg-gray-50 text-gray-600 border-gray-200",
  ARCHIVED: "bg-gray-50 text-gray-600 border-gray-200",
  REMOVED: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status.toUpperCase()] || "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", colors)}>
      {status}
    </span>
  );
}
