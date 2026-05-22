import { describe, expect, it } from "vitest";
import {
  TODO_NAME_MAX_LENGTH,
  validateCreateTodoInput,
  validateTodoName,
} from "@/features/todos/domain/validateTodoInput";
import type { TodoItem } from "@/types";

const baseTodo = (id: string): TodoItem => ({
  id,
  name: "Existing",
  done: false,
  prerequisiteIds: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("validateTodoName", () => {
  it("trims and accepts valid names", () => {
    expect(validateTodoName("  Study chapter 3  ")).toBe("Study chapter 3");
  });

  it("rejects empty names", () => {
    expect(() => validateTodoName("   ")).toThrow(/cannot be empty/);
  });

  it("rejects names over max length", () => {
    expect(() => validateTodoName("x".repeat(TODO_NAME_MAX_LENGTH + 1))).toThrow(/cannot exceed/);
  });
});

describe("validateCreateTodoInput", () => {
  it("validates deadline format and prerequisite existence", () => {
    const result = validateCreateTodoInput(
      {
        name: "Read paper",
        deadline: "2026-05-22",
        prerequisiteIds: ["a"],
      },
      [baseTodo("a")],
    );
    expect(result.deadline).toBe("2026-05-22");
    expect(result.prerequisiteIds).toEqual(["a"]);
  });

  it("rejects invalid deadline", () => {
    expect(() =>
      validateCreateTodoInput({ name: "X", deadline: "22-05-2026" }, []),
    ).toThrow(/YYYY-MM-DD/);
  });

  it("rejects unknown prerequisite ids", () => {
    expect(() =>
      validateCreateTodoInput({ name: "X", prerequisiteIds: ["missing"] }, []),
    ).toThrow(/not found/);
  });
});
