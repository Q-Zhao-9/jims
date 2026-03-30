import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createApplication,
  createEmployer,
  fetchApplications,
  fetchDocuments,
  fetchEmployers,
  fetchInterviews,
  patchApplication,
} from "@/api/resources";
import { useAuth } from "@/context/AuthContext";
import type { Application } from "@/domain/application";
import type { ApplicationStatus } from "@/domain/applicationStatus";
import { APPLICATION_STATUSES } from "@/domain/applicationStatus";
import { sortApplicationsByEmployerName } from "@/domain/application";
import { WORK_MODE_LABELS, WORK_MODES } from "@/domain/workMode";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { ApplicationEditModal } from "@/components/ApplicationEditModal";
import { EmployerAutocomplete } from "@/components/EmployerAutocomplete";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { PleaseSignIn } from "@/components/PleaseSignIn";

export function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const employerFilter = searchParams.get("employer") ?? "";
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<Awaited<ReturnType<typeof fetchApplications>>>([]);
  const [employers, setEmployers] = useState<Awaited<ReturnType<typeof fetchEmployers>>>([]);
  const [documents, setDocuments] = useState<Awaited<ReturnType<typeof fetchDocuments>>>([]);
  const [interviews, setInterviews] = useState<Awaited<ReturnType<typeof fetchInterviews>>>([]);

  const [addEmployerName, setAddEmployerName] = useState("");
  const [addPickedEmployerId, setAddPickedEmployerId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Saved");
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Application | null>(null);

  async function load(): Promise<{ apps: Application[] } | undefined> {
    if (!user) return undefined;
    const [a, e, d, i] = await Promise.all([
      fetchApplications(),
      fetchEmployers(),
      fetchDocuments(),
      fetchInterviews(),
    ]);
    setApps(a);
    setEmployers(e);
    setDocuments(d);
    setInterviews(i);
    return { apps: a };
  }

  const ensureEmployerId = useCallback(
    async (name: string): Promise<string> => {
      const t = name.trim();
      if (!t) throw new Error("Employer name is required");
      const existing = employers.find((em) => em.name.toLowerCase() === t.toLowerCase());
      if (existing) return existing.id;
      const created = await createEmployer({
        name: t,
        website_url: null,
        notes: null,
      });
      setEmployers((prev) => {
        if (prev.some((em) => em.id === created.id)) return prev;
        return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
      });
      return created.id;
    },
    [employers],
  );

  useEffect(() => {
    if (!user) {
      setApps([]);
      setEmployers([]);
      setDocuments([]);
      setInterviews([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    load()
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const rows = useMemo(() => {
    let list = sortApplicationsByEmployerName(apps, employers);
    if (employerFilter) {
      list = list.filter((r) => r.employerId === employerFilter);
    }
    if (filter === "all") return list;
    return list.filter((r) => r.status === filter);
  }, [apps, employers, filter, employerFilter]);

  function setEmployerFilter(employerId: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (employerId) next.set("employer", employerId);
        else next.delete("employer");
        return next;
      },
      { replace: true },
    );
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim()) return;
    setSaving(true);
    setError(null);
    try {
      let employerId = addPickedEmployerId;
      if (!employerId) {
        employerId = await ensureEmployerId(addEmployerName);
      }
      await createApplication({
        employer_id: employerId,
        role: role.trim(),
        status,
        notes: "",
        salary: salary.trim() ? salary.trim() : null,
        work_mode: workMode ? workMode : null,
        source_url: sourceUrl.trim() ? sourceUrl.trim() : null,
      });
      setRole("");
      setSalary("");
      setWorkMode("");
      setSourceUrl("");
      setAddEmployerName("");
      setAddPickedEmployerId(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create application");
    } finally {
      setSaving(false);
    }
  }

  async function refreshWhileEditing() {
    const result = await load();
    if (result?.apps) {
      setEditing((prev) => {
        if (!prev) return null;
        return result.apps.find((x) => x.id === prev.id) ?? prev;
      });
    }
  }

  if (authLoading) return <LoadingBlock />;
  if (!user) {
    return (
      <>
        <PageHeader title="Applications" lede="Track roles and pipeline stages." />
        <PleaseSignIn />
      </>
    );
  }

  if (loading && apps.length === 0) {
    return <LoadingBlock />;
  }

  return (
    <>
      <PageHeader
        title="Applications"
        ledeWide
        lede="Type an employer name (with suggestions) or pick from the list—new employers are added when you save. Click a role in the table to open an application and upload documents, log interviews, or change details."
      />

      {error ? (
        <p className="filter-banner" role="alert">
          {error}
        </p>
      ) : null}

      <details className="panel panel-details" style={{ marginBottom: "1.25rem" }}>
        <summary className="panel-details__summary">Add application</summary>
        <div className="panel-details__body">
        <form className="form-grid" onSubmit={onAdd}>
          <label className="field">
            <span className="field-label">Employer</span>
            <EmployerAutocomplete
              employers={employers}
              value={addEmployerName}
              onChange={(n) => {
                setAddEmployerName(n);
                setAddPickedEmployerId(null);
              }}
              onPickEmployer={(id) => setAddPickedEmployerId(id)}
              disabled={saving}
            />
          </label>
          <label className="field">
            <span className="field-label">Role</span>
            <input
              className="field-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Job title"
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
          <div className="form-row" style={{ justifyContent: "flex-end" }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Add application"}
            </button>
          </div>
        </form>
        </div>
      </details>

      <section className="panel">
        <div className="panel-head panel-head--wrap">
          <h2>All applications</h2>
          <div className="panel-filters">
            <label className="filter">
              <span className="filter-label">Employer</span>
              <select
                className="filter-select"
                value={employerFilter}
                onChange={(e) => setEmployerFilter(e.target.value)}
              >
                <option value="">All employers</option>
                {[...employers]
                  .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
                  .map((em) => (
                    <option key={em.id} value={em.id}>
                      {em.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="filter">
              <span className="filter-label">Status</span>
              <select
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value as ApplicationStatus | "all")}
              >
                <option value="all">All</option>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <ApplicationsTable
          rows={rows}
          employers={employers}
          documents={documents}
          interviews={interviews}
          onEditApplication={(app) => setEditing(app)}
        />
      </section>

      {editing ? (
        <ApplicationEditModal
          application={editing}
          employers={employers}
          documents={documents}
          resolveEmployerId={ensureEmployerId}
          onClose={() => setEditing(null)}
          onRefresh={refreshWhileEditing}
          onSave={async (patch) => {
            await patchApplication(editing.id, patch);
            setEditing(null);
            await load();
          }}
        />
      ) : null}
    </>
  );
}
