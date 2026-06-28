import { DashboardLayout } from "@/components/layout/DashboardLayout";
import type { ReactNode } from "react";

const adminNavigation = [
  { label: "Dashboard", href: "/admin" },
  { label: "Schedule", href: "/schedule" },
  { label: "Private Lessons", href: "/privates" },
  { label: "Invoices", href: "/invoices" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout title="Admin Portal" navigation={adminNavigation}>
      {children}
    </DashboardLayout>
  );
}
