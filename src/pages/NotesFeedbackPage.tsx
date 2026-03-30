import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApplications, fetchEmployers, patchApplication } from "@/api/resources";
import { useAuth } from "@/context/AuthContext";
import type { Application } from "@/domain/application";
import { employerName } from "@/domain/employer";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { PleaseSignIn } from "@/components/PleaseSignIn";

type Draft = {
  interviewFeedback: string;
  recruiterInteractions: string;
  improvementPoints: string;
};

export function NotesFeedbackPage() {
  const { user, loading: authLoading } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [employers, setEmployers] = useState<Awaited<ReturnType<typeof fetchEmployers>>>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setApps([]);
      setEmployers([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [a, e] = await Promise.all([fetchApplications(), fetchEmployers()]);
        if (cancelled) return;
        setApps(a);
        setEmployers(e);
        const next: Record<string, Draft> = {};
        for (const app of a) {
          next[app.id] = {
            interviewFeedback: app.interviewFeedback ?? "",
            recruiterInteractions: app.recruiterInteractions ?? "",
            improvementPoints: app.improvementPoints ?? "",
          };
        }
        setDrafts(next);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function setField(id: string, field: keyof Draft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id]!, [field]: value },
    }));
  }

  async function onSave(id: string) {
    const d = drafts[id];
    if (!d) return;
    setSavingId(id);
    setError(null);
    try {
      await patchApplication(id, {
        interview_feedback: d.interviewFeedback || null,
        recruiter_interactions: d.recruiterInteractions || null,
        improvement_points: d.improvementPoints || null,
      });
      const a = await fetchApplications();
      setApps(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  if (authLoading) return <LoadingBlock />;
  if (!user) {
    return (
      <>
        <PageHeader title="Notes & feedback" lede="Structured notes per application." />
        <PleaseSignIn />
      </>
    );
  }

  if (loading && apps.length === 0) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        title="Notes & feedback"
        lede="Interview feedback, recruiter touchpoints, and improvement points are stored on each application."
      />

      {error ? (
        <p className="filter-banner" role="alert">
          {error}
        </p>
      ) : null}

      <div className="notes-stack">
        {apps.map((app) => {
          const headline = employerName(employers, app.employerId);
          const d = drafts[app.id] ?? {
            interviewFeedback: "",
            recruiterInteractions: "",
            improvementPoints: "",
          };

          return (
            <article key={app.id} className="notes-card">
              <header className="notes-card__head">
                <h2 className="notes-card__title">
                  <Link to={`/applications#${app.id}`} className="inline-link notes-card__headlink">
                    {headline}
                  </Link>
                  <span className="notes-card__role">{app.role}</span>
                </h2>
              </header>
              <dl className="notes-dl">
                <div>
                  <dt>Interview feedback</dt>
                  <dd>
                    <textarea
                      className="field-input field-input--area"
                      rows={3}
                      value={d.interviewFeedback}
                      onChange={(e) => setField(app.id, "interviewFeedback", e.target.value)}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Recruiter interactions</dt>
                  <dd>
                    <textarea
                      className="field-input field-input--area"
                      rows={3}
                      value={d.recruiterInteractions}
                      onChange={(e) => setField(app.id, "recruiterInteractions", e.target.value)}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Improvement points</dt>
                  <dd>
                    <textarea
                      className="field-input field-input--area"
                      rows={3}
                      value={d.improvementPoints}
                      onChange={(e) => setField(app.id, "improvementPoints", e.target.value)}
                    />
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onSave(app.id)}
                disabled={savingId === app.id}
              >
                {savingId === app.id ? "Saving…" : "Save notes"}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
