export type ReminderChannel = "in_app" | "email";

export interface Reminder {
  id: string;
  title: string;
  dueAt: string;
  channel: ReminderChannel;
  applicationId: string | null;
}

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: "rem-1",
    title: "Follow up with Northwind after system design",
    dueAt: "2026-04-05T09:00:00.000Z",
    channel: "in_app",
    applicationId: "app-seed-1",
  },
  {
    id: "rem-2",
    title: "Contoso application deadline",
    dueAt: "2026-04-01T23:59:59.000Z",
    channel: "email",
    applicationId: "app-seed-2",
  },
  {
    id: "rem-3",
    title: "Prep STAR stories for behavioral rounds",
    dueAt: "2026-03-31T12:00:00.000Z",
    channel: "in_app",
    applicationId: null,
  },
];
