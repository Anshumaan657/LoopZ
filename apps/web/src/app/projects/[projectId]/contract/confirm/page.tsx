import { ContractConfirmation } from "../../../../../features/versioning/contract-confirmation";

export default async function ConfirmContractPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ContractConfirmation projectId={projectId} />;
}
