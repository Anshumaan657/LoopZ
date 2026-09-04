import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import { copyExactTask, downloadExactTask, type DownloadEnvironment } from "./task-actions";

describe("task delivery hardening", () => {
  it("writes the exact preview string to the clipboard", async () => {
    const content = "# Task\n\n    user-provided `content`\n";
    const writeText = vi.fn(async () => undefined);
    await copyExactTask(content, { writeText });
    expect(writeText).toHaveBeenCalledExactlyOnceWith(content);
  });

  it("surfaces unavailable and rejected clipboard operations", async () => {
    await expect(copyExactTask("task", undefined)).rejects.toThrow("unavailable");
    await expect(copyExactTask("task", {
      writeText: async () => { throw new Error("Permission denied"); },
    })).rejects.toThrow("Permission denied");
  });

  it("downloads the exact text and always revokes its object URL", async () => {
    const content = "# Exact task\nLine two\n";
    let capturedBlob: Blob | undefined;
    const anchor = { href: "", download: "", click: vi.fn() };
    const environment: DownloadEnvironment = {
      createObjectURL: (blob) => { capturedBlob = blob; return "blob:task"; },
      revokeObjectURL: vi.fn(),
      createAnchor: () => anchor,
    };
    downloadExactTask("TASK.md", content, environment);

    expect(anchor).toMatchObject({ href: "blob:task", download: "TASK.md" });
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(environment.revokeObjectURL).toHaveBeenCalledWith("blob:task");
    expect(await capturedBlob?.text()).toBe(content);
  });

  it("revokes the object URL when the browser download fails", () => {
    const revokeObjectURL = vi.fn();
    expect(() => downloadExactTask("TASK.md", "task", {
      createObjectURL: () => "blob:failed",
      revokeObjectURL,
      createAnchor: () => ({ href: "", download: "", click: () => { throw new Error("Blocked"); } }),
    })).toThrow("Blocked");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:failed");
  });

  it("keeps keyboard, live-status, compatibility, and mobile contracts in the delivery UI", () => {
    const component = readFileSync(new URL("./task-delivery.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./task-delivery.module.css", import.meta.url), "utf8");
    for (const marker of [
      'role="tablist"', 'role="tab"', 'aria-selected=', 'role="tabpanel"',
      'onKeyDown=', 'event.key === "ArrowLeft"', 'tabIndex={format ===', 'tabIndex={0}',
      'aria-live="polite"', 'role="alert"', "Compatibility mode",
      "deliveryInProgress.current", "disabled={delivering}",
    ]) expect(component).toContain(marker);
    expect(styles).toContain(":focus-visible");
    expect(styles).toContain("@media (max-width: 520px)");
    expect(styles).toContain("prefers-reduced-motion");
  });
});
