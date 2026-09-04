import { notFound } from "next/navigation";
import { EvidenceReturn } from "../../../../features/evidence/evidence-return";
import { isValidUUID } from "../../../../lib/validation";

export default async function EvidencePage({ params }: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  if (!isValidUUID(runId)) notFound();
  return <EvidenceReturn runId={runId} />;
}
