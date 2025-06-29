# 🚀 HireMau Recruitment Workflow

## 📋 Overview

This document defines the complete recruitment workflow with clear states, actions, and business logic.

## 🔄 Recruitment States

### 1. **Applied** 
- **Description**: Candidate has submitted their application
- **Entry Point**: New candidate registration
- **Available Actions**:
  - `shortlist` → Move to Screening
  - `reject` → Move to Rejected
  - `put-on-hold` → Move to On Hold
  - `view-profile` → Stay in Applied
  - `analyze-resume` → Stay in Applied

### 2. **Screening**
- **Description**: Resume review, phone screening, initial assessment
- **Entry From**: Applied (via shortlist)
- **Available Actions**:
  - `schedule-interview` → Move to Interview Scheduled
  - `reject-after-screening` → Move to Rejected
  - `put-on-hold` → Move to On Hold
  - `update-screening-notes` → Stay in Screening

### 3. **Interview Scheduled**
- **Description**: Interview is scheduled but not yet started
- **Entry From**: Screening (via schedule-interview), Additional Interview (via schedule-next-interview)
- **Available Actions**:
  - `start-interview` → Move to Interviewing
  - `reschedule` → Stay in Interview Scheduled
  - `cancel-and-reject` → Move to Rejected
  - `remind-candidate` → Stay in Interview Scheduled

### 4. **Interviewing**
- **Description**: Interview is currently in progress
- **Entry From**: Interview Scheduled (via start-interview)
- **Available Actions**:
  - `complete-interview` → Move to Interview Completed
  - `pause-interview` → Stay in Interviewing
  - `cancel-interview` → Move to Interview Scheduled

### 5. **Interview Completed**
- **Description**: Interview finished, awaiting evaluation and next steps
- **Entry From**: Interviewing (via complete-interview)
- **Available Actions**:
  - `move-to-final-review` → Move to Final Review
  - `request-another-interview` → Move to Additional Interview
  - `reject-after-interview` → Move to Rejected
  - `update-interview-notes` → Stay in Interview Completed

### 6. **Additional Interview**
- **Description**: Multiple interviews required (technical, behavioral, panel, etc.)
- **Entry From**: Interview Completed (via request-another-interview)
- **Available Actions**:
  - `schedule-next-interview` → Move to Interview Scheduled
  - `reject` → Move to Rejected
  - `skip-additional` → Move to Final Review

### 7. **Final Review**
- **Description**: Decision-making stage, comparing candidates
- **Entry From**: Interview Completed (via move-to-final-review), Additional Interview (via skip-additional)
- **Available Actions**:
  - `extend-offer` → Move to Offer Extended
  - `final-reject` → Move to Rejected
  - `put-on-hold-for-review` → Move to On Hold
  - `compare-candidates` → Stay in Final Review

### 8. **Offer Extended**
- **Description**: Job offer has been made to candidate
- **Entry From**: Final Review (via extend-offer), Negotiating (via update-offer)
- **Available Actions**:
  - `offer-accepted` → Move to Hired
  - `offer-declined` → Move to Rejected
  - `negotiate-offer` → Move to Negotiating
  - `withdraw-offer` → Move to Rejected

### 9. **Negotiating**
- **Description**: Salary/terms negotiation in progress
- **Entry From**: Offer Extended (via negotiate-offer)
- **Available Actions**:
  - `update-offer` → Move to Offer Extended
  - `negotiation-failed` → Move to Rejected
  - `accept-counter-offer` → Move to Hired

### 10. **On Hold**
- **Description**: Process paused for various reasons
- **Entry From**: Applied, Screening, Final Review (via put-on-hold actions)
- **Available Actions**:
  - `reactivate` → Return to previous state
  - `reject-from-hold` → Move to Rejected
  - `update-hold-reason` → Stay in On Hold

### 11. **Hired** ✅
- **Description**: Candidate accepted offer and joined company
- **Entry From**: Offer Extended, Negotiating (via acceptance actions)
- **Terminal State**: Process complete

### 12. **Rejected** ❌
- **Description**: Candidate rejected at any stage
- **Entry From**: Any state (via reject actions)
- **Terminal State**: Process complete

## 🎯 Action Categories

### **Progression Actions**
Move candidate forward in the pipeline:
- `shortlist`, `schedule-interview`, `start-interview`, `complete-interview`
- `move-to-final-review`, `extend-offer`, `offer-accepted`

### **Rejection Actions** 
End the recruitment process:
- `reject`, `reject-after-screening`, `reject-after-interview`
- `final-reject`, `offer-declined`, `negotiation-failed`

### **Lateral Actions**
Stay in current state with updates:
- `view-profile`, `analyze-resume`, `update-screening-notes`
- `remind-candidate`, `compare-candidates`

### **Hold Actions**
Pause the process:
- `put-on-hold`, `put-on-hold-for-review`, `reactivate`

### **Interview Management**
Handle interview logistics:
- `reschedule`, `cancel-interview`, `request-another-interview`

## 🚦 Business Rules

### **Auto-Transitions**
- New applications automatically start in "Applied" state
- Interview completion requires evaluation before next action
- Offers have expiration dates (auto-expire to rejected)

### **Permissions**
- **Recruiters**: Can perform most actions except final decisions
- **Hiring Managers**: Can make final review decisions and extend offers  
- **Interviewers**: Can start/complete interviews and add notes
- **System**: Can auto-transition based on time/events

### **Notifications**
- Candidate gets notified on: Interview scheduled, offer extended, rejection
- Team gets notified on: New applications, completed interviews, offers accepted
- Escalations: Overdue interviews, pending reviews, expiring offers

## 📊 Analytics & Metrics

### **Pipeline Metrics**
- Conversion rates between stages
- Time spent in each stage
- Bottleneck identification

### **Performance Metrics**
- Interview-to-offer ratio
- Offer acceptance rate
- Time-to-hire average

### **Quality Metrics**
- Source effectiveness
- Interviewer feedback scores
- Hiring manager satisfaction

## 🔧 Implementation Notes

### **State Storage**
```json
{
  "currentStage": "screening",
  "status": "active", // active, on-hold, rejected, hired
  "stageHistory": [
    {
      "fromStage": "applied", 
      "toStage": "screening",
      "action": "shortlist",
      "performedBy": "recruiter_001",
      "timestamp": "2024-01-15T10:30:00Z",
      "notes": "Strong technical background"
    }
  ]
}
```

### **Available Actions API**
```javascript
GET /candidates/{id}/actions
// Returns: ["schedule-interview", "reject-after-screening", "put-on-hold"]
```

### **Perform Action API**
```javascript
POST /candidates/{id}/actions/schedule-interview
{
  "performedBy": "recruiter_001",
  "notes": "Technical interview scheduled",
  "metadata": {
    "interviewDate": "2024-01-20",
    "interviewType": "technical"
  }
}
```

## 🎯 UI Components

### **Stage Pipeline View**
Visual pipeline showing candidates in each stage with counts

### **Candidate Cards**
Show current stage, available actions, and quick stats

### **Action Buttons**
Context-aware buttons based on current stage and permissions

### **Workflow History**
Timeline view of all stage transitions and actions

---

*This workflow ensures clear progression, prevents invalid state transitions, and provides comprehensive tracking of the recruitment process.* 