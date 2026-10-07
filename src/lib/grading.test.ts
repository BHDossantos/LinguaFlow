import { describe, it, expect } from "vitest";
import {
  normalizeFeedbackKind,
  buildPaperGradingSystem,
  buildInstantFeedbackSystem,
  FEEDBACK_KINDS,
} from "./grading";

describe("normalizeFeedbackKind", () => {
  it("accepts known kinds", () => {
    for (const k of FEEDBACK_KINDS) expect(normalizeFeedbackKind(k)).toBe(k);
  });
  it("falls back to general for junk", () => {
    expect(normalizeFeedbackKind("nonsense")).toBe("general");
    expect(normalizeFeedbackKind(undefined)).toBe("general");
    expect(normalizeFeedbackKind(42)).toBe("general");
  });
});

describe("buildPaperGradingSystem", () => {
  it("asks for strict JSON with the core fields", () => {
    const s = buildPaperGradingSystem({ maxScore: 50 });
    expect(s).toContain('"score"');
    expect(s).toContain('"max_score": 50');
    expect(s).toContain('"feedback_md"');
    expect(s).toContain('"focus_areas"');
    expect(s).toContain("STRICT JSON");
  });
  it("adds name fields only when detectName is set", () => {
    expect(buildPaperGradingSystem({ detectName: true })).toContain('"first_name"');
    expect(buildPaperGradingSystem({})).not.toContain('"first_name"');
  });
  it("adds annotations only when requested", () => {
    expect(buildPaperGradingSystem({ withAnnotations: true })).toContain('"annotations"');
    expect(buildPaperGradingSystem({})).not.toContain('"annotations"');
  });
  it("mentions transcription when grading from an image", () => {
    const s = buildPaperGradingSystem({ fromImage: true });
    expect(s.toLowerCase()).toContain("transcribe");
    expect(s.toLowerCase()).toContain("napkin"); // any-surface handwriting support
  });
  it("defaults max score to 100", () => {
    expect(buildPaperGradingSystem({})).toContain('"max_score": 100');
  });
});

describe("buildInstantFeedbackSystem", () => {
  it("includes the task and a score instruction", () => {
    const s = buildInstantFeedbackSystem({ task: "Write a haiku", maxScore: 10 });
    expect(s).toContain("Write a haiku");
    expect(s).toContain("score out of 10");
  });
  it("uses an overall rating when no max score", () => {
    const s = buildInstantFeedbackSystem({});
    expect(s.toLowerCase()).toContain("needs work");
  });
});
