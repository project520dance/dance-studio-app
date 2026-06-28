import { ScheduleSeriesEditor } from "@/components/admin/ScheduleSeriesEditor";

export default async function ScheduleSeriesPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = await params;
  return <ScheduleSeriesEditor seriesId={seriesId} />;
}
