Sentinel-Law
The Shadow AI & Compliance Auditor

Team T-29 | GLA University
Version: v0.1 (Project Initialization)

📌 Project Overview

Sentinel-Law is an AI-driven compliance auditing system designed to silently and passively analyze organizational documents and communications to detect potential legal, regulatory, and internal policy risks.

Unlike traditional compliance tools, Sentinel-Law operates in read-only mode, ensuring zero disruption to existing business workflows while producing explainable audit findings mapped to laws and policies.

🎯 Problem Statement

Organizations generate massive volumes of documents (contracts, emails, financial records, policies).
Manual compliance audits are:

Time-consuming

Reactive

Error-prone

As a result, compliance risks often remain unnoticed until they escalate into serious legal or ethical issues.

🚀 Project Goals

Passively analyze documents without modifying them

Detect potential compliance risks using NLP & AI

Map findings to predefined laws and internal policies

Provide clear explanations and evidence for each risk

Generate structured, downloadable audit reports

🚫 Non-Goals (v1)

Automated enforcement or corrective actions

Replacing human auditors or legal professionals

Full global law coverage

Real-time integration with production systems

Voice, chat, or mobile support

-> Key Features (Planned)

Read-only document ingestion

Clause extraction using NLP

Compliance risk detection

Law & policy mapping

Evidence-based explainability

Structured audit report generation

Web-based dashboard

-> High-Level Architecture

Frontend: React (Single Page Application)

Backend: Node.js + Express

AI/NLP: Python-based NLP & LLM components

Database: MongoDB

Storage: Secure document repository (read-only)

🧑‍💻 Team & Roles
Name	Role	Responsibilities
Sneha Chaudhary	Team Lead	Scope finalization, AI/NLP design, coordination
Sarvagya Saxena	Full-Stack Developer	Frontend UI, dashboard, report views
Somesh Rajput	Full-Stack & AI Developer	Backend APIs, document pipeline, AI integration
Project Status

Current Phase: Project Initialization

Requirements finalized

Repository setup

README & documentation

CI/CD pipeline planning

🔁 CI/CD Pipeline (Planned)

We aim to maintain a clean and automated development workflow using GitHub Actions.

Planned Pipeline Stages

Code checkout

Dependency installation

Linting & formatting checks

Backend build validation

Frontend build validation

Test execution (later phases)

CI/CD configuration will live inside .github/workflows/

📂 Repository Structure (Initial)
sentinel-law/
│
├── frontend/        # React frontend
├── backend/         # Node.js backend
├── ai/              # NLP & AI models
├── docs/            # Architecture & design docs
├── .github/
│   └── workflows/   # CI/CD pipelines
├── README.md
└── .gitignore



📈 Success Metrics (Target)

Document analysis ≤ 30 seconds

≥ 90% explainability coverage

Zero data modification

WCAG 2.1 AA compliance for core flows

📜 License

This project is developed as an academic project under GLA University guidelines.
Licensing details will be added in later stages.

📝 Notes

This README represents the starting point of the project.
Features, architecture, and workflows will evolve as development progresses.

------------------------------------------------------------------------------------------------------------
High-Level System Flow

The core workflow of Sentinel-Law follows a structured pipeline.

User Uploads Document
        │
        ▼
Document Storage (Read-Only)
        │
        ▼
AI Processing Pipeline
   • Clause Extraction
   • Risk Detection
   • Policy Mapping
        │
        ▼
Compliance Findings Generated
        │
        ▼
Dashboard & Findings Viewer
        │
        ▼
Audit Report Generation

----------------------------------------------------------------------------------------------------------
Final Application Navigation Structure
Landing Page
│
├── Login
├── Sign Up
│
└── Dashboard
     │
     ├── Documents
     │     └── Document Analysis
     │
     ├── Findings
     │
     ├── Reports
     │
     ├── Compliance Library
     │
     └── Settings
-------------------------------------------------------------------------------------------------------------------
<img width="1536" height="1024" alt="ChatGPT Image Mar 5, 2026, 07_20_26 PM" src="https://github.com/user-attachments/assets/af9783ce-0718-4616-929e-a22b9c7cbeab" />


