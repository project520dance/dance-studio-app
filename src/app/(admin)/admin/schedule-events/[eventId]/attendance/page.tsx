import { AttendanceEditor } from "@/components/admin/AttendanceEditor";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <AttendanceEditor eventId={eventId} />;
}
