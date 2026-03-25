export const navItems = [
  { label: "Overview", href: "/", icon: "LayoutDashboard" },
  { label: "Cold Email", href: "/smartlead", icon: "Mail", platform: "smartlead" },
  { label: "LinkedIn", href: "/heyreach", icon: "Linkedin", platform: "heyreach" },
  { label: "Google Ads", href: "/google-ads", icon: "BarChart3", platform: "google-ads" },
] as const;

export const adminNavItems = [
  { label: "Manage Clients", href: "/admin/clients", icon: "Users" },
] as const;
