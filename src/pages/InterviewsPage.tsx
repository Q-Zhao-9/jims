import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  createInterview,
  fetchApplications,
  fetchEmployers,
  fetchInterviews,
} from "@/api/resources";
import { useAuth } from "@/context/AuthContext";
import { employerName } from "@/domain/employer";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { PleaseSignIn } from "@/components/PleaseSignIn";

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function InterviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const applicationFilter = params.get("application");

  const [apps, setApps] = useState<Awaited<ReturnType<typeof fetchApplications>>>([]);
  const [employers, setEmployers] = useState<Awaited<ReturnType<typeof fetchEmployers>>>([]);
  const [interviews, setInterviews] = useState<Awaited<ReturnType<typeof fetchInterviews>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewers, setInterviewers] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [a, e, list] = await Promise.all([
      fetchApplications(),
      fetchEmployers(),
      fetchInterviews(applicationFilter),
    ]);
    setApps(a);
    setEmployers(e);
    setInterviews(list);
    if (!applicationId && a.length > 0) {
      setApplicationId(applicationFilter ?? a[0].id);
    }
  }

  useEffect(() => {
    if (!user) {
      setApps([]);
      setEmployers([]);
      setInterviews([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    load()
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, applicationFilter]);

  useEffect(() => {
    if (applicationFilter) {
      setApplicationId(applicationFilter);
    }
  }, [applicationFilter]);

  const rows = useMemo(() => interviews, [interviews]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!applicationId || !interviewType.trim() || !scheduledLocal) return;
    const scheduled_at = new Date(scheduledLocal).toISOString();
    setSaving(true);
    setError(null);
    try {
      await createInterview({
        application_id: applicationId,
        interview_type: interviewType.trim(),
        scheduled_at,
        meeting_link: meetingLink.trim() || null,
        interviewers,
        notes,
      });
      setInterviewType("");
      setMeetingLink("");
      setInterviewers("");
      setNotes("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create interview");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return <LoadingBlock />;
  if (!user) {
    return (
      <>
        <PageHeader title="Interviews" lede="Log interview events." />
        <PleaseSignIn />
      </>
    );
  }

  if (loading && interviews.length === 0 && apps.length === 0) {
    return <LoadingBlock />;
  }

  return (
    <>
      <PageHeader
        title="Interviews"
        lede="Interview events linked to applications."
      />

      {error ? (
        <p className="filter-banner" role="alert">
          {error}
        </p>
      ) : null}

      <section className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="inline-form-title">Log interview</h2>
        <form className="form-grid" onSubmit={onCreate}>
          <label className="field">
            <span className="field-label">Application</span>
            <select
              className="filter-select"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              required
              disabled={saving || apps.length === 0}
            >
              <option value="">Select</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {employerName(employers, a.employerId)} — {a.role}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Type</span>
            <input
              className="field-input"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              placeholder="e.g. Technical"
              required
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">When (local)</span>
            <input
              className="field-input"
              type="datetime-local"
              value={scheduledLocal}
              onChange={(e) => setScheduledLocal(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Meeting link</span>
            <input
              className="field-input"
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Interviewers</span>
            <input
              className="field-input"
              value={interviewers}
              onChange={(e) => setInterviewers(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Notes</span>
            <input
              className="field-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={saving}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving || apps.length === 0}>
            {saving ? "Saving…" : "Add interview"}
          </button>
        </form>
      </section>

      {applicationFilter ? (
        <p className="filter-banner" role="status">
          Showing interviews for{" "}
          <Link to={`/applications#${applicationFilter}`} className="inline-link">
            this application
          </Link>
          .{" "}
          <Link to="/interviews" className="inline-link">
            Clear filter
          </Link>
        </p>
      ) : null}

      <section className="panel panel--flush">
        <div className="panel-head">
          <h2>Scheduled & past interviews</h2>
        </div>
        <div className="table-wrap">
          {rows.length === 0 ? (
            <p className="empty">No interviews yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Employer</th>
                  <th scope="col">Role</th>
                  <th scope="col">Type</th>
                  <th scope="col">When</th>
                  <th scope="col">Link</th>
                  <th scope="col">Interviewers</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((ev) => {
                  const app = apps.find((a) => a.id === ev.applicationId);
                  const company = app ? employerName(employers, app.employerId) : "—";
                  const role = app?.role ?? "—";

                  return (
                    <tr key={ev.id}>
                      <td className="cell-strong">{company}</td>
                      <td>
                        {app ? (
                          <Link to={`/applications#${app.id}`} className="inline-link">
                            {role}
                          </Link>
                        ) : (
                          role
                        )}
                      </td>
                      <td>{ev.interviewType}</td>
                      <td className="cell-mono">{formatWhen(ev.scheduledAt)}</td>
                      <td className="cell-mono">
                        {ev.meetingLink ? (
                          <a href={ev.meetingLink} className="inline-link">
                            Join
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{ev.interviewers}</td>
                      <td className="notes-cell">{ev.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
