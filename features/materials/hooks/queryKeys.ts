export const courseMaterialsQueryKey = ["courseMaterials"] as const;

export function courseMaterialsListKey(uid: string | undefined, courseId: string) {
  return [...courseMaterialsQueryKey, uid, courseId] as const;
}
