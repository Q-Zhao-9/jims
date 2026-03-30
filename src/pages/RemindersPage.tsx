import { useEffect, useMemo, useState } from "react";
import {
  createReminder,
  fetchApplications,
  fetchEmployers,
  fetchReminders,
} from "@/api/resources";
import { useAuth } from "@/context/AuthContext";
import { employerName } from "@/domain/employer";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { PleaseSignIn } from "@/components/PleaseSignIn";

export function RemindersPage() {
  const { user, loading: authLoading } = useAuth();
  const [reminders, setReminders] = useState<Awaited<ReturnType<typeof fetchReminders>>>([]);
  const [apps, setApps] = useState<Awaited<ReturnType<typeof fetchApplications>>>([]);
  const [employers, setEmployers] = useState<Awaited<ReturnType<typeof fetchEmployers>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [dueLocal, setDueLocal] = useState("");
  const [channel, setChannel] = useState<"in_app" | "email">("in_app");
  const [applicationId, setApplicationId] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [r, a, e] = await Promise.all([
      fetchReminders(),
      fetchApplications(),
      fetchEmployers(),
    ]);
    setReminders(r);
    setApps(a);
    setEmployers(e);
  }

  useEffect(() => {
    if (!user) {
      setReminders([]);
      setApps([]);
      setEmployers([]);
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
  }, [user]);

  const sorted = useMemo(
    () => [...reminders].sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    [reminders],
  );

  function appTitle(id: string | null): string {
    if (!id) return "General";
    const a = apps.find((x) => x.id === id);
    return a
      ? `${employerName(employers, a.employerId)} — ${a.role}`
      : id;
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueLocal) return;
    const due_at = new Date(dueLocal).toISOString();
    setSaving(true);
    setError(null);
    try {
      await createReminder({
        title: title.trim(),
        due_at,
        channel,
        application_id: applicationId || null,
      });
      setTitle("");
      setDueLocal("");
      setApplicationId("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create reminder");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return <LoadingBlock />;
  if (!user) {
    return (
      <>
        <PageHeader title="Reminders" lede="In-app and email reminders." />
        <PleaseSignIn />
      </>
    );
  }

  if (loading && reminders.length === 0) return <LoadingBlock />;

  return (
    <>
      <PageHeader title="Reminders" lede="Track follow-ups and deadlines." />

      {error ? (
        <p className="filter-banner" role="alert">
          {error}
        </p>
      ) : null}

      <section className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="inline-form-title">New reminder</h2>
        <form className="form-grid" onSubmit={onCreate}>
          <label className="field">
            <span className="field-label">Title</span>
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Due (local)</span>
            <input
              className="field-input"
              type="datetime-local"
              value={dueLocal}
              onChange={(e) => setDueLocal(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Channel</span>
            <select
              className="filter-select"
              value={channel}
              onChange={(e) => setChannel(e.target.value as "in_app" | "email")}
              disabled={saving}
            >
              <option value="in_app">In-app</option>
              <option value="email">Email</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Application (optional)</span>
            <select
              className="filter-select"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              disabled={saving}
            >
              <option value="">General</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {employerName(employers, a.employerId)} — {a.role}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Add reminder"}
          </button>
        </form>
      </section>

      <ul className="reminder-list">
        {sorted.map((r) => (
          <li key={r.id} className="reminder-card">
            <div className="reminder-card__top">
              <span className={`reminder-pill reminder-pill--${r.channel}`}>
                {r.channel === "in_app" ? "In-app" : "Email"}
              </span>
              <time className="reminder-card__due" dateTime={r.dueAt}>
                {new Date(r.dueAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </div>
            <p className="reminder-card__title">{r.title}</p>
            <p className="reminder-card__meta">{appTitle(r.applicationId)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
