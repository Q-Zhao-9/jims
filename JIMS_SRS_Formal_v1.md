
# Software Requirements Specification (SRS)
## Job Interview Management System (JIMS)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the **Job Interview Management System (JIMS)**. The system is a multi-user web-based platform designed to help job applicants manage job applications, resumes, interviews, reminders, analytics, and AI-assisted preparation workflows.

### 1.2 Intended Audience
This document is intended for:
- Developers
- Project supervisors
- Portfolio reviewers
- Future collaborators

### 1.3 Scope
JIMS enables users to:
- Track job applications
- Manage multiple resume versions
- Log interview schedules
- Record feedback and preparation notes
- Receive LLM-based intelligent assistance
- Analyze application success patterns

---

## 2. Overall Description

### 2.1 Product Perspective
JIMS is a standalone web-based multi-user system deployed locally in Version 1 (V1). It integrates structured tracking tools with LLM-powered assistants to enhance applicant productivity.

### 2.2 User Classes

Primary users:
- Individual job applicants

Administrative users:
- Not included in Version 1 (future extension planned)

### 2.3 Operating Environment

Frontend:
- Modern web browser (Chrome, Edge, Firefox)

Backend:
- FastAPI application server

Database:
- PostgreSQL (recommended)

Deployment:
- Localhost environment (Version 1)

Authentication:
- Email + password authentication

---

## 3. System Features (Functional Requirements)

### 3.1 User Authentication Module

The system shall:

- FR-1 Allow user registration using email and password
- FR-2 Allow secure login/logout
- FR-3 Store encrypted credentials
- FR-4 Support session-based authentication

---

### 3.2 Application Tracking Module

The system shall:

- FR-5 Allow users to create job application records
- FR-6 Allow editing application metadata
- FR-7 Allow deleting application records
- FR-8 Support status values:

```
Saved
Applied
OA
Interview
Final Round
Offer
Rejected
Ghosted
```

- FR-9 Record application submission date
- FR-10 Record deadlines
- FR-11 Record next-action reminders
- FR-12 Attach notes to applications

---

### 3.3 Resume Management Module

The system shall:

- FR-13 Allow uploading multiple resume versions
- FR-14 Store resume files locally (Version 1)
- FR-15 Link resumes to job applications
- FR-16 Maintain resume usage history

---

### 3.4 Interview Logging Module

The system shall:

- FR-17 Record interview events
- FR-18 Store interview type
- FR-19 Store meeting links
- FR-20 Record interviewer information
- FR-21 Store interview notes

---

### 3.5 Reminder System

The system shall:

- FR-22 Provide in-app reminders
- FR-23 Provide email reminders
- FR-24 Provide calendar reminders (future integration ready)

---

### 3.6 Notes and Feedback Module

The system shall:

- FR-25 Allow structured interview feedback logging
- FR-26 Allow recruiter interaction tracking
- FR-27 Allow improvement-point tracking

---

## 4. AI-Enhanced Functional Modules 🤖

### 4.1 Job Description Analyzer

The system shall:

- FR-28 Extract required skills from job descriptions
- FR-29 Identify missing skills relative to user resume
- FR-30 Highlight critical keywords

---

### 4.2 Resume–Job Matching Engine

The system shall:

- FR-31 Compute similarity scores using hybrid embedding + LLM scoring
- FR-32 Provide interpretable match-score outputs
- FR-33 Support explainability extensions

---

### 4.3 Interview Preparation Assistant

The system shall:

- FR-34 Suggest interview preparation topics
- FR-35 Highlight knowledge gaps
- FR-36 Provide company-specific preparation hints

---

### 4.4 Smart Reminder Assistant

The system shall:

- FR-37 Generate intelligent follow-up reminders
- FR-38 Detect approaching deadlines
- FR-39 Suggest preparation timing strategies

---

## 5. Analytics and Visualization Module 📊

The system shall:

- FR-40 Display total application counts
- FR-41 Display interview conversion rate
- FR-42 Display offer conversion rate
- FR-43 Display response latency metrics
- FR-44 Provide resume performance comparison analytics
- FR-45 Provide company-category success-rate visualization
- FR-46 Provide skill-gap analytics derived from job descriptions

---

## 6. External Interface Requirements

### 6.1 User Interface

The system shall:

- Support responsive layout
- Provide dashboard visualization
- Provide table-based application tracking
- Support intuitive navigation

### 6.2 Hardware Interface

No specialized hardware required.

### 6.3 Software Interface

External dependencies:

- LLM API integration
- Email notification services
- Optional calendar APIs (future-ready)

### 6.4 Communications Interface

HTTPS-ready architecture for future deployment

---

## 7. Non-Functional Requirements ⚙️

### 7.1 Performance Requirements

The system shall:

- NFR-1 Support hundreds of applications per user
- NFR-2 Provide responsive dashboard rendering

### 7.2 Security Requirements

The system shall:

- NFR-3 Encrypt stored credentials
- NFR-4 Protect user-specific records
- NFR-5 Prevent unauthorized access

### 7.3 Usability Requirements

The system shall:

- NFR-6 Support mobile-first usability
- NFR-7 Provide intuitive workflow navigation

### 7.4 Scalability Requirements

The system shall:

- NFR-8 Support transition to cloud deployment
- NFR-9 Support multi-user scaling architecture

---

## 8. Data Requirements

Entities include:

- Users
- Applications
- Resumes
- Interviews
- Notes
- Reminders
- Analytics metadata

Relationships:

- One user → multiple applications
- One application → one resume reference
- One application → multiple interview records

---

## 9. Assumptions and Constraints

### Assumptions

- Users operate via modern browsers
- LLM APIs remain accessible

### Constraints

- Version 1 deployed locally
- Resume files stored locally
- Calendar integration deferred to future release

---

## 10. Future Enhancements 🚀

Planned upgrades include:

- Cloud deployment architecture
- Resume A/B testing analytics
- Job recommendation engine
- Multi-provider authentication
- External calendar synchronization
