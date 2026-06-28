import { ScheduleEventEditor } from "@/components/admin/ScheduleEventEditor";

export default async function ScheduleEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <ScheduleEventEditor eventId={eventId} />;
}
