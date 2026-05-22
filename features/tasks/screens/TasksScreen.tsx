import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components";
import { UpcomingTodoRow } from "@/features/tasks/components/UpcomingTodoRow";
import { useHomeAssignments } from "@/features/home/hooks/useHomeAssignments";
import { useTodos } from "@/features/todos/hooks/useTodos";
import { useToggleTodoDone } from "@/features/todos/hooks/useToggleTodoDone";
import { useTheme } from "@/hooks";
import type { TodoItem } from "@/types";

const EMPTY_TODOS: TodoItem[] = [];

function markTodoDone(todos: TodoItem[], todoId: string): TodoItem[] {
  return todos.map((t) => (t.id === todoId ? { ...t, done: true } : t));
}

export function TasksScreen() {
  const { typography, spacing, colors } = useTheme();
  const todosQuery = useTodos({
    done: false,
    sortBy: "deadline",
    sortDir: "asc",
  });
  const { items: homeItems } = useHomeAssignments();
  const toggleTodo = useToggleTodoDone();
  const [optimisticTodos, setOptimisticTodos] = useState<TodoItem[] | null>(null);

  const serverTodos = todosQuery.data ?? EMPTY_TODOS;

  useEffect(() => {
    setOptimisticTodos(null);
  }, [todosQuery.dataUpdatedAt]);

  const listTodos = optimisticTodos ?? serverTodos;

  const contextByAssignmentId = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of homeItems) {
      const course = item.courseTitle?.trim();
      const title = item.assignment.title.trim();
      const label = course ? `${course} · ${title}` : title;
      map.set(item.assignment.id, label);
    }
    return map;
  }, [homeItems]);

  const handleComplete = useCallback(
    (todoId: string) => {
      const base = optimisticTodos ?? serverTodos;
      const snapshot = optimisticTodos ?? serverTodos;
      setOptimisticTodos(markTodoDone(base, todoId).filter((t) => !t.done));

      toggleTodo.mutate(
        { todoId, done: true },
        {
          onError: () => {
            setOptimisticTodos(snapshot === serverTodos ? null : [...snapshot]);
          },
          onSuccess: () => {
            setOptimisticTodos(null);
          },
        },
      );
    },
    [optimisticTodos, serverTodos, toggleTodo],
  );

  return (
    <ScreenContainer>
      <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
        To-do&apos;s
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
        Incomplete to-dos, soonest deadline first.
      </Text>

      {todosQuery.isPending ? (
        <ActivityIndicator style={{ marginTop: spacing.lg }} />
      ) : listTodos.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>No open to-dos.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {listTodos.map((todo) => (
            <UpcomingTodoRow
              key={todo.id}
              todo={todo}
              contextLabel={
                todo.assignmentId
                  ? contextByAssignmentId.get(todo.assignmentId)
                  : undefined
              }
              onComplete={handleComplete}
            />
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
