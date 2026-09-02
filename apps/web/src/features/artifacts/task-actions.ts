export type ClipboardWriter = { writeText(value: string): Promise<void> };

export async function copyExactTask(
  content: string,
  clipboard: ClipboardWriter | undefined = navigator.clipboard,
): Promise<void> {
  if (!clipboard?.writeText) throw new Error("Clipboard access is unavailable in this browser.");
  await clipboard.writeText(content);
}

export type DownloadEnvironment = {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
  createAnchor(): { href: string; download: string; click(): void };
};

function browserDownloadEnvironment(): DownloadEnvironment {
  return {
    createObjectURL: (blob) => URL.createObjectURL(blob),
    revokeObjectURL: (url) => URL.revokeObjectURL(url),
    createAnchor: () => document.createElement("a"),
  };
}

export function downloadExactTask(
  filename: string,
  content: string,
  environment: DownloadEnvironment = browserDownloadEnvironment(),
): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = environment.createObjectURL(blob);
  try {
    const anchor = environment.createAnchor();
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  } finally {
    environment.revokeObjectURL(url);
  }
}
