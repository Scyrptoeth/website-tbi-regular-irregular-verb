import { describe, expect, it } from "vitest";
import { testPackages, validateVerbContent, verbs } from "./verb-content";

describe("verb content integrity", () => {
  it("passes the import-time content contract", () => {
    expect(() => validateVerbContent()).not.toThrow();
  });

  it("ships a balanced 400-verb learning bank", () => {
    expect(verbs).toHaveLength(400);
    expect(verbs.filter((verb) => verb.type === "regular")).toHaveLength(200);
    expect(verbs.filter((verb) => verb.type === "irregular")).toHaveLength(200);
  });

  it("keeps verb ids and base forms unique with complete fields", () => {
    const ids = new Set(verbs.map((verb) => verb.id));
    const baseForms = new Set(verbs.map((verb) => verb.verb1.toLowerCase()));

    expect(ids.size).toBe(verbs.length);
    expect(baseForms.size).toBe(verbs.length);

    for (const verb of verbs) {
      expect(verb.verb1).toBeTruthy();
      expect(verb.verb2).toBeTruthy();
      expect(verb.verb3).toBeTruthy();
      expect(verb.meaning).toBeTruthy();
      expect(verb.pattern).toBeTruthy();
      expect(verb.commonMistake).toBeTruthy();
    }
  });

  it("validates every quiz question has four options and one correct answer", () => {
    const verbIds = new Set(verbs.map((verb) => verb.id));

    for (const testPackage of testPackages) {
      expect(testPackage.questions.length).toBeGreaterThan(0);

      for (const question of testPackage.questions) {
        expect(verbIds.has(question.verbId)).toBe(true);
        expect(question.options).toHaveLength(4);
        expect(question.explanation).toBeTruthy();
        expect(question.options.map((option) => option.key)).toEqual([
          "A",
          "B",
          "C",
          "D",
        ]);
        expect(
          question.options.some((option) => option.key === question.correctKey),
        ).toBe(true);
      }
    }
  });
});
