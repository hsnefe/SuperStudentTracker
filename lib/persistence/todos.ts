/**
 * Global todos: Firestore subcollection when configured, else SQLite (native), else in-memory (web).
 */
import { Platform } from "react-native";
import { deleteDoc, getDocs, setDoc } from "firebase/firestore";
import { normalizeTodos } from "@/lib/todoNormalize";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { userTodoDoc, userTodosCollection } from "@/lib/firestore/userPaths";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { getTodosMemory } from "./memoryCaches";
import type { TodoItem } from "@/types";

const CACHE_PREFIX = "todos:";

function cacheKey(uid: string): string {
  return `${CACHE_PREFIX}${uid}`;
}

function writeLocalCache(uid: string, todos: TodoItem[]): void {
  const key = cacheKey(uid);
  writeCache(key, todos);
  if (Platform.OS === "web") {
    getTodosMemory().set(key, todos);
  }
}

async function loadFromFirestore(uid: string): Promise<TodoItem[] | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const db = getFirebaseFirestore();
    const snap = await getDocs(userTodosCollection(db, uid));
    const items = snap.docs.map((d) => {
      const data = d.data();
      return { ...data, id: d.id };
    });
    return normalizeTodos(items);
  } catch {
    return null;
  }
}

export async function loadTodos(uid: string): Promise<TodoItem[]> {
  const fromFirestore = await loadFromFirestore(uid);
  if (fromFirestore != null) {
    writeLocalCache(uid, fromFirestore);
    return fromFirestore;
  }

  const fromSqlite = readCache<TodoItem[]>(cacheKey(uid));
  if (fromSqlite != null) return normalizeTodos(fromSqlite);

  if (Platform.OS === "web") {
    const mem = getTodosMemory().get(cacheKey(uid));
    if (mem !== undefined) return normalizeTodos(mem as TodoItem[]);
  }

  return [];
}

export async function saveTodo(uid: string, todo: TodoItem): Promise<void> {
  const list = await loadTodos(uid);
  const idx = list.findIndex((t) => t.id === todo.id);
  const next = idx >= 0 ? list.map((t) => (t.id === todo.id ? todo : t)) : [...list, todo];
  await saveTodos(uid, next);
}

export async function saveTodos(uid: string, todos: TodoItem[]): Promise<void> {
  const normalized = normalizeTodos(todos);

  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await Promise.all(
        normalized.map((todo) =>
          setDoc(userTodoDoc(db, uid, todo.id), {
            name: todo.name,
            done: todo.done,
            assignmentId: todo.assignmentId ?? null,
            courseId: todo.courseId ?? null,
            deadline: todo.deadline ?? null,
            prerequisiteIds: todo.prerequisiteIds,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
          }),
        ),
      );
      writeLocalCache(uid, normalized);
      return;
    } catch {
      /* fall through */
    }
  }

  writeLocalCache(uid, normalized);
}

export async function deleteTodoDoc(uid: string, todoId: string): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await deleteDoc(userTodoDoc(db, uid, todoId));
    } catch {
      /* fall through */
    }
  }

  const list = await loadTodos(uid);
  const next = list.filter((t) => t.id !== todoId);
  writeLocalCache(uid, next);
}
