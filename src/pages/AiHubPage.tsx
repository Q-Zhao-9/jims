import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";

export function AiHubPage() {
  const [jd, setJd] = useState(
    "We are hiring a Senior Backend Engineer with Python, PostgreSQL, and distributed systems experience...",
  );

  return (
    <>
      <PageHeader
        title="AI assistant"
        lede="Job description analysis, resume matching, interview prep, and smart reminders — powered by LLM APIs when wired (SRS §4)."
      />

      <div className="ai-grid">
        <section className="ai-tool panel">
          <h2 className="ai-tool__title">Job description analyzer</h2>
          <p className="ai-tool__hint">Extract skills, gaps vs your resume, and keywords (FR-28–30).</p>
          <label className="field">
            <span className="field-label">Job description</span>
            <textarea
              className="field-input field-input--area"
              rows={5}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </label>
          <button type="button" className="btn btn-primary" disabled>
            Analyze (mock)
          </button>
        </section>

        <section className="ai-tool panel">
          <h2 className="ai-tool__title">Resume–job matching</h2>
          <p className="ai-tool__hint">Hybrid embedding + LLM scoring with explainable output (FR-31–33).</p>
          <p className="ai-placeholder">Match score and rationale will appear here after the backend runs.</p>
          <button type="button" className="btn btn-ghost" disabled>
            Run match (mock)
          </button>
        </section>

        <section className="ai-tool panel">
          <h2 className="ai-tool__title">Interview preparation</h2>
          <p className="ai-tool__hint">Topics, gaps, and company-specific hints (FR-34–36).</p>
          <p className="ai-placeholder">Suggestions will list here once an application is selected server-side.</p>
          <button type="button" className="btn btn-ghost" disabled>
            Generate prep (mock)
          </button>
        </section>

        <section className="ai-tool panel">
          <h2 className="ai-tool__title">Smart reminders</h2>
          <p className="ai-tool__hint">Follow-up timing and deadline awareness (FR-37–39).</p>
          <p className="ai-placeholder">Proposed reminders will sync with the Reminders module.</p>
          <button type="button" className="btn btn-ghost" disabled>
            Suggest reminders (mock)
          </button>
        </section>
      </div>
    </>
  );
}
