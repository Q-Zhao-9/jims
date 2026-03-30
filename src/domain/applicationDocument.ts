export type ApplicationDocumentKind =
  | "resume"
  | "cover_letter"
  | "reference_letter"
  | "other";

export interface ApplicationDocument {
  id: string;
  /** Application this file belongs to; null = library-only (not used in V1 mock). */
  applicationId: string | null;
  kind: ApplicationDocumentKind;
  label: string;
  fileName: string;
  uploadedAt: string;
}

export const DOCUMENT_KIND_LABELS: Record<ApplicationDocumentKind, string> = {
  resume: "Resume",
  cover_letter: "Cover letter",
  reference_letter: "Reference letter",
  other: "Other",
};
