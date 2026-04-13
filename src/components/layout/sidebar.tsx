"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Mail, Network, BarChart3, Users, Triangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, adminNavItems } from "@/config/navigation";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Mail,
  Linkedin: Network,
  BarChart3,
  Users,
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)] min-h-screen">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 bg-[var(--color-primary)] rounded">
          <Triangle className="w-4 h-4 text-white fill-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">
            <span className="text-white">Sales</span>
            <span className="text-emerald-400">Glider</span>
          </span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest">Client Portal</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-sidebar-accent)] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                Admin
              </span>
            </div>
            {adminNavItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-sidebar-accent)] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-xs text-white/40">
          {session?.user?.companyName || session?.user?.name}
        </div>
      </div>
    </aside>
  );
}
