import { RepairDelivery } from "../../../../features/repair/repair-delivery";

export default async function RepairPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  return <RepairDelivery runId={runId} />;
}
