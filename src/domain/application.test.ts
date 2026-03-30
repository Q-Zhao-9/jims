import { describe, it, expect } from "vitest";
import {
  createApplicationDraft,
  filterApplicationsByStatus,
  sortApplicationsByEmployerName,
  type Application,
} from "./application";
import type { Employer } from "./employer";

const employers: Employer[] = [
  { id: "e1", name: "zebra", websiteUrl: null, notes: null },
  { id: "e2", name: "Alpha", websiteUrl: null, notes: null },
];

describe("createApplicationDraft", () => {
  it("creates an application with Saved status and empty notes", () => {
    const a = createApplicationDraft({
      employerId: "emp-1",
      role: "Engineer",
    });
    expect(a.employerId).toBe("emp-1");
    expect(a.role).toBe("Engineer");
    expect(a.status).toBe("Saved");
    expect(a.notes).toBe("");
    expect(a.resumeDocumentId).toBeNull();
    expect(a.documentIds).toEqual([]);
    expect(a.id).toMatch(/^app-/);
  });
});

describe("filterApplicationsByStatus", () => {
  const rows: Application[] = [
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
  ];

  it("returns only rows matching the status", () => {
    expect(filterApplicationsByStatus(rows, "Applied")).toHaveLength(1);
    expect(filterApplicationsByStatus(rows, "Applied")[0]?.employerId).toBe("e1");
  });
});

describe("sortApplicationsByEmployerName", () => {
  it("sorts case-insensitively by employer name", () => {
    const rows: Application[] = [
      {
        id: "1",
        employerId: "e1",
        role: "R",
        salary: null,
        workMode: null,
        sourceUrl: null,
        status: "Saved",
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
        status: "Saved",
        appliedAt: null,
        deadline: null,
        nextActionAt: null,
        notes: "",
        resumeDocumentId: null,
        documentIds: [],
      },
    ];
    const sorted = sortApplicationsByEmployerName(rows, employers);
    expect(sorted.map((r) => r.employerId)).toEqual(["e2", "e1"]);
  });
});
