# API Endpoints Reference

## Base Configuration
- **Base URL**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## Core Endpoints

### Candidates API
- `GET /candidates/` - List all candidates
  - Query Parameters:
    - `stage` (optional): Filter by recruitment stage
    - `status` (optional): Filter by candidate status
    - `source` (optional): Filter by source
    - `search` (optional): Search by name or email
    - `limit` (optional): Number of records to return (default: 10)
    - `offset` (optional): Number of records to skip (default: 0)
  - Response: List of candidates with basic information

- `GET /candidates/{id}/` - Get candidate details
  - Response: Detailed candidate information including files and stage history

- `POST /candidates/` - Create new candidate
  - Body: FormData with candidate information and files
    - `candidate_data` (string): JSON string with candidate details
    - `resume_file` (file, optional): Resume file upload
    - `supporting_docs` (files, optional): Additional document uploads
  - Response: Created candidate object with ID

- `PUT /candidates/{id}/` - Update candidate
  - Body: JSON with updated candidate fields
  - Response: Updated candidate object

- `DELETE /candidates/{id}/` - Delete candidate
  - Response: Success confirmation

- `GET /candidates/stage/{stage}/` - Get candidates by stage
  - Response: List of candidates in specified stage

- `POST /candidates/{id}/action/{action}/` - Perform workflow action
  - Body: Optional metadata for the action
  - Response: Updated candidate with new stage

### Events API
- `GET /events/` - List all events
  - Query Parameters:
    - `status` (optional): Filter by event status
    - `event_type` (optional): Filter by event type
  - Response: List of events

- `GET /events/{id}/` - Get event details
  - Response: Detailed event information

- `POST /events/` - Create new event
  - Body: Event data
  - Response: Created event object

- `PUT /events/{id}/` - Update event
  - Body: Updated event data
  - Response: Updated event object

### Jobs API
- `GET /jobs/` - List all jobs
  - Query Parameters:
    - `status` (optional): Filter by job status
    - `department` (optional): Filter by department
  - Response: List of job openings

- `GET /jobs/{id}/` - Get job details
  - Response: Detailed job information

- `POST /jobs/` - Create new job
  - Body: Job data
  - Response: Created job object

- `PUT /jobs/{id}/` - Update job
  - Body: Updated job data
  - Response: Updated job object

### File Storage API
- `POST /upload/resume/` - Upload resume file
  - Body: FormData with file
  - Response: File URL and metadata

- `POST /upload/supporting-docs/` - Upload supporting documents
  - Body: FormData with multiple files
  - Response: Array of file URLs and metadata

- `GET /files/candidate/{candidate_id}/` - Get candidate files
  - Response: List of files associated with candidate

### Event Registrations API
- `GET /event-registrations/` - List event registrations
  - Query Parameters:
    - `event_id` (optional): Filter by event
    - `candidate_id` (optional): Filter by candidate
  - Response: List of registrations

- `POST /event-registrations/` - Create event registration
  - Body: Event and candidate IDs
  - Response: Created registration object

### Workflow API
- `GET /workflow/summary/` - Get workflow summary
  - Response: Overview of candidates in each stage

- `GET /workflow/stages/` - Get all stages
  - Response: List of available workflow stages

- `GET /workflow/actions/{stage}/` - Get available actions for stage
  - Response: List of possible actions from current stage

### AI API
- `POST /ai/analyze-candidate/` - Analyze candidate profile
  - Body: Candidate ID and resume text
  - Response: AI analysis results

- `POST /ai/extract-resume/` - Extract text from resume file
  - Body: FormData with resume file
  - Response: Extracted text and metadata

## Authentication
Currently using Supabase authentication. All endpoints require valid authentication headers:
- `Authorization: Bearer <supabase_jwt_token>`

## Error Responses
All endpoints return standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "detail": "Error message",
  "status_code": 400
}
```

## File Upload Guidelines
- **Resume files**: PDF, DOC, DOCX (max 5MB)
- **Supporting documents**: PDF, DOC, DOCX, JPG, PNG (max 5MB each)
- **Storage**: Files stored in Supabase Storage buckets
  - `resumes/` - Resume files
  - `candidate-files/` - Supporting documents 