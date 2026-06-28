import { DashboardLayout } from "@/components/layout/DashboardLayout";
import type { ReactNode } from "react";

const parentNavigation = [
  { label: "Dashboard", href: "/parent" },
  { label: "Schedule", href: "/schedule" },
  { label: "Invoices", href: "/invoices" },
  { label: "Settings", href: "/settings" },
];

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout title="Parent Portal" navigation={parentNavigation}>
      {children}
    </DashboardLayout>
  );
}
