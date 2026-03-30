import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteDocument,
  documentDownloadHref,
  fetchApplications,
  fetchDocuments,
  fetchEmployers,
  uploadDocument,
} from "@/api/resources";
import { useAuth } from "@/context/AuthContext";
import { DOCUMENT_KIND_LABELS } from "@/domain/applicationDocument";
import type { ApplicationDocumentKind } from "@/domain/applicationDocument";
import { employerName } from "@/domain/employer";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { PleaseSignIn } from "@/components/PleaseSignIn";

const KINDS: ApplicationDocumentKind[] = [
  "resume",
  "cover_letter",
  "reference_letter",
  "other",
];

export function ResumesPage() {
  const { user, loading: authLoading } = useAuth();
  const [docs, setDocs] = useState<Awaited<ReturnType<typeof fetchDocuments>>>([]);
  const [apps, setApps] = useState<Awaited<ReturnType<typeof fetchApplications>>>([]);
  const [employers, setEmployers] = useState<Awaited<ReturnType<typeof fetchEmployers>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<ApplicationDocumentKind>("resume");
  const [label, setLabel] = useState("");
  const [applicationId, setApplicationId] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    const [d, a, e] = await Promise.all([
      fetchDocuments(),
      fetchApplications(),
      fetchEmployers(),
    ]);
    setDocs(d);
    setApps(a);
    setEmployers(e);
  }

  useEffect(() => {
    if (!user) {
      setDocs([]);
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

  function applicationLabel(id: string | null): string {
    if (!id) return "— (library)";
    const a = apps.find((x) => x.id === id);
    if (!a) return id;
    return `${employerName(employers, a.employerId)} — ${a.role}`;
  }

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !label.trim()) return;
    setUploading(true);
    setError(null);
    try {
      await uploadDocument({
        file,
        kind,
        label: label.trim(),
        applicationId: applicationId || null,
      });
      setFile(null);
      setLabel("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this document?")) return;
    setError(null);
    try {
      await deleteDocument(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (authLoading) return <LoadingBlock />;
  if (!user) {
    return (
      <>
        <PageHeader title="Resumes & documents" lede="Upload files linked to applications." />
        <PleaseSignIn />
      </>
    );
  }

  if (loading && docs.length === 0) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        title="Resumes & documents"
        lede="Files are stored on the API server under your account."
      />

      {error ? (
        <p className="filter-banner" role="alert">
          {error}
        </p>
      ) : null}

      <section className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 className="inline-form-title">Upload document</h2>
        <form className="form-grid" onSubmit={onUpload}>
          <label className="field">
            <span className="field-label">File</span>
            <input
              className="field-input"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={uploading}
            />
          </label>
          <label className="field">
            <span className="field-label">Kind</span>
            <select
              className="filter-select"
              value={kind}
              onChange={(e) => setKind(e.target.value as ApplicationDocumentKind)}
              disabled={uploading}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {DOCUMENT_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Label</span>
            <input
              className="field-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              disabled={uploading}
            />
          </label>
          <label className="field">
            <span className="field-label">Application (optional)</span>
            <select
              className="filter-select"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              disabled={uploading}
            >
              <option value="">Library only</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {employerName(employers, a.employerId)} — {a.role}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </section>

      <section className="panel panel--flush">
        <div className="panel-head">
          <h2>All documents</h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Label</th>
                <th scope="col">File</th>
                <th scope="col">Application</th>
                <th scope="col">Uploaded</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} id={`doc-${d.id}`}>
                  <td>{DOCUMENT_KIND_LABELS[d.kind]}</td>
                  <td className="cell-strong">{d.label}</td>
                  <td className="cell-mono">
                    <a href={documentDownloadHref(d.id)} className="inline-link" target="_blank" rel="noreferrer">
                      {d.fileName}
                    </a>
                  </td>
                  <td>
                    {d.applicationId ? (
                      <Link to={`/applications#${d.applicationId}`} className="inline-link">
                        {applicationLabel(d.applicationId)}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="cell-mono">{d.uploadedAt.slice(0, 10)}</td>
                  <td>
                    <button type="button" className="btn btn-ghost" onClick={() => onDelete(d.id)}>
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
