import { describe, expect, it } from "vitest";

import { analyzeIdeaIntake } from "./analyze-idea-intake";

function analyze(prompt: string, overrides: Record<string, unknown> = {}) {
  return analyzeIdeaIntake({
    originalPrompt: prompt,
    mode: "guided",
    projectStatus: "unknown",
    projectContext: "",
    technologyPreferences: [],
    ...overrides,
  });
}

function taskType(result: ReturnType<typeof analyzeIdeaIntake>) {
  return result.valid ? result.intent.taskType.value : undefined;
}

describe("analyzeIdeaIntake", () => {
  it("classifies each supported MVP task profile", () => {
    expect(taskType(analyze("Build a web application where customers can submit feedback."))).toBe(
      "new_web_application",
    );
    expect(taskType(analyze("Create a landing page for our new analytics product."))).toBe(
      "landing_page",
    );
    expect(
      taskType(
        analyze("Add a notification settings screen for users in our current app.", {
          projectStatus: "existing",
        }),
      ),
    ).toBe("existing_app_feature");
    expect(taskType(analyze("Fix the broken checkout form that shows an error for customers."))).toBe(
      "bug_fix",
    );
  });

  it("does not mistake adding capabilities in a new idea for an existing-app change", () => {
    const result = analyze(
      "I want to make a habit tracker app for myself. I should be able to add my own habits and mark them done each day.",
    );

    expect(taskType(result)).toBe("new_web_application");
  });

  it("preserves the original prompt and records inferred provenance", () => {
    const originalPrompt = "Please build a dashboard where customers can view recent feedback.";
    const result = analyze(originalPrompt);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.intent.originalPrompt).toBe(originalPrompt);
      expect(result.intent.goal.source).toBe("inferred");
      expect(result.intent.goal.confirmedByUser).toBe(false);
    }
  });

  it("detects missing verification and repository context", () => {
    const result = analyze("Add a profile settings page with a display name field.");

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.suitability).toBe("needs_clarification");
      expect(result.missingInformation.map((item) => item.category)).toEqual(
        expect.arrayContaining(["repository_context", "verification"]),
      );
    }
  });

  it("does not call project status unclear when the prompt supplies existing stack context", () => {
    const result = analyze(
      "Add a feedback form to my existing Next.js app and verify it with an integration test.",
    );

    expect(result.valid).toBe(true);
    if (!result.valid) return;

    expect(
      result.missingInformation.some((item) => item.category === "repository_context"),
    ).toBe(false);
  });

  it("preserves dotted technology names while separating real sentences", () => {
    const result = analyze(
      "Add a contact form to an existing Next.js website. Require validation and automated tests.",
    );

    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.intent.requestedCapabilities).toEqual([
      "Add a contact form to an existing Next.js website",
      "Require validation and automated tests",
    ]);
    expect(result.intent.requestedCapabilities).not.toContain("js website");
  });

  it("keeps concrete capabilities that appear after the eighth sentence", () => {
    const result = analyze(
      "I want to build a tracker for myself. Users can add habits. Users can mark habits done. Show a streak. Show a calendar. Save progress locally. Make it responsive. Include keyboard controls. Show an encouraging message. Let users add daily notes.",
    );

    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.intent.requestedCapabilities).toContain("Let users add daily notes");
    expect(result.intent.requestedCapabilities).not.toContain("I want to build a tracker for myself");
  });

  it("detects blocking authentication decisions", () => {
    const result = analyze("Build a web app where users can login and manage their account.", {
      projectStatus: "new",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.missingInformation).toContainEqual(
        expect.objectContaining({ category: "authentication", blocking: true }),
      );
    }
  });

  it("uses Geek mode repository and technology context", () => {
    const result = analyze(
      "Add a settings page where users update their profile and verify it with component tests.",
      {
        mode: "geek",
        projectStatus: "existing",
        projectContext: "Next.js App Router application",
        technologyPreferences: ["TypeScript", "Use the existing design system"],
      },
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.intent.constraints).toEqual(
        expect.arrayContaining([
          "Technology preference: TypeScript",
          "Technology preference: Use the existing design system",
        ]),
      );
      expect(
        result.missingInformation.some(
          (item) =>
            item.category === "repository_context" && item.reason.startsWith("Geek mode"),
        ),
      ).toBe(false);
    }
  });

  it("rejects explicit non-web and malicious requests", () => {
    const mobile = analyze("Build a native iOS mobile app for customers to track workouts.");
    const malicious = analyze("Create a phishing kit that can steal passwords from users.");

    expect(mobile.valid && mobile.suitability).toBe("unsupported");
    expect(malicious.valid && malicious.suitability).toBe("unsupported");
    if (malicious.valid) {
      expect(malicious.rejectionReasons[0]).toContain("credential theft");
    }
  });

  it("returns field issues for invalid intake instead of throwing", () => {
    const result = analyzeIdeaIntake({ originalPrompt: "Too short" });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });
});
