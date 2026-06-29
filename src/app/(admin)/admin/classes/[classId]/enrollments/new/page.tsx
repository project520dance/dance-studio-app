import { EnrollmentEditor } from "@/components/admin/EnrollmentEditor";

export default async function NewEnrollmentPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return <EnrollmentEditor classId={classId} />;
}
