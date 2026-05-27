import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { ResumesPage } from "@/pages/ResumesPage";
import { InterviewsPage } from "@/pages/InterviewsPage";
import { RemindersPage } from "@/pages/RemindersPage";
import { NotesFeedbackPage } from "@/pages/NotesFeedbackPage";
import { AiHubPage } from "@/pages/AiHubPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { AuthPage } from "@/pages/AuthPage";
import { EmployersPage } from "@/pages/EmployersPage";
import { SalaryCalculatorPage } from "@/pages/SalaryCalculatorPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="employers" element={<EmployersPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="resumes" element={<ResumesPage />} />
        <Route path="interviews" element={<InterviewsPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="notes" element={<NotesFeedbackPage />} />
        <Route path="ai" element={<AiHubPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="salary" element={<SalaryCalculatorPage />} />
        <Route path="sign-in" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
