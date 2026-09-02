import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("evidence return UI contracts", () => {
  it("keeps privacy, claim, error, deletion-confirmation, and responsive safeguards visible", () => {
    const page = readFileSync(new URL("./evidence-return.tsx", import.meta.url), "utf8");
    const form = readFileSync(new URL("./evidence-return-form.tsx", import.meta.url), "utf8");
    const pageStyles = readFileSync(new URL("./evidence-return-page.module.css", import.meta.url), "utf8");
    const formStyles = readFileSync(new URL("./evidence-return.module.css", import.meta.url), "utf8");

    for (const marker of [
      "Remove passwords, API keys, personal data, and other secrets",
      "Claims have not yet been verified",
      'role="alert"',
      "window.confirm",
      "This cannot be undone",
    ]) expect(page).toContain(marker);
    expect(form).toContain("This is a claim, not verification");
    expect(form).toContain('disabled={busy}');
    expect(pageStyles).toContain(":focus-visible");
    expect(pageStyles).toContain("@media (max-width: 600px)");
    expect(formStyles).toContain("@media (max-width: 560px)");
  });
});
