import type { HomeScheduleBlock } from "@/constants/homeSchedule";

export const SCHEDULE_STACK_PX = 7;
export const SCHEDULE_HOVER_LIFT_PX = 28;

export type StackedHomeScheduleBlock = HomeScheduleBlock & {
  stackIndex: number;
  stackSize: number;
};

function intervalsOverlap(a: HomeScheduleBlock, b: HomeScheduleBlock): boolean {
  return a.startMinute < b.endMinute && b.startMinute < a.endMinute;
}

function mergeOverlappingGroups(blocks: HomeScheduleBlock[]): HomeScheduleBlock[][] {
  const sorted = [...blocks].sort(
    (a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id),
  );
  const groups: HomeScheduleBlock[][] = [];

  for (const block of sorted) {
    const mergeInto: number[] = [];
    for (let i = 0; i < groups.length; i += 1) {
      if (groups[i].some((g) => intervalsOverlap(g, block))) {
        mergeInto.push(i);
      }
    }

    if (mergeInto.length === 0) {
      groups.push([block]);
      continue;
    }

    const merged: HomeScheduleBlock[] = [block];
    for (const idx of mergeInto.sort((a, b) => b - a)) {
      merged.push(...groups[idx]);
      groups.splice(idx, 1);
    }
    groups.push(merged);
  }

  return groups;
}

/** Assign stack indices for overlapping blocks within one day column. */
export function assignOverlapStacks(blocks: HomeScheduleBlock[]): StackedHomeScheduleBlock[] {
  if (blocks.length === 0) return [];

  const result: StackedHomeScheduleBlock[] = [];
  for (const group of mergeOverlappingGroups(blocks)) {
    const ordered = [...group].sort(
      (a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id),
    );
    const stackSize = ordered.length;
    ordered.forEach((block, stackIndex) => {
      result.push({ ...block, stackIndex, stackSize });
    });
  }

  return result;
}
