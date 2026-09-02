import { TaskDelivery } from "../../../../features/artifacts/task-delivery";

export default async function TaskPage({ params, searchParams }: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ version?: string | string[] }>;
}) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const requestedVersionId = Array.isArray(query.version) ? query.version[0] : query.version;
  return <TaskDelivery projectId={projectId} requestedVersionId={requestedVersionId} />;
}
