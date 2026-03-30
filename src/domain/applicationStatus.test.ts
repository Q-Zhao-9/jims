import { describe, it, expect } from "vitest";
import {
  APPLICATION_STATUSES,
  isApplicationStatus,
  statusIndex,
  type ApplicationStatus,
} from "./applicationStatus";

describe("APPLICATION_STATUSES", () => {
  it("matches SRS FR-8 order and values", () => {
    expect(APPLICATION_STATUSES).toEqual([
      "Saved",
      "Applied",
      "OA",
      "Interview",
      "Final Round",
      "Offer",
      "Rejected",
      "Ghosted",
    ]);
  });
});

describe("isApplicationStatus", () => {
  it("returns true for every defined status", () => {
    for (const s of APPLICATION_STATUSES) {
      expect(isApplicationStatus(s)).toBe(true);
    }
  });

  it("returns false for unknown or non-string values", () => {
    expect(isApplicationStatus("Pending")).toBe(false);
    expect(isApplicationStatus("")).toBe(false);
    expect(isApplicationStatus(null)).toBe(false);
    expect(isApplicationStatus(1)).toBe(false);
  });
});

describe("statusIndex", () => {
  it("returns stable indices for pipeline ordering", () => {
    expect(statusIndex("Saved")).toBe(0);
    expect(statusIndex("Offer")).toBe(5);
    expect(statusIndex("Ghosted")).toBe(7);
  });

  it("throws for invalid status", () => {
    expect(() => statusIndex("Unknown" as ApplicationStatus)).toThrow();
  });
});
