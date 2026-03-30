import type { Employer } from "@/domain/employer";

export const MOCK_EMPLOYERS: Employer[] = [
  {
    id: "emp-nw",
    name: "Northwind Labs",
    websiteUrl: "https://northwind.example",
    notes: "Remote-friendly; strong infra team.",
  },
  {
    id: "emp-contoso",
    name: "Contoso Analytics",
    websiteUrl: "https://contoso.example",
    notes: null,
  },
  {
    id: "emp-fabrikam",
    name: "Fabrikam Health",
    websiteUrl: null,
    notes: "Healthcare compliance focus.",
  },
  {
    id: "emp-adventure",
    name: "Adventure Works",
    websiteUrl: "https://adventure.example",
    notes: null,
  },
];
