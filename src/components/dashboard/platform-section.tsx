"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PlatformSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function PlatformSection({ title, icon: Icon, children, className }: PlatformSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
