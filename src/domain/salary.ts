export type SalaryLayer = "hourly" | "daily" | "monthly" | "annual";

export interface SalaryConversionAssumptions {
  hoursPerDay: number;
  daysPerMonth: number;
  monthsPerYear: number;
}

export interface SalaryBreakdown {
  hourly: number;
  daily: number;
  monthly: number;
  annual: number;
}

export const DEFAULT_SALARY_ASSUMPTIONS: SalaryConversionAssumptions = {
  hoursPerDay: 8,
  daysPerMonth: 22,
  monthsPerYear: 12,
};

function assertFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite non-negative number`);
  }
}

export function calculateSalaryLayersFromHourly(
  hourly: number,
  assumptions: SalaryConversionAssumptions = DEFAULT_SALARY_ASSUMPTIONS,
): SalaryBreakdown {
  assertFiniteNonNegative("hourly", hourly);
  assertFiniteNonNegative("hoursPerDay", assumptions.hoursPerDay);
  assertFiniteNonNegative("daysPerMonth", assumptions.daysPerMonth);
  assertFiniteNonNegative("monthsPerYear", assumptions.monthsPerYear);

  // Layered conversions:
  // annual <- monthly <- daily <- hourly
  const daily = hourly * assumptions.hoursPerDay;
  const monthly = daily * assumptions.daysPerMonth;
  const annual = monthly * assumptions.monthsPerYear;

  return {
    hourly,
    daily,
    monthly,
    annual,
  };
}

