"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <button
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-gray-900">
            {session?.user?.companyName || "Dashboard"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
