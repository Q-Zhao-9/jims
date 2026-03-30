import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createEmployer, deleteEmployer, fetchEmployers } from "@/api/resources";
import { useAuth } from "@/context/AuthContext";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { PleaseSignIn } from "@/components/PleaseSignIn";

export function EmployersPage() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchEmployers>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const list = await fetchEmployers();
    setRows(list);
  }

  useEffect(() => {
    if (!user) {
      setRows([]);
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

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createEmployer({
        name: name.trim(),
        website_url: website.trim() || null,
        notes: notes.trim() || null,
      });
      setName("");
      setWebsite("");
      setNotes("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create employer");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this employer? Applications referencing it may be blocked.")) {
      return;
    }
    setError(null);
    try {
      await deleteEmployer(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (authLoading) return <LoadingBlock />;
  if (!user) {
    return (
      <>
        <PageHeader title="Employers" lede="Central directory for your applications." />
        <PleaseSignIn />
      </>
    );
  }

  if (loading && rows.length === 0) return <LoadingBlock />;

  return (
    <>
      <PageHeader title="Employers" lede="Add employers here, then attach them when you create applications." />

      {error ? (
        <p className="filter-banner" role="alert">
          {error}
        </p>
      ) : null}

      <section className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="inline-form-title">Add employer</h2>
        <form className="form-grid" onSubmit={onAdd}>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Website (optional)</span>
            <input
              className="field-input"
              type="url"
              placeholder="https://"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Notes (optional)</span>
            <input
              className="field-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={saving}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Add employer"}
          </button>
        </form>
      </section>

      <section className="panel panel--flush">
        <div className="panel-head">
          <h2>Employer directory</h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Website</th>
                <th scope="col">Notes</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} id={e.id}>
                  <td className="cell-strong">
                    <Link
                      to={`/applications?employer=${encodeURIComponent(e.id)}`}
                      className="inline-link"
                    >
                      {e.name}
                    </Link>
                  </td>
                  <td className="cell-mono">
                    {e.websiteUrl ? (
                      <a href={e.websiteUrl} className="inline-link" target="_blank" rel="noreferrer">
                        {e.websiteUrl.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="notes-cell">{e.notes ?? "—"}</td>
                  <td>
                    <button type="button" className="btn btn-ghost" onClick={() => onDelete(e.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
