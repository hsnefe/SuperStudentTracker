import { describe, expect, it } from "vitest";
import { stripPrerequisiteRefs } from "@/features/todos/domain/stripPrerequisiteRefs";
import type { TodoItem } from "@/types";

describe("stripPrerequisiteRefs", () => {
  it("removes deleted id from all prerequisite lists", () => {
    const todos: TodoItem[] = [
      {
        id: "a",
        name: "A",
        done: false,
        prerequisiteIds: ["gone"],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "b",
        name: "B",
        done: false,
        prerequisiteIds: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const next = stripPrerequisiteRefs(todos, "gone");
    expect(next.find((t) => t.id === "a")?.prerequisiteIds).toEqual([]);
    expect(next.find((t) => t.id === "a")?.updatedAt).not.toBe(todos[0].updatedAt);
  });
});
