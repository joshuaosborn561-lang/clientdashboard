"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { X, LayoutDashboard, Mail, Network, BarChart3, Users, Triangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, adminNavItems } from "@/config/navigation";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Mail, Linkedin: Network, BarChart3, Users,
};

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 bg-[var(--color-sidebar)] text-white">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-[var(--color-primary)] rounded">
              <Triangle className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-sm font-bold">
              <span className="text-white">Sales</span>
              <span className="text-emerald-400">Glider</span>
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-[var(--color-sidebar-accent)] text-white" : "text-white/60 hover:text-white"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            );
          })}
          {isAdmin && adminNavItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white">
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
