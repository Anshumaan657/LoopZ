import { notFound } from "next/navigation";
import { ContractConfirmation } from "../../../../../features/versioning/contract-confirmation";
import { isValidUUID } from "../../../../../lib/validation";

export default async function ConfirmContractPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!isValidUUID(projectId)) notFound();
  return <ContractConfirmation projectId={projectId} />;
}
