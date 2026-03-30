import { ApiError, apiJson, apiUrl } from "./client";
import type {
  ApplicationDTO,
  DashboardStatsDTO,
  DocumentDTO,
  EmployerDTO,
  InterviewDTO,
  ReminderDTO,
  UserDTO,
} from "./mappers";
import {
  mapApplication,
  mapDocument,
  mapEmployer,
  mapInterview,
  mapReminder,
} from "./mappers";
import type { Application } from "@/domain/application";
import type { ApplicationDocument } from "@/domain/applicationDocument";
import type { Employer } from "@/domain/employer";
import type { InterviewEvent } from "@/domain/interview";
import type { Reminder } from "@/domain/reminder";

export async function getMe(): Promise<UserDTO | null> {
  try {
    return await apiJson<UserDTO>("/auth/me");
  } catch (e: unknown) {
    if (e instanceof ApiError && e.status === 401) {
      return null;
    }
    throw e;
  }
}

export async function registerUser(body: {
  email: string;
  password: string;
}): Promise<UserDTO> {
  return apiJson<UserDTO>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function loginUser(body: {
  email: string;
  password: string;
}): Promise<UserDTO> {
  return apiJson<UserDTO>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function logoutUser(): Promise<void> {
  await apiJson("/auth/logout", { method: "POST" });
}

export async function fetchEmployers(): Promise<Employer[]> {
  const rows = await apiJson<EmployerDTO[]>("/employers");
  return rows.map(mapEmployer);
}

export async function createEmployer(body: {
  name: string;
  website_url: string | null;
  notes: string | null;
}): Promise<Employer> {
  const row = await apiJson<EmployerDTO>("/employers", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapEmployer(row);
}

export async function deleteEmployer(id: string): Promise<void> {
  await apiJson(`/employers/${id}`, { method: "DELETE" });
}

export async function fetchApplications(): Promise<Application[]> {
  const rows = await apiJson<ApplicationDTO[]>("/applications");
  return rows.map(mapApplication);
}

export async function createApplication(body: {
  employer_id: string;
  role: string;
  status?: string;
  notes?: string;
  salary?: string | null;
  work_mode?: string | null;
  source_url?: string | null;
}): Promise<Application> {
  const row = await apiJson<ApplicationDTO>("/applications", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapApplication(row);
}

export async function patchApplication(
  id: string,
  body: Record<string, unknown>,
): Promise<Application> {
  const row = await apiJson<ApplicationDTO>(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return mapApplication(row);
}

export async function fetchDocuments(
  applicationId?: string | null,
): Promise<ApplicationDocument[]> {
  const q =
    applicationId != null
      ? `?application_id=${encodeURIComponent(applicationId)}`
      : "";
  const rows = await apiJson<DocumentDTO[]>(`/documents${q}`);
  return rows.map(mapDocument);
}

export async function uploadDocument(params: {
  file: File;
  kind: string;
  label: string;
  applicationId?: string | null;
}): Promise<ApplicationDocument> {
  const fd = new FormData();
  fd.append("file", params.file);
  fd.append("kind", params.kind);
  fd.append("label", params.label);
  if (params.applicationId) {
    fd.append("application_id", params.applicationId);
  }
  const res = await fetch(apiUrl("/documents"), {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(
      res.status,
      typeof data === "object" && data && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : res.statusText,
      data,
    );
  }
  return mapDocument(data as DocumentDTO);
}

export async function deleteDocument(id: string): Promise<void> {
  await apiJson(`/documents/${id}`, { method: "DELETE" });
}

export function documentDownloadHref(documentId: string): string {
  return apiUrl(`/documents/${documentId}/file`);
}

export async function fetchInterviews(
  applicationId?: string | null,
): Promise<InterviewEvent[]> {
  const q =
    applicationId != null
      ? `?application_id=${encodeURIComponent(applicationId)}`
      : "";
  const rows = await apiJson<InterviewDTO[]>(`/interviews${q}`);
  return rows.map(mapInterview);
}

export async function createInterview(body: {
  application_id: string;
  interview_type: string;
  scheduled_at: string;
  meeting_link?: string | null;
  interviewers?: string;
  notes?: string;
}): Promise<InterviewEvent> {
  const row = await apiJson<InterviewDTO>("/interviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapInterview(row);
}

export async function fetchReminders(): Promise<Reminder[]> {
  const rows = await apiJson<ReminderDTO[]>("/reminders");
  return rows.map(mapReminder);
}

export async function createReminder(body: {
  title: string;
  due_at: string;
  channel: "in_app" | "email";
  application_id?: string | null;
}): Promise<Reminder> {
  const row = await apiJson<ReminderDTO>("/reminders", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapReminder(row);
}

export async function fetchDashboardStats(): Promise<DashboardStatsDTO> {
  return apiJson<DashboardStatsDTO>("/stats/dashboard");
}
