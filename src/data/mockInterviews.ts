export interface InterviewEvent {
  id: string;
  applicationId: string;
  interviewType: string;
  scheduledAt: string;
  meetingLink: string | null;
  interviewers: string;
  notes: string;
}

export const MOCK_INTERVIEWS: InterviewEvent[] = [
  {
    id: "int-1",
    applicationId: "app-seed-1",
    interviewType: "Technical — system design",
    scheduledAt: "2026-04-02T15:00:00.000Z",
    meetingLink: "https://meet.example.com/nw-abc",
    interviewers: "Alex Rivera, Jamie Chen",
    notes: "Focus on distributed transactions and idempotency.",
  },
  {
    id: "int-2",
    applicationId: "app-seed-3",
    interviewType: "Behavioral",
    scheduledAt: "2026-02-22T18:30:00.000Z",
    meetingLink: null,
    interviewers: "Taylor Morgan",
    notes: "Discussed on-call and incident response.",
  },
];
