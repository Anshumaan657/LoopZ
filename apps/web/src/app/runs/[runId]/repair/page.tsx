import { notFound } from "next/navigation";
import { RepairDelivery } from "../../../../features/repair/repair-delivery";
import { isValidUUID } from "../../../../lib/validation";

export default async function RepairPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  if (!isValidUUID(runId)) notFound();
  return <RepairDelivery runId={runId} />;
}
