import { ContractReview } from "../../../../features/contract/contract-review";

export default async function ContractPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ContractReview projectId={projectId} />;
}
