import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, type SidebarItem } from "@/components/layout/Sidebar";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  title: string;
  userName: string;
  navigation: SidebarItem[];
  children: ReactNode;
};

export function DashboardLayout({
  title,
  userName,
  navigation,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar portalName={title} userName={userName} />

      <div className="mx-auto grid max-w-7xl md:grid-cols-[220px_1fr]">
        <Sidebar items={navigation} />
        <main className="p-4 sm:p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
