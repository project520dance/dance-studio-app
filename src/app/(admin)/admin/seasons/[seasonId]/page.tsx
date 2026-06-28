import { SeasonEditor } from "@/components/admin/SeasonEditor";

export default async function SeasonPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  return <SeasonEditor seasonId={seasonId} />;
}
