import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const navigation = [
  { label: "Dashboard", href: "/teacher" },
  { label: "Attendance", href: "/teacher/attendance" },
  { label: "Classes", href: "/teacher/classes" },
  { label: "Private Lessons", href: "/teacher/privates" },
];

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout title="Teacher Portal" userName="Teacher" navigation={navigation}>{children}</DashboardLayout>;
}
