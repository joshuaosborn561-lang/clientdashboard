"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; positive: boolean };
  loading?: boolean;
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, trend, loading, className }: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl border p-5 animate-pulse", className)}>
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border p-5 hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-[var(--color-muted-foreground)]">{label}</span>
        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-primary)]/10">
            <Icon className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[var(--color-foreground)]">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              trend.positive ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
            )}
          >
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
