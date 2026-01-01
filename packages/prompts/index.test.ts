import { describe, expect, it } from "vitest";
import { getPrompt } from "./index";
import { generateKidsEnglishPlan } from "../core/src/kidsEnglish/generatePlan";

describe("prompt registry", () => {
  it("loads word prompt metadata", () => {
    const prompt = getPrompt("kids-english-word.v1");
    expect(prompt.segment_seconds).toBe(6);
    expect(prompt.title).toContain("Word");
  });

  it("validates kids word plan output", () => {
    const plan = generateKidsEnglishPlan({ type: "word", key: "apple", grade: "k1" });
    expect(() => getPrompt("kids-english-word.v1").validateOutput(plan)).not.toThrow();
  });

  it("validates grammar plan output", () => {
    const plan = generateKidsEnglishPlan({ type: "grammar", key: "is-am-are", grade: "k1" });
    expect(() => getPrompt("kids-english-grammar.is-am-are.v1").validateOutput(plan)).not.toThrow();
  });
});
