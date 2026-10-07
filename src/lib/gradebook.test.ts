import { describe, it, expect } from "vitest";
import {
  computeFinalGrade,
  letterFor,
  itemResults,
  type GradeCategory,
  type GradeItem,
  type GradeEntry,
} from "./gradebook";

const cats: GradeCategory[] = [
  { id: "c1", name: "Tests", weight: 50 },
  { id: "c2", name: "HW", weight: 50 },
];
const items: GradeItem[] = [
  { id: "i1", category_id: "c1", name: "Test 1", max_points: 100 },
  { id: "i2", category_id: "c2", name: "HW 1", max_points: 20 },
];
const entries: GradeEntry[] = [
  { grade_item_id: "i1", points: 88 },
  { grade_item_id: "i2", points: 18 },
];

describe("letterFor", () => {
  it("maps percentages to the default scheme", () => {
    expect(letterFor(100)?.symbol).toBe("A");
    expect(letterFor(93)?.symbol).toBe("A");
    expect(letterFor(92.9)?.symbol).toBe("A-");
    expect(letterFor(85.33)?.symbol).toBe("B");
    expect(letterFor(60)?.symbol).toBe("D-");
    expect(letterFor(59)?.symbol).toBe("F");
    expect(letterFor(0)?.symbol).toBe("F");
  });
  it("returns null for ungraded", () => {
    expect(letterFor(null)).toBeNull();
  });
  it("carries GPA", () => {
    expect(letterFor(95)?.gpa).toBe(4.0);
    expect(letterFor(50)?.gpa).toBe(0.0);
  });
});

describe("computeFinalGrade — points mode", () => {
  it("sums earned / possible", () => {
    const f = computeFinalGrade({ mode: "points", categories: cats, items, entries });
    expect(f.pointsEarned).toBe(106);
    expect(f.pointsPossible).toBe(120);
    expect(f.percent).toBeCloseTo(88.33, 2);
    expect(f.letter).toBe("B+");
  });
  it("is null when nothing is graded", () => {
    const f = computeFinalGrade({ mode: "points", categories: cats, items, entries: [] });
    expect(f.percent).toBeNull();
    expect(f.letter).toBeNull();
  });
  it("ignores ungraded items (only graded count toward possible)", () => {
    const f = computeFinalGrade({
      mode: "points",
      categories: cats,
      items,
      entries: [{ grade_item_id: "i1", points: 90 }],
    });
    expect(f.pointsPossible).toBe(100);
    expect(f.percent).toBe(90);
  });
  it("skips exempt items", () => {
    const f = computeFinalGrade({
      mode: "points",
      categories: cats,
      items,
      entries: [
        { grade_item_id: "i1", points: 80 },
        { grade_item_id: "i2", points: 0, exempt: true },
      ],
    });
    expect(f.pointsPossible).toBe(100);
    expect(f.percent).toBe(80);
  });
});

describe("computeFinalGrade — weighted mode", () => {
  it("weights categories by their percent", () => {
    // Tests 88%, HW 90% -> (50*88 + 50*90)/100 = 89
    const f = computeFinalGrade({ mode: "weighted", categories: cats, items, entries });
    expect(f.percent).toBe(89);
    expect(f.letter).toBe("B+");
  });
  it("excludes categories with no graded items and renormalizes", () => {
    // Only Tests graded -> final should equal the Tests %, not halved.
    const f = computeFinalGrade({
      mode: "weighted",
      categories: cats,
      items,
      entries: [{ grade_item_id: "i1", points: 88 }],
    });
    expect(f.percent).toBe(88);
  });
  it("drops the N lowest in a category", () => {
    const c: GradeCategory[] = [{ id: "q", name: "Quizzes", weight: 100, drop_lowest: 1 }];
    const its: GradeItem[] = [
      { id: "a", category_id: "q", name: "q1", max_points: 10 },
      { id: "b", category_id: "q", name: "q2", max_points: 10 },
      { id: "d", category_id: "q", name: "q3", max_points: 10 },
    ];
    const es: GradeEntry[] = [
      { grade_item_id: "a", points: 10 },
      { grade_item_id: "b", points: 10 },
      { grade_item_id: "d", points: 2 },
    ];
    const f = computeFinalGrade({ mode: "weighted", categories: c, items: its, entries: es });
    expect(f.percent).toBe(100); // the 2/10 is dropped
  });
  it("applies per-item weights within a category", () => {
    const c: GradeCategory[] = [{ id: "x", name: "X", weight: 100 }];
    const its: GradeItem[] = [
      { id: "a", category_id: "x", name: "big", max_points: 100, weight: 3 },
      { id: "b", category_id: "x", name: "small", max_points: 100, weight: 1 },
    ];
    const es: GradeEntry[] = [
      { grade_item_id: "a", points: 100 }, // 100%
      { grade_item_id: "b", points: 0 }, // 0%
    ];
    // weighted: (3*100 + 1*0)/4 = 75
    const f = computeFinalGrade({ mode: "weighted", categories: c, items: its, entries: es });
    expect(f.percent).toBe(75);
  });
});

describe("itemResults", () => {
  it("computes per-item percent and graded/exempt flags", () => {
    const r = itemResults(items, entries);
    expect(r[0].percent).toBe(88);
    expect(r[0].graded).toBe(true);
    expect(r[1].percent).toBe(90);
  });
});
