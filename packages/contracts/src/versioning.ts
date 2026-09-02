import { z } from "zod";

import {
  loopSpecLiteSchema,
  loopSpecLiteV01Schema,
  safetyActionSchema,
} from "./loopspec";

export const CONFIRMED_CONTRACT_VERSION_SCHEMA_VERSION = "0.2" as const;
export const CONFIRMED_CONTRACT_VERSION_LEGACY_SCHEMA_VERSION = "0.1" as const;

export const confirmedApprovalSchema = safetyActionSchema
  .pick({ action: true, category: true })
  .extend({ approvedAt: z.string().datetime() })
  .strict();

const confirmedVersionShape = {
  versionId: z.string().uuid(),
  projectId: z.string().uuid(),
  version: z.number().int().min(1),
  confirmedAt: z.string().datetime(),
  confirmedBy: z.literal("user"),
  contractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  approvals: z.array(confirmedApprovalSchema),
};

export const confirmedContractVersionV01Schema = z
  .object({
    schemaVersion: z.literal(CONFIRMED_CONTRACT_VERSION_LEGACY_SCHEMA_VERSION),
    ...confirmedVersionShape,
    loopSpec: loopSpecLiteV01Schema,
  })
  .strict();

export const confirmedContractVersionSchema = z
  .object({
    schemaVersion: z.literal(CONFIRMED_CONTRACT_VERSION_SCHEMA_VERSION),
    ...confirmedVersionShape,
    loopSpec: loopSpecLiteSchema,
  })
  .strict();

export const anyConfirmedContractVersionSchema = z.discriminatedUnion("schemaVersion", [
  confirmedContractVersionV01Schema,
  confirmedContractVersionSchema,
]);

export const confirmedContractVersionListSchema = z
  .array(anyConfirmedContractVersionSchema)
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
export type ConfirmedContractVersionV01 = z.infer<typeof confirmedContractVersionV01Schema>;
export type AnyConfirmedContractVersion = z.infer<typeof anyConfirmedContractVersionSchema>;
