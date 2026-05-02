/**
 * SuperStudentTracker Web UI — canonical Figma file for layout and components.
 * @see https://www.figma.com/design/Wiab6UXOsEFEz8iKeq97rH/SuperStudentTracker-Web-UI
 */
export const FIGMA_FILE_KEY_SUPERSTUDENT_TRACKER = "Wiab6UXOsEFEz8iKeq97rH";

/** Root frame “SuperStudentTracker” (full home mock). */
export const FIGMA_NODE_HOME_ROOT = "2:2";

/** “Today” card container including assignment row. */
export const FIGMA_NODE_TODAY_SECTION = "2:39";

export function figmaSuperStudentTrackerUrl(nodeId?: string): string {
  const base = `https://www.figma.com/design/${FIGMA_FILE_KEY_SUPERSTUDENT_TRACKER}/SuperStudentTracker-Web-UI`;
  if (!nodeId) return base;
  return `${base}?node-id=${nodeId.replace(":", "-")}`;
}
