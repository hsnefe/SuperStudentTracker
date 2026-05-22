import { describe, expect, it } from "vitest";
import {
  assertNoPrerequisiteCycle,
  wouldCreatePrerequisiteCycle,
} from "@/features/todos/domain/detectPrerequisiteCycle";
import type { TodoItem } from "@/types";

function todo(
  id: string,
  prerequisiteIds: string[] = [],
): TodoItem {
  return {
    id,
    name: id,
    done: false,
    prerequisiteIds,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("detectPrerequisiteCycle", () => {
  it("detects a two-node cycle when updating the dependent", () => {
    const todos = [todo("a", ["b"]), todo("b")];
    expect(wouldCreatePrerequisiteCycle("b", ["a"], todos)).toBe(true);
  });

  it("allows acyclic prerequisites", () => {
    const todos = [todo("a"), todo("b", ["a"]), todo("c", ["b"])];
    expect(wouldCreatePrerequisiteCycle("d", ["c"], todos)).toBe(false);
  });

  it("throws when asserting on a cycle", () => {
    const todos = [todo("a", ["b"]), todo("b")];
    expect(() => assertNoPrerequisiteCycle("b", ["a"], todos)).toThrow(/cycle/);
  });
});
