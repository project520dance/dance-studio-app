import { ClassEditor } from "@/components/admin/ClassEditor";

export default async function ClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  return <ClassEditor classId={classId} />;
}
