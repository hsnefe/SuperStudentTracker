import { describe, expect, it } from "vitest";
import { filterAndSortTodos } from "@/features/todos/domain/filterAndSortTodos";
import type { TodoItem } from "@/types";

function item(
  id: string,
  overrides: Partial<TodoItem> = {},
): TodoItem {
  return {
    id,
    name: id,
    done: false,
    prerequisiteIds: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: `2026-01-0${id}T00:00:00.000Z`,
    ...overrides,
  };
}

describe("filterAndSortTodos", () => {
  const todos: TodoItem[] = [
    item("1", { done: true, courseId: "c1", assignmentId: "a1", deadline: "2026-06-01" }),
    item("2", { done: false, courseId: "c1", deadline: "2026-05-01" }),
    item("3", { done: false, courseId: "c2" }),
  ];

  it("filters by done and courseId", () => {
    const result = filterAndSortTodos(todos, { done: false, courseId: "c1" });
    expect(result.map((t) => t.id)).toEqual(["2"]);
  });

  it("filters by deadline range", () => {
    const result = filterAndSortTodos(todos, {
      deadlineFrom: "2026-05-01",
      deadlineTo: "2026-06-01",
    });
    expect(result.map((t) => t.id).sort()).toEqual(["1", "2"]);
  });

  it("sorts by name ascending", () => {
    const named = [
      item("b", { name: "Beta" }),
      item("a", { name: "Alpha" }),
    ];
    const result = filterAndSortTodos(named, { sortBy: "name", sortDir: "asc" });
    expect(result.map((t) => t.name)).toEqual(["Alpha", "Beta"]);
  });
});
