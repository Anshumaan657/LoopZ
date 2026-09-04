import { notFound } from "next/navigation";
import { TaskDelivery } from "../../../../features/artifacts/task-delivery";
import { isValidUUID } from "../../../../lib/validation";

export default async function TaskPage({ params, searchParams }: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ version?: string | string[] }>;
}) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  if (!isValidUUID(projectId)) notFound();
  const requestedVersionId = Array.isArray(query.version) ? query.version[0] : query.version;
  if (requestedVersionId && !isValidUUID(requestedVersionId)) notFound();
  return <TaskDelivery projectId={projectId} requestedVersionId={requestedVersionId} />;
}
