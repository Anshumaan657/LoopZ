import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL("./src/generate-json-schemas.ts", import.meta.url)),
      fileName: "generate-json-schemas",
      formats: ["es"],
    },
    minify: false,
    outDir: fileURLToPath(new URL("./dist", import.meta.url)),
    rollupOptions: {
      external: ["node:fs", "node:path"],
    },
  },
  root: packageRoot,
});
