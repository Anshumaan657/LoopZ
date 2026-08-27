import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { contractJsonSchemas } from "./json-schemas";

describe("checked-in JSON Schema artifacts", () => {
  for (const artifact of contractJsonSchemas) {
    it(`${artifact.filename} matches the runtime Zod contract`, () => {
      const checkedIn = JSON.parse(
        readFileSync(new URL(`../schemas/${artifact.filename}`, import.meta.url), "utf8"),
      );

      expect(checkedIn).toEqual(artifact.schema);
    });
  }
});
