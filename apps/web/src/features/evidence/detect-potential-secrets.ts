export type SecretFinding = {
  kind: string;
  message: string;
};

const SECRET_PATTERNS: readonly { kind: string; pattern: RegExp }[] = [
  { kind: "API key or access token", pattern: /\b(?:api[_-]?key|access[_-]?token|secret[_-]?key|private[_-]?key)\s*[:=]\s*["']?[a-z0-9_\-/+=]{8,}["']?/i },
  { kind: "Password", pattern: /\b(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"']{8,}["']?/i },
  { kind: "Bearer token", pattern: /\bbearer\s+[a-z0-9._~+\-/]+=*/i },
  { kind: "Payment-provider key", pattern: /\b(?:sk|pk)_(?:live|test)_[a-z0-9]{8,}\b/i },
  { kind: "OpenAI-style key", pattern: /\bsk-[a-z0-9_-]{20,}\b/i },
  { kind: "GitHub token", pattern: /\bgh[pousr]_[a-z0-9]{20,}\b/i },
  { kind: "GitLab token", pattern: /\bglpat-[a-z0-9_-]{20,}\b/i },
  { kind: "AWS access key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { kind: "AWS secret key", pattern: /\baws_secret_access_key\s*[:=]\s*[A-Za-z0-9/+=]{40}\b/i },
];

export function detectPotentialSecrets(text: string): SecretFinding[] {
  const findings = new Map<string, SecretFinding>();
  for (const candidate of SECRET_PATTERNS) {
    if (candidate.pattern.test(text)) {
      findings.set(candidate.kind, {
        kind: candidate.kind,
        message: `Possible ${candidate.kind.toLocaleLowerCase()} detected. Remove or redact it before continuing.`,
      });
    }
  }
  return [...findings.values()];
}
