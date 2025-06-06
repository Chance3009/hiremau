# 🚀 Overview of HireMau

**HireMau** is an intelligent web-based screening tool designed to help recruiters and HR managers conduct faster, more effective candidate evaluations. By leveraging advanced AI technologies, including **Large Language Models (LLMs)**, **Agentic AI**, and **Retrieval-Augmented Generation (RAG)**, HireMau automates and enhances early-stage screening tasks such as skill-gap analysis, background checks, and live interview support. The platform reduces manual workload, improves consistency, and enables high-volume screening with minimal effort.

## Showcases
| Key Features  | Demonstration |
| :---:  | :---: |
| Homepage | <img src="https://github.com/user-attachments/assets/06a0db44-fb09-4de7-a748-7de8d93e915e" height="300"> |
| Multi-Source Data Collection and AI-Powered Urban Monitoring | <img src="https://github.com/user-attachments/assets/71898064-93d9-4f12-ab54-ed41d2733455" height="300"> <img src="https://github.com/user-attachments/assets/66d0b8ee-8a53-4cc6-9d34-cb32b6304539" height="300"> <img src="https://github.com/user-attachments/assets/4877a147-b68c-473e-9757-c84bf767a8c1" height="300"> |
| Real-Time Alerts | <img src="https://github.com/user-attachments/assets/b07ed53d-f0f0-42ff-a7ba-40667fc6dd11" height="300"> <img src="https://github.com/user-attachments/assets/f2f9e95f-b253-4252-b0e8-7e0dfaad42fa" height="300"> |
| AI-Driven Risk Assessment and Crowdsourcing Prioritization | <img src="https://github.com/user-attachments/assets/4877a147-b68c-473e-9757-c84bf767a8c1" height="300"> <img src="https://github.com/user-attachments/assets/0807e95f-1443-4292-a662-ad5d6703f541" height="300"> |
| Issue Tracking and Community Engagement | <img src="https://github.com/user-attachments/assets/0807e95f-1443-4292-a662-ad5d6703f541" height="300"> <img src="https://github.com/user-attachments/assets/caa39ca5-6eb9-48f9-a844-d5df0ff70efa" height="300"> <img src="https://github.com/user-attachments/assets/d9697aa0-bb7e-47ff-b0d5-5734a588de10" height="300"> |
| Dashboard | <img src="https://github.com/user-attachments/assets/2e7f1ff6-37d1-442a-ba00-97b1792b8014" height="300"> <img src="https://github.com/user-attachments/assets/83b06522-cba1-40f1-9864-6fe8fa747380" height="300"> |

## Key Features

### 🤖 Streamlined Screening with Agentic AI and RAG
HireMau uses a multi-agent AI system coordinated by a central controller to deliver efficient, standardized candidate screening while reducing errors and improving data quality.

- #### 🧩 Core Screening Agents:
  - **Document Analysis Agent:** Extracts structured data from resumes and cover letters.
  - **Sourcing Agent:** Gathers additional background info through web crawling.
  - **Candidate Evaluation Agent:** Generates standardized candidate scores using predefined rubrics.

- #### 💬 Interview & Support Agents:
  - **Interview Analysis Agent:** Analyzes interviews for key insights and behavioral cues.
  - **Interview Assistant Agent:** Offers live, dynamic question prompts during screenings.
  - **HR Agent:** Manages ranking, communications, and event summaries.

- #### 🗃️ Data Management Agent:
  - **Database Managing Agent:** Manages candidate data using RAG technology for contextual information retrieval and consistent profile maintenance.
  - Supports parallel processing and specialized tasks through centralized coordination for high-performance screening.

- #### 🧠 RAG-Powered Context Management
  - Stores company information and uploaded job descriptions (PDF) to enable role-specific AI-generated interview questions.
  - Automatically saves candidate profiles after screenings.
  - Triggers smart re-engagement with previously screened candidates when new, relevant positions open, including automated personalized outreach.

### 🎙️ Real-Time Interview Assistance
HireMau leverages large language models to assist recruiters during live, on-site interviews. The system listens in real-time, generates context-aware follow-up questions, and updates a visual fit indicator to reflect candidate alignment. Recruiters can add quick notes, and the AI adapts the interview flow accordingly. The Interview Assistant Agent ensures high-quality, relevant questions by integrating context from other agents, enabling thorough and efficient evaluations.

### 📅 Event-Based Screening Management
HireMau groups job applications by recruitment events like career fairs or campus drives, enabling efficient high-volume candidate evaluation. It offers features such as candidate registration, resume submission, interview scheduling, and detailed event summaries to help organizations assess event success and plan future efforts. The system tracks environmental and interaction details, candidate performance, and recruiter effectiveness across events.

Collaborative tools allow multiple recruiters to evaluate candidates simultaneously with synchronized data, supporting real-time remote consultation and consistent workflows across locations. After events, automated candidate ranking, bulk communication, and detailed analytics provide insights on ROI, candidate quality, and process efficiency.

****All collected and processed data can be seamlessly exported to the company’s existing HR system via API integration, ensuring easy access, continuity, and centralised candidate tracking.****

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
