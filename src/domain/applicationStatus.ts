export const APPLICATION_STATUSES = [
  "Saved",
  "Applied",
  "OA",
  "Interview",
  "Final Round",
  "Offer",
  "Rejected",
  "Ghosted",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && APPLICATION_STATUSES.includes(value as ApplicationStatus);
}

export function statusIndex(status: ApplicationStatus): number {
  const i = APPLICATION_STATUSES.indexOf(status);
  if (i === -1) {
    throw new Error(`Invalid application status: ${String(status)}`);
  }
  return i;
}
