/** Stored as API snake_case values. */
export const WORK_MODES = ["in_person", "remote", "hybrid"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  in_person: "In-person",
  remote: "Remote",
  hybrid: "Hybrid",
};
