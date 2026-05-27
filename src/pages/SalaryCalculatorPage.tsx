import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PleaseSignIn } from "@/components/PleaseSignIn";
import { useAuth } from "@/context/AuthContext";
import { LoadingBlock } from "@/components/LoadingBlock";
import {
  DEFAULT_SALARY_ASSUMPTIONS,
  calculateSalaryLayersFromHourly,
  type SalaryConversionAssumptions,
} from "@/domain/salary";

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseNonNegativeNumber(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return Number.NaN;
  return n;
}

export function SalaryCalculatorPage() {
  const { user, loading: authLoading } = useAuth();

  const [hourlyText, setHourlyText] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState<number>(
    DEFAULT_SALARY_ASSUMPTIONS.hoursPerDay,
  );
  const [daysPerMonth, setDaysPerMonth] = useState<number>(
    DEFAULT_SALARY_ASSUMPTIONS.daysPerMonth,
  );

  const hourlyValue = useMemo(
    () => parseNonNegativeNumber(hourlyText),
    [hourlyText],
  );

  const assumptions: SalaryConversionAssumptions = useMemo(
    () => ({
      hoursPerDay,
      daysPerMonth,
      monthsPerYear: DEFAULT_SALARY_ASSUMPTIONS.monthsPerYear,
    }),
    [daysPerMonth, hoursPerDay],
  );

  const [error, breakdown] = useMemo((): [string | null, ReturnType<typeof calculateSalaryLayersFromHourly> | null] => {
    if (hourlyValue == null) return [null, null];
    if (Number.isNaN(hourlyValue)) return ["Hourly salary must be a non-negative number.", null];

    try {
      return [null, calculateSalaryLayersFromHourly(hourlyValue, assumptions)];
    } catch (e) {
      return [
        e instanceof Error ? e.message : "Could not calculate salary layers.",
        null,
      ];
    }
  }, [assumptions, hourlyValue]);

  if (authLoading) return <LoadingBlock />;

  if (!user) {
    return (
      <>
        <PageHeader
          title="Salary calculator"
          lede="Sign in to use the app toolbox."
        />
        <PleaseSignIn />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Salary calculator"
        lede="Enter an hourly rate; we compute daily, monthly, and annual salary using configurable layers."
      />

      <section className="panel">
        {error ? (
          <p className="filter-banner" role="alert">
            {error}
          </p>
        ) : null}

        <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span className="field-label">Hourly salary</span>
            <input
              className="field-input"
              type="number"
              inputMode="decimal"
              step={0.01}
              min={0}
              placeholder="e.g. 50"
              value={hourlyText}
              onChange={(e) => setHourlyText(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">Hours per day</span>
            <input
              className="field-input"
              type="number"
              step={0.25}
              min={0}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
            />
          </label>

          <label className="field">
            <span className="field-label">Days per month</span>
            <input
              className="field-input"
              type="number"
              step={1}
              min={0}
              value={daysPerMonth}
              onChange={(e) => setDaysPerMonth(Number(e.target.value))}
            />
          </label>
        </form>

        <div className="section-divider">
          <h2>Computed</h2>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Daily salary</span>
            <input
              className="field-input"
              readOnly
              value={breakdown ? formatMoney(breakdown.daily) : "—"}
            />
          </label>

          <label className="field">
            <span className="field-label">Monthly salary</span>
            <input
              className="field-input"
              readOnly
              value={breakdown ? formatMoney(breakdown.monthly) : "—"}
            />
          </label>

          <label className="field">
            <span className="field-label">Annual salary</span>
            <input
              className="field-input"
              readOnly
              value={breakdown ? formatMoney(breakdown.annual) : "—"}
            />
          </label>
        </div>

        <p className="lede" style={{ marginTop: "1rem" }}>
          Layers: annual = monthly × 12, monthly = daily × {daysPerMonth}, daily = hourly × {hoursPerDay}.
        </p>
      </section>
    </>
  );
}

