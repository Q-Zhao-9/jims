import type { Application } from "@/domain/application";
import type { ApplicationStatus } from "@/domain/applicationStatus";
import type { ApplicationDocument, ApplicationDocumentKind } from "@/domain/applicationDocument";
import type { Employer } from "@/domain/employer";
import type { InterviewEvent } from "@/domain/interview";
import type { Reminder } from "@/domain/reminder";
import type { WorkMode } from "@/domain/workMode";
import { WORK_MODES } from "@/domain/workMode";

function mapWorkMode(v: string | null): WorkMode | null {
  if (!v) return null;
  return (WORK_MODES as readonly string[]).includes(v) ? (v as WorkMode) : null;
}

/** Raw JSON from FastAPI (snake_case). */
export interface ApplicationDTO {
  id: string;
  employer_id: string;
  role: string;
  salary: string | null;
  work_mode: string | null;
  source_url: string | null;
  status: string;
  applied_at: string | null;
  deadline: string | null;
  next_action_at: string | null;
  notes: string;
  resume_document_id: string | null;
  document_ids: string[];
  interview_feedback: string | null;
  recruiter_interactions: string | null;
  improvement_points: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployerDTO {
  id: string;
  name: string;
  website_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface DocumentDTO {
  id: string;
  application_id: string | null;
  kind: string;
  label: string;
  file_name: string;
  uploaded_at: string;
}

export interface InterviewDTO {
  id: string;
  application_id: string;
  interview_type: string;
  scheduled_at: string;
  meeting_link: string | null;
  interviewers: string;
  notes: string;
  created_at: string;
}

export interface ReminderDTO {
  id: string;
  title: string;
  due_at: string;
  channel: string;
  application_id: string | null;
  created_at: string;
}

export interface DashboardStatsDTO {
  total: number;
  by_status: Record<string, number>;
  interview_conversion_rate: number | null;
}

export interface UserDTO {
  id: string;
  email: string;
}

export function mapEmployer(e: EmployerDTO): Employer {
  return {
    id: e.id,
    name: e.name,
    websiteUrl: e.website_url,
    notes: e.notes,
    createdAt: e.created_at,
  };
}

export function mapApplication(a: ApplicationDTO): Application {
  return {
    id: a.id,
    employerId: a.employer_id,
    role: a.role,
    salary: a.salary,
    workMode: mapWorkMode(a.work_mode),
    sourceUrl: a.source_url,
    status: a.status as ApplicationStatus,
    appliedAt: a.applied_at,
    deadline: a.deadline,
    nextActionAt: a.next_action_at,
    notes: a.notes,
    resumeDocumentId: a.resume_document_id,
    documentIds: a.document_ids ?? [],
    interviewFeedback: a.interview_feedback,
    recruiterInteractions: a.recruiter_interactions,
    improvementPoints: a.improvement_points,
  };
}

export function mapDocument(d: DocumentDTO): ApplicationDocument {
  return {
    id: d.id,
    applicationId: d.application_id,
    kind: d.kind as ApplicationDocumentKind,
    label: d.label,
    fileName: d.file_name,
    uploadedAt: d.uploaded_at,
  };
}

export function mapInterview(i: InterviewDTO): InterviewEvent {
  return {
    id: i.id,
    applicationId: i.application_id,
    interviewType: i.interview_type,
    scheduledAt: i.scheduled_at,
    meetingLink: i.meeting_link,
    interviewers: i.interviewers,
    notes: i.notes,
  };
}

export function mapReminder(r: ReminderDTO): Reminder {
  return {
    id: r.id,
    title: r.title,
    dueAt: r.due_at,
    channel: r.channel as Reminder["channel"],
    applicationId: r.application_id,
  };
}
