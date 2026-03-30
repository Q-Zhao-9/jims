export interface ApplicationNotes {
  applicationId: string;
  interviewFeedback: string;
  recruiterInteractions: string;
  improvementPoints: string;
}

export const MOCK_NOTES: ApplicationNotes[] = [
  {
    applicationId: "app-seed-1",
    interviewFeedback:
      "Strong API design discussion; need clearer trade-off narrative when choosing sync vs async.",
    recruiterInteractions:
      "Recruiter confirmed panel format on Mar 20; sent prep doc link.",
    improvementPoints: "Practice drawing sequence diagrams under time pressure.",
  },
  {
    applicationId: "app-seed-2",
    interviewFeedback: "—",
    recruiterInteractions: "Initial screen completed; waiting for hiring manager review.",
    improvementPoints: "Add one concrete Spark tuning example to talking points.",
  },
];
