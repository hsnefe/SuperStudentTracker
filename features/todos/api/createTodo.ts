import { assertNoPrerequisiteCycle } from "@/features/todos/domain/detectPrerequisiteCycle";
import { validateCreateTodoInput } from "@/features/todos/domain/validateTodoInput";
import { newTodoId, normalizeTodo, nowIsoTimestamp } from "@/lib/todoNormalize";
import { loadTodos, saveTodo } from "@/lib/persistence/todos";
import type { CreateTodoInput, TodoItem } from "@/types";

export async function createTodo(uid: string, input: CreateTodoInput): Promise<TodoItem> {
  const existing = await loadTodos(uid);
  const validated = validateCreateTodoInput(input, existing);
  const id = newTodoId();
  const ts = nowIsoTimestamp();

  assertNoPrerequisiteCycle(id, validated.prerequisiteIds, [
    ...existing,
    { id, name: validated.name, prerequisiteIds: validated.prerequisiteIds } as TodoItem,
  ]);

  const todo = normalizeTodo({
    id,
    name: validated.name,
    done: validated.done,
    assignmentId: validated.assignmentId,
    courseId: validated.courseId,
    deadline: validated.deadline,
    prerequisiteIds: validated.prerequisiteIds,
    createdAt: ts,
    updatedAt: ts,
  });

  await saveTodo(uid, todo);
  return todo;
}
