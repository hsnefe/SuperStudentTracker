import type { TodoItem } from "@/types";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function newTodoId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowIsoTimestamp(): string {
  return new Date().toISOString();
}

function coerceDeadline(raw: unknown): string | undefined {
  if (typeof raw === "string" && ISO_DATE_RE.test(raw)) return raw;
  return undefined;
}

function coerceStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function normalizeTodo(
  raw: Partial<TodoItem> & Pick<TodoItem, "id" | "name">,
): TodoItem {
  const ts = nowIsoTimestamp();
  return {
    id: raw.id,
    name: typeof raw.name === "string" ? raw.name : "",
    done: Boolean(raw.done),
    assignmentId:
      typeof raw.assignmentId === "string" && raw.assignmentId.length > 0
        ? raw.assignmentId
        : undefined,
    courseId:
      typeof raw.courseId === "string" && raw.courseId.length > 0 ? raw.courseId : undefined,
    deadline: coerceDeadline(raw.deadline),
    prerequisiteIds: coerceStringArray(raw.prerequisiteIds),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : ts,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : ts,
  };
}

export function normalizeTodos(list: unknown[]): TodoItem[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item): item is Partial<TodoItem> & Pick<TodoItem, "id" | "name"> => {
      return item != null && typeof item === "object" && "id" in item && "name" in item;
    })
    .map((item) => normalizeTodo(item));
}

export function todosById(todos: TodoItem[]): Map<string, TodoItem> {
  return new Map(todos.map((t) => [t.id, t]));
}
