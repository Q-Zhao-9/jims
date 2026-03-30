import type { ApplicationStatus } from "./applicationStatus";
import type { Employer } from "./employer";
import { employerName } from "./employer";
import type { WorkMode } from "./workMode";

export interface Application {
  id: string;
  employerId: string;
  role: string;
  salary: string | null;
  workMode: WorkMode | null;
  sourceUrl: string | null;
  status: ApplicationStatus;
  appliedAt: string | null;
  deadline: string | null;
  nextActionAt: string | null;
  notes: string;
  /** Primary resume used for this application (document id). */
  resumeDocumentId: string | null;
  /** All documents attached to this application (resume, cover letter, etc.). */
  documentIds: string[];
  interviewFeedback?: string | null;
  recruiterInteractions?: string | null;
  improvementPoints?: string | null;
}

let idCounter = 0;

function nextId(): string {
  idCounter += 1;
  return `app-${idCounter}`;
}

export function createApplicationDraft(input: {
  employerId: string;
  role: string;
}): Application {
  return {
    id: nextId(),
    employerId: input.employerId,
    role: input.role,
    salary: null,
    workMode: null,
    sourceUrl: null,
    status: "Saved",
    appliedAt: null,
    deadline: null,
    nextActionAt: null,
    notes: "",
    resumeDocumentId: null,
    documentIds: [],
  };
}

export function filterApplicationsByStatus(
  rows: Application[],
  status: ApplicationStatus,
): Application[] {
  return rows.filter((r) => r.status === status);
}

export function sortApplicationsByEmployerName(
  rows: Application[],
  employers: Employer[],
): Application[] {
  return [...rows].sort((a, b) =>
    employerName(employers, a.employerId).localeCompare(
      employerName(employers, b.employerId),
      undefined,
      { sensitivity: "base" },
    ),
  );
}
