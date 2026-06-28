import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const navigation = [
  { label: "Dashboard", href: "/parent" },
  { label: "My Dancers", href: "/parent/dancers" },
  { label: "Schedule", href: "/parent/schedule" },
  { label: "Payments", href: "/parent/payments" },
  { label: "Competition Hub", href: "/parent/competition-hub" },
  { label: "Private Lessons", href: "/parent/privates" },
  { label: "Waivers", href: "/parent/waivers" },
  { label: "Notifications", href: "/parent/notifications" },
  { label: "Announcements", href: "/parent/announcements" },
  { label: "Documents", href: "/parent/documents" },
];

export default function ParentLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout title="Parent Portal" userName="Parent" navigation={navigation}>{children}</DashboardLayout>;
}
