import { notFound } from "next/navigation";
import { AssessmentResults } from "../../../../features/assessment/assessment-results";
import { isValidUUID } from "../../../../lib/validation";

export default async function AssessmentPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  if (!isValidUUID(runId)) notFound();
  return <AssessmentResults runId={runId} />;
}
