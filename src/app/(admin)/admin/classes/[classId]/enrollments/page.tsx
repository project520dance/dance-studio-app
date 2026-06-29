import { EnrollmentList } from "@/components/admin/EnrollmentList";

export default async function ClassEnrollmentsPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return <EnrollmentList classId={classId} />;
}
