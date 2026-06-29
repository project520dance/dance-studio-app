import { StudentEditor } from "@/components/admin/StudentEditor";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ dancerId: string }>;
}) {
  const { dancerId } = await params;
  return <StudentEditor dancerId={dancerId} />;
}
