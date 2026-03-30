import { describe, it, expect } from "vitest";
import { summarizeApplications } from "./dashboardStats";
import type { Application } from "./application";

describe("summarizeApplications", () => {
  const sample: Application[] = [
    {
      id: "1",
      employerId: "e1",
      role: "R",
      salary: null,
      workMode: null,
      sourceUrl: null,
      status: "Applied",
      appliedAt: null,
      deadline: null,
      nextActionAt: null,
      notes: "",
      resumeDocumentId: null,
      documentIds: [],
    },
    {
      id: "2",
      employerId: "e2",
      role: "R",
      salary: null,
      workMode: null,
      sourceUrl: null,
      status: "Interview",
      appliedAt: null,
      deadline: null,
      nextActionAt: null,
      notes: "",
      resumeDocumentId: null,
      documentIds: [],
    },
    {
      id: "3",
      employerId: "e3",
      role: "R",
      salary: null,
      workMode: null,
      sourceUrl: null,
      status: "Offer",
      appliedAt: null,
      deadline: null,
      nextActionAt: null,
      notes: "",
      resumeDocumentId: null,
      documentIds: [],
    },
  ];

  it("returns total count", () => {
    expect(summarizeApplications(sample).total).toBe(3);
  });

  it("counts rows per status", () => {
    const s = summarizeApplications(sample);
    expect(s.byStatus.Applied).toBe(1);
    expect(s.byStatus.Interview).toBe(1);
    expect(s.byStatus.Offer).toBe(1);
    expect(s.byStatus.Saved).toBe(0);
  });

  it("computes interview conversion as interview-or-later over applied-or-later", () => {
    const s = summarizeApplications(sample);
    expect(s.interviewConversionRate).toBeCloseTo(2 / 3);
  });
});
