import { ClarificationInterview } from "../../../../features/interview/clarification-interview";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ClarificationInterview projectId={projectId} />;
}
