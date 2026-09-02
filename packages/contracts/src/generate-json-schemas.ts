import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { contractJsonSchemas } from "./json-schemas.js";

for (const artifact of contractJsonSchemas) {
  writeFileSync(
    resolve(process.cwd(), "schemas", artifact.filename),
    JSON.stringify(artifact.schema, null, 2) + "\n",
    "utf8",
  );
}

console.log(`Generated ${contractJsonSchemas.length} contract JSON Schemas.`);
