import type { CreateTodoInput, TodoItem, UpdateTodoInput } from "@/types";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TODO_NAME_MAX_LENGTH = 200;

export type ValidatedTodoFields = {
  name: string;
  done: boolean;
  assignmentId?: string;
  courseId?: string;
  deadline?: string;
  prerequisiteIds: string[];
};

export function validateTodoName(name: unknown): string {
  if (typeof name !== "string") {
    throw new Error("Todo name is required");
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("Todo name cannot be empty");
  }
  if (trimmed.length > TODO_NAME_MAX_LENGTH) {
    throw new Error(`Todo name cannot exceed ${TODO_NAME_MAX_LENGTH} characters`);
  }
  return trimmed;
}

export function validateDeadline(deadline: unknown): string | undefined {
  if (deadline === undefined || deadline === null || deadline === "") {
    return undefined;
  }
  if (typeof deadline !== "string" || !ISO_DATE_RE.test(deadline)) {
    throw new Error("Deadline must be YYYY-MM-DD");
  }
  return deadline;
}

export function validatePrerequisiteIds(
  raw: unknown,
  existingIds: Set<string>,
  selfId?: string,
): string[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    throw new Error("prerequisiteIds must be an array");
  }
  const ids = [...new Set(raw.filter((id): id is string => typeof id === "string" && id.length > 0))];
  if (selfId && ids.includes(selfId)) {
    throw new Error("A todo cannot be its own prerequisite");
  }
  for (const id of ids) {
    if (!existingIds.has(id)) {
      throw new Error(`Prerequisite todo not found: ${id}`);
    }
  }
  return ids;
}

export function validateCreateTodoInput(
  input: CreateTodoInput,
  existingTodos: TodoItem[],
): ValidatedTodoFields {
  const existingIds = new Set(existingTodos.map((t) => t.id));
  return {
    name: validateTodoName(input.name),
    done: Boolean(input.done),
    assignmentId:
      typeof input.assignmentId === "string" && input.assignmentId.length > 0
        ? input.assignmentId
        : undefined,
    courseId:
      typeof input.courseId === "string" && input.courseId.length > 0 ? input.courseId : undefined,
    deadline: validateDeadline(input.deadline),
    prerequisiteIds: validatePrerequisiteIds(input.prerequisiteIds, existingIds),
  };
}

export function validateUpdateTodoInput(
  input: UpdateTodoInput,
  existingTodos: TodoItem[],
  todoId: string,
): Partial<ValidatedTodoFields> {
  const existingIds = new Set(existingTodos.map((t) => t.id));
  const patch: Partial<ValidatedTodoFields> = {};

  if (input.name !== undefined) {
    patch.name = validateTodoName(input.name);
  }
  if (input.done !== undefined) {
    patch.done = Boolean(input.done);
  }
  if (input.assignmentId !== undefined) {
    patch.assignmentId =
      input.assignmentId === null || input.assignmentId === ""
        ? undefined
        : input.assignmentId;
  }
  if (input.courseId !== undefined) {
    patch.courseId =
      input.courseId === null || input.courseId === "" ? undefined : input.courseId;
  }
  if (input.deadline !== undefined) {
    patch.deadline =
      input.deadline === null || input.deadline === ""
        ? undefined
        : validateDeadline(input.deadline);
  }
  if (input.prerequisiteIds !== undefined) {
    patch.prerequisiteIds = validatePrerequisiteIds(
      input.prerequisiteIds,
      existingIds,
      todoId,
    );
  }

  return patch;
}
