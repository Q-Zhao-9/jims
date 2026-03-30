import { useEffect, useMemo, useState } from "react";
import type { DashboardStatsDTO } from "@/api/mappers";
import {
  fetchApplications,
  fetchDashboardStats,
  fetchDocuments,
  fetchEmployers,
  fetchInterviews,
} from "@/api/resources";
import { useAuth } from "@/context/AuthContext";
import type { Application } from "@/domain/application";
import type { ApplicationStatus } from "@/domain/applicationStatus";
import { APPLICATION_STATUSES } from "@/domain/applicationStatus";
import { sortApplicationsByEmployerName } from "@/domain/application";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { PleaseSignIn } from "@/components/PleaseSignIn";
import { StatCard } from "@/components/StatCard";

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<Application[]>([]);
  const [employers, setEmployers] = useState<Awaited<ReturnType<typeof fetchEmployers>>>([]);
  const [documents, setDocuments] = useState<Awaited<ReturnType<typeof fetchDocuments>>>([]);
  const [interviews, setInterviews] = useState<Awaited<ReturnType<typeof fetchInterviews>>>([]);

  useEffect(() => {
    if (!user) {
      setApps([]);
      setEmployers([]);
      setDocuments([]);
      setInterviews([]);
      setStats(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [st, a, e, d, i] = await Promise.all([
          fetchDashboardStats(),
          fetchApplications(),
          fetchEmployers(),
          fetchDocuments(),
          fetchInterviews(),
        ]);
        if (!cancelled) {
          setStats(st);
          setApps(a);
          setEmployers(e);
          setDocuments(d);
          setInterviews(i);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const rows = useMemo(() => {
    const sorted = sortApplicationsByEmployerName(apps, employers);
    if (filter === "all") return sorted;
    return sorted.filter((r) => r.status === filter);
  }, [apps, employers, filter]);

  if (authLoading) {
    return <LoadingBlock />;
  }

  if (!user) {
    return (
      <>
        <PageHeader title="Dashboard" lede="Sign in to see your applications and stats from the API." />
        <PleaseSignIn />
      </>
    );
  }

  if (loading && !stats) {
    return <LoadingBlock />;
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        lede="Overview of your pipeline — data from your JIMS account."
      />

      {error ? (
        <p className="filter-banner" role="alert">
          {error}
        </p>
      ) : null}

      <section className="stats" aria-label="Summary statistics">
        <StatCard
          label="Total applications"
          value={stats ? String(stats.total) : "—"}
          hint="All tracked roles"
        />
        <StatCard
          label="Interview conversion"
          value={
            stats?.interview_conversion_rate == null
              ? "—"
              : `${Math.round(stats.interview_conversion_rate * 100)}%`
          }
          hint="Among Applied+ pipeline"
        />
        <StatCard
          label="Active offers"
          value={stats ? String(stats.by_status?.Offer ?? 0) : "—"}
          hint="Statuses: Offer"
        />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Applications</h2>
          <label className="filter">
            <span className="filter-label">Status</span>
            <select
              className="filter-select"
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as ApplicationStatus | "all")
              }
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
        <ApplicationsTable
          rows={rows}
          employers={employers}
          documents={documents}
          interviews={interviews}
        />
      </section>
    </>
  );
}
