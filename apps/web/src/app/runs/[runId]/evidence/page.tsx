import { EvidenceReturn } from "../../../../features/evidence/evidence-return";

export default async function EvidencePage({ params }: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  return <EvidenceReturn runId={runId} />;
}
