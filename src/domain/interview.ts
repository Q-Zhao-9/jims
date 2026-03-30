export interface InterviewEvent {
  id: string;
  applicationId: string;
  interviewType: string;
  scheduledAt: string;
  meetingLink: string | null;
  interviewers: string;
  notes: string;
}
