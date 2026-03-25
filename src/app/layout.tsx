import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  title: "Campaign Dashboard",
  description: "Client campaign performance dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
