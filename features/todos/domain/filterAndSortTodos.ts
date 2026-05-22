import type { ListTodosQuery, TodoItem, TodoSortField } from "@/types";

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

function sortValue(todo: TodoItem, field: TodoSortField): string {
  switch (field) {
    case "name":
      return todo.name.toLowerCase();
    case "deadline":
      return todo.deadline ?? "9999-99-99";
    case "updatedAt":
    default:
      return todo.updatedAt;
  }
}

export function filterAndSortTodos(todos: TodoItem[], query: ListTodosQuery = {}): TodoItem[] {
  let result = [...todos];

  if (query.done !== undefined) {
    result = result.filter((t) => t.done === query.done);
  }
  if (query.assignmentId !== undefined) {
    result = result.filter((t) => t.assignmentId === query.assignmentId);
  }
  if (query.courseId !== undefined) {
    result = result.filter((t) => t.courseId === query.courseId);
  }
  if (query.deadlineFrom !== undefined) {
    result = result.filter((t) => t.deadline != null && t.deadline >= query.deadlineFrom!);
  }
  if (query.deadlineTo !== undefined) {
    result = result.filter((t) => t.deadline != null && t.deadline <= query.deadlineTo!);
  }

  const sortBy = query.sortBy ?? "updatedAt";
  const sortDir = query.sortDir ?? "desc";
  const dir = sortDir === "asc" ? 1 : -1;

  result.sort((a, b) => {
    const av = sortValue(a, sortBy);
    const bv = sortValue(b, sortBy);
    return compareStrings(av, bv) * dir;
  });

  return result;
}
