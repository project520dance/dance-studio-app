import { EnrollmentEditor } from "@/components/admin/EnrollmentEditor";

export default async function EditEnrollmentPage({
  params,
}: {
  params: Promise<{ classId: string; enrollmentId: string }>;
}) {
  const { classId, enrollmentId } = await params;
  return <EnrollmentEditor classId={classId} enrollmentId={enrollmentId} />;
}
