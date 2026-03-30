import { useEffect, useState } from "react";
import {
  createInterview,
  createReminder,
  uploadDocument,
} from "@/api/resources";
import type { Application } from "@/domain/application";
import type { ApplicationStatus } from "@/domain/applicationStatus";
import { APPLICATION_STATUSES } from "@/domain/applicationStatus";
import type { ApplicationDocument } from "@/domain/applicationDocument";
import type { Employer } from "@/domain/employer";
import { employerName as getEmployerName } from "@/domain/employer";
import { WORK_MODE_LABELS, WORK_MODES } from "@/domain/workMode";
import { EmployerAutocomplete } from "./EmployerAutocomplete";

const DOCUMENT_KINDS = [
  { value: "resume", label: "Resume" },
  { value: "cover_letter", label: "Cover letter" },
  { value: "reference_letter", label: "Reference letter" },
  { value: "other", label: "Other" },
] as const;

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function toDatetimeLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ApplicationEditModal({
  application,
  employers,
  documents,
  resolveEmployerId,
  onClose,
  onSave,
  onRefresh,
}: {
  application: Application;
  employers: Employer[];
  documents: ApplicationDocument[];
  resolveEmployerId: (name: string) => Promise<string>;
  onClose: () => void;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const [employerName, setEmployerName] = useState(() =>
    getEmployerName(employers, application.employerId),
  );
  const [pickedEmployerId, setPickedEmployerId] = useState<string | null>(
    application.employerId,
  );
  const [role, setRole] = useState(application.role);
  const [salary, setSalary] = useState(application.salary ?? "");
  const [workMode, setWorkMode] = useState<string>(application.workMode ?? "");
  const [sourceUrl, setSourceUrl] = useState(application.sourceUrl ?? "");
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [notes, setNotes] = useState(application.notes);
  const [appliedAt, setAppliedAt] = useState(toDateInput(application.appliedAt));
  const [deadline, setDeadline] = useState(toDateInput(application.deadline));
  const [nextActionAt, setNextActionAt] = useState(
    toDatetimeLocalInput(application.nextActionAt),
  );
  const [resumeId, setResumeId] = useState(application.resumeDocumentId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploadKind, setUploadKind] = useState<string>("resume");
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  const [intType, setIntType] = useState("");
  const [intScheduled, setIntScheduled] = useState("");
  const [intLink, setIntLink] = useState("");
  const [intInterviewers, setIntInterviewers] = useState("");
  const [intNotes, setIntNotes] = useState("");
  const [intReminder, setIntReminder] = useState(false);
  const [intReminderMinutes, setIntReminderMinutes] = useState(60);
  const [intSaving, setIntSaving] = useState(false);

  const resumeDocs = documents.filter(
    (d) => d.applicationId === application.id && d.kind === "resume",
  );

  useEffect(() => {
    setEmployerName(getEmployerName(employers, application.employerId));
    setPickedEmployerId(application.employerId);
    setRole(application.role);
    setSalary(application.salary ?? "");
    setWorkMode(application.workMode ?? "");
    setSourceUrl(application.sourceUrl ?? "");
    setStatus(application.status);
    setNotes(application.notes);
    setAppliedAt(toDateInput(application.appliedAt));
    setDeadline(toDateInput(application.deadline));
    setNextActionAt(toDatetimeLocalInput(application.nextActionAt));
    setResumeId(application.resumeDocumentId ?? "");
  }, [application, employers]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const employer_id = pickedEmployerId ?? (await resolveEmployerId(employerName));
      const patch: Record<string, unknown> = {
        employer_id,
        role: role.trim(),
        salary: salary.trim() ? salary.trim() : null,
        work_mode: workMode ? workMode : null,
        source_url: sourceUrl.trim() ? sourceUrl.trim() : null,
        status,
        notes,
        applied_at: appliedAt ? appliedAt : null,
        deadline: deadline ? deadline : null,
        next_action_at: nextActionAt
          ? new Date(nextActionAt).toISOString()
          : null,
        resume_document_id: resumeId ? resumeId : null,
      };
      await onSave(patch);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onUploadDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !uploadLabel.trim()) return;
    setUploadSaving(true);
    setError(null);
    try {
      await uploadDocument({
        file: uploadFile,
        kind: uploadKind,
        label: uploadLabel.trim(),
        applicationId: application.id,
      });
      setUploadFile(null);
      setUploadLabel("");
      await onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadSaving(false);
    }
  }

  async function onLogInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!intType.trim() || !intScheduled) return;
    const scheduled_at = new Date(intScheduled).toISOString();
    setIntSaving(true);
    setError(null);
    try {
      await createInterview({
        application_id: application.id,
        interview_type: intType.trim(),
        scheduled_at,
        meeting_link: intLink.trim() || null,
        interviewers: intInterviewers,
        notes: intNotes,
      });
      if (intReminder) {
        const when = new Date(scheduled_at);
        when.setMinutes(when.getMinutes() - Math.max(0, intReminderMinutes));
        const em = getEmployerName(employers, application.employerId);
        await createReminder({
          title: `Prep: ${em} — ${application.role}`,
          due_at: when.toISOString(),
          channel: "in_app",
          application_id: application.id,
        });
      }
      setIntType("");
      setIntLink("");
      setIntInterviewers("");
      setIntNotes("");
      setIntReminder(false);
      await onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not log interview");
    } finally {
      setIntSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal modal--wide panel"
        role="dialog"
        aria-labelledby="edit-app-title"
        onMouseDown={(ev) => ev.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="edit-app-title">Edit application</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        {error ? (
          <p className="filter-banner" role="alert">
            {error}
          </p>
        ) : null}
        <form className="form-grid" onSubmit={onSubmit}>
          <label className="field">
            <span className="field-label">Employer</span>
            <EmployerAutocomplete
              employers={employers}
              value={employerName}
              onChange={(n) => {
                setEmployerName(n);
                setPickedEmployerId(null);
              }}
              onPickEmployer={(id) => setPickedEmployerId(id)}
            />
          </label>
          <label className="field">
            <span className="field-label">Role</span>
            <input
              className="field-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Salary</span>
            <input
              className="field-input"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $150k–$180k"
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Mode</span>
            <select
              className="filter-select"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              disabled={saving}
            >
              <option value="">— Not set —</option>
              {WORK_MODES.map((m) => (
                <option key={m} value={m}>
                  {WORK_MODE_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Job posting URL</span>
            <input
              className="field-input"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://…"
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Status</span>
            <select
              className="filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              disabled={saving}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Notes</span>
            <textarea
              className="field-input field-input--area"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Applied (date)</span>
            <input
              className="field-input"
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Deadline</span>
            <input
              className="field-input"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Next action</span>
            <input
              className="field-input"
              type="datetime-local"
              value={nextActionAt}
              onChange={(e) => setNextActionAt(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Resume used</span>
            <select
              className="filter-select"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              disabled={saving}
            >
              <option value="">— None —</option>
              {resumeDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} ({d.fileName})
                </option>
              ))}
            </select>
          </label>
          <div className="form-row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        <details className="modal-details">
          <summary>Upload document</summary>
          <p className="lede modal-details__hint">
            Attach a file to this application. Uploading a resume sets “resume used” automatically.
          </p>
          <form className="form-grid" onSubmit={onUploadDoc}>
            <label className="field">
              <span className="field-label">Kind</span>
              <select
                className="filter-select"
                value={uploadKind}
                onChange={(e) => setUploadKind(e.target.value)}
                disabled={uploadSaving}
              >
                {DOCUMENT_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Label</span>
              <input
                className="field-input"
                value={uploadLabel}
                onChange={(e) => setUploadLabel(e.target.value)}
                placeholder="e.g. Resume v2"
                required
                disabled={uploadSaving}
              />
            </label>
            <label className="field">
              <span className="field-label">File</span>
              <input
                className="field-input"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                disabled={uploadSaving}
              />
            </label>
            <div className="form-row" style={{ justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploadSaving || !uploadFile || !uploadLabel.trim()}
              >
                {uploadSaving ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </details>

        <details className="modal-details">
          <summary>Log interview</summary>
          <form className="form-grid" onSubmit={onLogInterview}>
            <label className="field">
              <span className="field-label">Type</span>
              <input
                className="field-input"
                value={intType}
                onChange={(e) => setIntType(e.target.value)}
                placeholder="e.g. Phone screen, onsite"
                required
                disabled={intSaving}
              />
            </label>
            <label className="field">
              <span className="field-label">Scheduled</span>
              <input
                className="field-input"
                type="datetime-local"
                value={intScheduled}
                onChange={(e) => setIntScheduled(e.target.value)}
                required
                disabled={intSaving}
              />
            </label>
            <label className="field">
              <span className="field-label">Meeting link</span>
              <input
                className="field-input"
                value={intLink}
                onChange={(e) => setIntLink(e.target.value)}
                placeholder="Optional"
                disabled={intSaving}
              />
            </label>
            <label className="field">
              <span className="field-label">Interviewers</span>
              <input
                className="field-input"
                value={intInterviewers}
                onChange={(e) => setIntInterviewers(e.target.value)}
                disabled={intSaving}
              />
            </label>
            <label className="field">
              <span className="field-label">Notes</span>
              <textarea
                className="field-input field-input--area"
                rows={2}
                value={intNotes}
                onChange={(e) => setIntNotes(e.target.value)}
                disabled={intSaving}
              />
            </label>
            <label className="field field--checkbox">
              <input
                type="checkbox"
                checked={intReminder}
                onChange={(e) => setIntReminder(e.target.checked)}
                disabled={intSaving}
              />
              <span className="field-label">Create reminder before interview</span>
            </label>
            {intReminder ? (
              <label className="field">
                <span className="field-label">Remind (minutes before)</span>
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  step={5}
                  value={intReminderMinutes}
                  onChange={(e) => setIntReminderMinutes(Number(e.target.value))}
                  disabled={intSaving}
                />
              </label>
            ) : null}
            <div className="form-row" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={intSaving}>
                {intSaving ? "Saving…" : "Log interview"}
              </button>
            </div>
          </form>
        </details>
      </div>
    </div>
  );
}
