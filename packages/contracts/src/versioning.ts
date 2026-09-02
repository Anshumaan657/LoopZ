import { z } from "zod";

import { loopSpecLiteSchema, safetyActionSchema } from "./loopspec";

export const confirmedApprovalSchema = safetyActionSchema
  .pick({ action: true, category: true })
  .extend({ approvedAt: z.string().datetime() })
  .strict();

export const confirmedContractVersionSchema = z
  .object({
    schemaVersion: z.literal("0.1"),
    versionId: z.string().uuid(),
    projectId: z.string().uuid(),
    version: z.number().int().min(1),
    confirmedAt: z.string().datetime(),
    confirmedBy: z.literal("user"),
    contractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    approvals: z.array(confirmedApprovalSchema),
    loopSpec: loopSpecLiteSchema,
  })
  .strict();

export const confirmedContractVersionListSchema = z
  .array(confirmedContractVersionSchema)
  .superRefine((versions, context) => {
    const ids = new Set<string>();
    const hashes = new Set<string>();
    versions.forEach((version, index) => {
      if (version.version !== index + 1) {
        context.addIssue({
          code: "custom",
          message: `Expected contract version ${index + 1}.`,
          path: [index, "version"],
        });
      }
      if (ids.has(version.versionId)) {
        context.addIssue({
          code: "custom",
          message: "Version IDs must be unique.",
          path: [index, "versionId"],
        });
      }
      if (hashes.has(version.contractHash)) {
        context.addIssue({
          code: "custom",
          message: "Confirmed contract content must be unique.",
          path: [index, "contractHash"],
        });
      }
      ids.add(version.versionId);
      hashes.add(version.contractHash);
    });
  });

export type ConfirmedApproval = z.infer<typeof confirmedApprovalSchema>;
export type ConfirmedContractVersion = z.infer<typeof confirmedContractVersionSchema>;
