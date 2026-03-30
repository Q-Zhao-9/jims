import { Link } from "react-router-dom";
import type { InterviewEvent } from "@/domain/interview";
import type { Application } from "@/domain/application";
import type { ApplicationDocument } from "@/domain/applicationDocument";
import { DOCUMENT_KIND_LABELS } from "@/domain/applicationDocument";
import type { Employer } from "@/domain/employer";
import { employerName } from "@/domain/employer";
import { StatusBadge } from "./StatusBadge";

export function ApplicationsTable({
  rows,
  employers,
  documents,
  interviews,
  onEditApplication,
}: {
  rows: Application[];
  employers: Employer[];
  documents: ApplicationDocument[];
  interviews: InterviewEvent[];
  onEditApplication?: (app: Application) => void;
}) {
  const docById = new Map(documents.map((d) => [d.id, d]));

  if (rows.length === 0) {
    return <p className="empty">No applications match this filter.</p>;
  }

  /* 11 columns — Role is wider (includes former Actions width when editable) */
  const colWidths = onEditApplication
    ? ["7%", "15%", "6%", "8%", "7%", "7%", "17%", "8%", "8%", "8%", "9%"]
    : ["7%", "8%", "6%", "8%", "7%", "7%", "24%", "8%", "8%", "8%", "9%"];

  return (
    <div className="table-wrap table-wrap--apps">
      <table className="data-table data-table--apps">
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="cell-app-employer">
              Employer
            </th>
            <th scope="col" className="cell-app-role">
              Role
            </th>
            <th scope="col">Salary</th>
            <th scope="col">Posting</th>
            <th scope="col">Status</th>
            <th scope="col">Resume used</th>
            <th scope="col">Documents</th>
            <th scope="col">Interviews</th>
            <th scope="col">Applied</th>
            <th scope="col">Deadline</th>
            <th scope="col">Next action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const name = employerName(employers, r.employerId);
            const resumeDoc = r.resumeDocumentId
              ? docById.get(r.resumeDocumentId)
              : undefined;
            const appDocs = r.documentIds
              .map((id) => docById.get(id))
              .filter((d): d is ApplicationDocument => Boolean(d));
            const appInterviews = interviews.filter((i) => i.applicationId === r.id);

            return (
              <tr key={r.id} id={r.id}>
                <td className="cell-strong cell-app-employer">
                  <Link
                    to={`/applications?employer=${encodeURIComponent(r.employerId)}`}
                    className="inline-link"
                  >
                    {name}
                  </Link>
                </td>
                <td className="cell-app-role">
                  {onEditApplication ? (
                    <button
                      type="button"
                      className="role-edit-btn"
                      title="Edit application"
                      aria-label={`Edit application: ${r.role}`}
                      onClick={() => onEditApplication(r)}
                    >
                      {r.role}
                    </button>
                  ) : (
                    r.role
                  )}
                </td>
                <td>{r.salary?.trim() ? r.salary : "—"}</td>
                <td>
                  {r.sourceUrl?.trim() ? (
                    <a
                      href={r.sourceUrl}
                      className="inline-link"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {postingLabel(r.sourceUrl)}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td>
                  {resumeDoc ? (
                    <Link
                      to={`/resumes#doc-${resumeDoc.id}`}
                      className="inline-link"
                      title={resumeDoc.fileName}
                    >
                      {resumeDoc.label}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="cell-docs">
                  <ul className="doc-link-list">
                    {appDocs.map((d) => (
                      <li key={d.id}>
                        <span className="doc-kind">
                          {DOCUMENT_KIND_LABELS[d.kind]}
                        </span>
                        <Link
                          to={`/resumes#doc-${d.id}`}
                          className="inline-link"
                        >
                          {d.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  {appInterviews.length === 0 ? (
                    "—"
                  ) : (
                    <Link
                      to={`/interviews?application=${encodeURIComponent(r.id)}`}
                      className="inline-link"
                    >
                      {appInterviews.length === 1
                        ? "View interview"
                        : `${appInterviews.length} interviews`}
                    </Link>
                  )}
                </td>
                <td className="cell-mono" title={r.appliedAt ?? undefined}>
                  {r.appliedAt ?? "—"}
                </td>
                <td className="cell-mono" title={r.deadline ?? undefined}>
                  {r.deadline ?? "—"}
                </td>
                <td
                  className="cell-mono"
                  title={r.nextActionAt ? formatWhen(r.nextActionAt) : undefined}
                >
                  {formatWhen(r.nextActionAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function postingLabel(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname + u.search;
    const short = path.length > 24 ? `${path.slice(0, 22)}…` : path;
    return `${u.hostname}${short === "/" ? "" : short}`;
  } catch {
    return url.length > 40 ? `${url.slice(0, 38)}…` : url;
  }
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
