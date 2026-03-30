import { useEffect, useMemo, useState } from "react";
import type { DashboardStatsDTO } from "@/api/mappers";
import { fetchDashboardStats } from "@/api/resources";
import { useAuth } from "@/context/AuthContext";
import { APPLICATION_STATUSES } from "@/domain/applicationStatus";
import { LoadingBlock } from "@/components/LoadingBlock";
import { PageHeader } from "@/components/PageHeader";
import { PleaseSignIn } from "@/components/PleaseSignIn";
import { StatCard } from "@/components/StatCard";

export function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setStats(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchDashboardStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
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

  const maxStatus = useMemo(() => {
    if (!stats) return 1;
    let m = 1;
    for (const s of APPLICATION_STATUSES) {
      m = Math.max(m, stats.by_status[s] ?? 0);
    }
    return m;
  }, [stats]);

  if (authLoading) return <LoadingBlock />;
  if (!user) {
    return (
      <>
        <PageHeader title="Analytics" lede="Aggregated metrics from your data." />
        <PleaseSignIn />
      </>
    );
  }

  if (loading && !stats) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        title="Analytics"
        lede="Application counts and conversion — same definitions as the dashboard API."
      />

      {error ? (
        <p className="filter-banner" role="alert">
          {error}
        </p>
      ) : null}

      <section className="stats" aria-label="Key metrics">
        <StatCard
          label="Total applications"
          value={stats ? String(stats.total) : "—"}
          hint="FR-40"
        />
        <StatCard
          label="Interview conversion"
          value={
            stats?.interview_conversion_rate == null
              ? "—"
              : `${Math.round(stats.interview_conversion_rate * 100)}%`
          }
          hint="FR-41"
        />
        <StatCard
          label="Offers"
          value={stats ? String(stats.by_status?.Offer ?? 0) : "—"}
          hint="FR-42"
        />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Applications by status</h2>
        </div>
        <div className="bar-chart" role="img" aria-label="Counts by status">
          {APPLICATION_STATUSES.map((s) => {
            const v = stats?.by_status[s] ?? 0;
            const pct = maxStatus ? Math.round((v / maxStatus) * 100) : 0;
            return (
              <div key={s} className="bar-row">
                <span className="bar-label">{s}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="bar-value">{v}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Coming soon</h2>
        </div>
        <ul className="muted-list">
          <li>Response latency metrics (FR-43) — needs event timestamps from backend.</li>
          <li>Resume performance comparison (FR-44) — link offers to resume versions.</li>
          <li>Company category success (FR-45) — tag companies or industries.</li>
          <li>Skill-gap analytics (FR-46) — aggregate JD analysis outputs.</li>
        </ul>
      </section>
    </>
  );
}
