import { AssessmentResults } from "../../../../features/assessment/assessment-results";

export default async function AssessmentPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  return <AssessmentResults runId={runId} />;
}
