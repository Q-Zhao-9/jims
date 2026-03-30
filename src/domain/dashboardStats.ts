import type { Application } from "./application";
import { APPLICATION_STATUSES, type ApplicationStatus } from "./applicationStatus";

const POST_APPLIED: ReadonlySet<ApplicationStatus> = new Set([
  "Applied",
  "OA",
  "Interview",
  "Final Round",
  "Offer",
  "Rejected",
  "Ghosted",
]);

const INTERVIEW_OR_LATER: ReadonlySet<ApplicationStatus> = new Set([
  "Interview",
  "Final Round",
  "Offer",
  "Rejected",
  "Ghosted",
]);

function emptyByStatus(): Record<ApplicationStatus, number> {
  return APPLICATION_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<ApplicationStatus, number>,
  );
}

export interface ApplicationSummary {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  /** Share of applications that reached interview (or beyond) among those already submitted (Applied+). */
  interviewConversionRate: number | null;
}

export function summarizeApplications(rows: Application[]): ApplicationSummary {
  const byStatus = emptyByStatus();
  for (const r of rows) {
    byStatus[r.status] += 1;
  }

  const postApplied = rows.filter((r) => POST_APPLIED.has(r.status)).length;
  const reachedInterview = rows.filter((r) => INTERVIEW_OR_LATER.has(r.status)).length;

  const interviewConversionRate =
    postApplied === 0 ? null : reachedInterview / postApplied;

  return {
    total: rows.length,
    byStatus,
    interviewConversionRate,
  };
}
