import { writeFileSync } from "node:fs";

import { contractJsonSchemas } from "./json-schemas.js";

for (const artifact of contractJsonSchemas) {
  writeFileSync(
    new URL(`../schemas/${artifact.filename}`, import.meta.url),
    JSON.stringify(artifact.schema, null, 2) + "\n",
    "utf8",
  );
}

console.log(`Generated ${contractJsonSchemas.length} contract JSON Schemas.`);
