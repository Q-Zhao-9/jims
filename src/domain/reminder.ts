export type ReminderChannel = "in_app" | "email";

export interface Reminder {
  id: string;
  title: string;
  dueAt: string;
  channel: ReminderChannel;
  applicationId: string | null;
}
