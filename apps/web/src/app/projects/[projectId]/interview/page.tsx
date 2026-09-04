import { notFound } from "next/navigation";
import { ClarificationInterview } from "../../../../features/interview/clarification-interview";
import { isValidUUID } from "../../../../lib/validation";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!isValidUUID(projectId)) notFound();
  return <ClarificationInterview projectId={projectId} />;
}
