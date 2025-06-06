# Overview of HireMau

**HireMau** is an intelligent web-based screening tool designed to help recruiters and HR managers conduct faster, more effective candidate evaluations. By leveraging advanced AI technologies—including **Large Language Models (LLMs)**, **Agentic AI**, and **Retrieval-Augmented Generation (RAG)**, HireMau automates and enhances early-stage screening tasks such as skill-gap analysis, background checks, and live interview support. The platform reduces manual workload, improves consistency, and enables high-volume screening with minimal effort.

## Key Features

### Streamlined Screening with Agentic AI and RAG
HireMau uses a multi-agent AI system coordinated by a central controller to deliver efficient, standardized candidate screening while reducing errors and improving data quality.

#### Core Screening Agents:

**Document Analysis Agent:** Extracts structured data from resumes and cover letters.
Sourcing Agent: Gathers additional background info through web crawling.
Candidate Evaluation Agent: Generates standardized candidate scores using predefined rubrics.

#### Interview & Support Agents:

Interview Analysis Agent: Analyzes interviews for key insights and behavioral cues.

Interview Assistant Agent: Offers live, dynamic question prompts during screenings.

HR Agent: Manages ranking, communications, and event summaries.

Data Management Agent:

Uses RAG (Retrieval-Augmented Generation) to manage contextual data and maintain candidate profiles.

Supports job description uploads (PDF), AI-aligned question generation, and auto-saves profiles.

Enables intelligent re-engagement with past candidates via automated, personalized outreach.

This architecture supports parallel processing, task specialization, and centralized coordination for high-performance, consistent hiring.
---

## Getting Started

### 1. Clone the repository
```bash
git clone git@github.com:Chance3009/hire-flow.git
cd hire-flow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```
