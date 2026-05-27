import { describe, it, expect } from "vitest";
import {
  calculateSalaryLayersFromHourly,
  DEFAULT_SALARY_ASSUMPTIONS,
} from "./salary";

describe("calculateSalaryLayersFromHourly", () => {
  it("calculates daily/monthly/annual from hourly (default assumptions)", () => {
    const s = calculateSalaryLayersFromHourly(50, DEFAULT_SALARY_ASSUMPTIONS);
    expect(s.daily).toBe(400); // 50 * 8
    expect(s.monthly).toBe(8800); // 400 * 22
    expect(s.annual).toBe(105600); // 8800 * 12
  });

  it("throws on negative input", () => {
    expect(() => calculateSalaryLayersFromHourly(-1)).toThrow();
  });

  it("throws on non-finite assumptions", () => {
    expect(() =>
      calculateSalaryLayersFromHourly(10, {
        hoursPerDay: 8,
        daysPerMonth: Number.POSITIVE_INFINITY,
        monthsPerYear: 12,
      }),
    ).toThrow();
  });
});

