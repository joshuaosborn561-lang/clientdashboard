export const navItems = [
  { label: "Overview", href: "/", icon: "LayoutDashboard" },
  { label: "Cold Email", href: "/smartlead", icon: "Mail", platform: "smartlead" },
  { label: "LinkedIn", href: "/heyreach", icon: "Linkedin", platform: "heyreach" },
] as const;

export const adminNavItems = [
  { label: "Manage Clients", href: "/admin/clients", icon: "Users" },
] as const;
