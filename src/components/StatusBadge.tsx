import type { ApplicationStatus } from "@/domain/applicationStatus";

const ROLE = "status";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`status-badge status-badge--${slug(status)}`} role={ROLE} aria-label={status}>
      {status}
    </span>
  );
}

function slug(s: ApplicationStatus): string {
  return s.toLowerCase().replace(/\s+/g, "-");
}
