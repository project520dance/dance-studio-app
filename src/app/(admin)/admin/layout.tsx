import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const navigation = [
  { label: "Dashboard", href: "/admin" },
  { label: "Students", href: "/admin/students" },
  { label: "Teachers", href: "/admin/teachers" },
  { label: "Classes", href: "/admin/classes" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Invoices", href: "/admin/invoices" },
  { label: "Private Lessons", href: "/admin/privates" },
  { label: "Announcements", href: "/admin/announcements" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Studio Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout title="Admin Portal" userName="Admin" navigation={navigation}>{children}</DashboardLayout>;
}
