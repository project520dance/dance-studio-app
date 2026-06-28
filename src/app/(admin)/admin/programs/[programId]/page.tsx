import { ProgramEditor } from "@/components/admin/ProgramEditor";

export default async function ProgramPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  return <ProgramEditor programId={programId} />;
}
