import { describe, expect, it } from "vitest";
import {
  applyDoneCascade,
  collectCascadeDoneIds,
} from "@/features/todos/domain/applyDoneCascade";
import type { TodoItem } from "@/types";

function todo(
  id: string,
  done: boolean,
  prerequisiteIds: string[] = [],
): TodoItem {
  return {
    id,
    name: id,
    done,
    prerequisiteIds,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("applyDoneCascade", () => {
  const todos = [
    todo("a", false),
    todo("b", false, ["a"]),
    todo("c", false, ["b"]),
  ];

  it("marks transitive prerequisites recursively", () => {
    const ids = collectCascadeDoneIds("c", todos);
    expect([...ids].sort()).toEqual(["a", "b", "c"]);

    const updated = applyDoneCascade(todos, "c", true);
    expect(updated.every((t) => t.done)).toBe(true);
  });

  it("unchecking only affects the target todo", () => {
    const done = applyDoneCascade(todos, "c", true);
    const undone = applyDoneCascade(done, "c", false);
    expect(undone.find((t) => t.id === "c")?.done).toBe(false);
    expect(undone.find((t) => t.id === "a")?.done).toBe(true);
    expect(undone.find((t) => t.id === "b")?.done).toBe(true);
  });
});
