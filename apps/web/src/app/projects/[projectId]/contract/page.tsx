import { notFound } from "next/navigation";
import { ContractReview } from "../../../../features/contract/contract-review";
import { isValidUUID } from "../../../../lib/validation";

export default async function ContractPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (!isValidUUID(projectId)) notFound();
  return <ContractReview projectId={projectId} />;
}
