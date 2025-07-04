# HireMau Simplified Database Schema

## Problem with Original Approach
The original comprehensive schema was **too complex** and didn't align with:
- Frontend form capabilities
- HR workflow reality
- Development timeline constraints

## Simplified Solution

### What We Kept (Essential Fields Only)

**Events Table:**
- Basic info: id, title, name, description, date, location, status
- Simple additions: event_type, is_virtual, max_participants

**Jobs Table:**
- Basic info: id, title, department, location, description, status
- Salary: salary_min, salary_max, currency (MYR default)
- Simple categorization: employment_type, experience_level, requirements[]

**Candidates Table:**
- Basic info: id, name, email, phone, status, stage
- Work info: current_position, years_experience, availability
- Preferences: salary_expectations, preferred_work_type, source

**New Tables:**
- `event_jobs` - Links jobs to events (many-to-many)
- `job_applications` - Tracks candidate applications to jobs

### What We Removed (Over-engineered)
- 20+ additional fields that frontend doesn't collect
- Complex Malaysian-specific enums
- Detailed tracking fields HR doesn't need
- Over-complicated workflows

## Frontend-Database Alignment

### Candidate Form → Database
```typescript
// Frontend collects:
name, email, phone, event_id, job_id, resumeFile

// Maps to database:
candidates(name, email, phone, event_id, job_id, ...)
job_applications(candidate_id, job_id, event_id, status)
```

### Job Form → Database
```typescript
// Frontend collects:
title, department, location, description, requirements[], 
salary{min, max, currency}, employmentType, experienceLevel

// Maps to database:
jobs(title, department, location, description, requirements, 
     salary_min, salary_max, currency, employment_type, experience_level)
```

## Status/Stage Workflow (Simplified)

**Events:** draft → active → completed → cancelled
**Jobs:** draft → active → closed
**Candidates:** active → withdrawn → hired
**Application Stage:** applied → screening → interviewed → shortlisted → rejected

## Installation Instructions

1. **Run the simplified schema:**
   ```sql
   -- In Supabase SQL Editor, run:
   -- new_backend/SIMPLIFIED_SCHEMA.sql
   ```

2. **This script will:**
   - Fix constraint violations by updating existing data
   - Drop unused tables (candidate_table, test)
   - Add only essential fields
   - Create proper relationships
   - Apply Malaysian defaults (MYR currency)

3. **Verify installation:**
   ```powershell
   python check_tables.py
   ```

## Next Steps

1. ✅ **Database**: Apply simplified schema
2. **Backend**: Update models to match simplified schema
3. **Frontend**: Update services to use new structure
4. **Agent**: Fix integration with new database
5. **Testing**: Verify end-to-end workflow

## Benefits of Simplified Approach

- **Faster development** - Only build what's needed
- **Easier maintenance** - Less complex relationships
- **Better alignment** - Database matches frontend capabilities
- **Practical workflow** - Matches actual HR processes
- **Expandable** - Can add complexity later as needed

## Malaysian Context (Kept Simple)
- Default currency: MYR
- Default location: Malaysia
- Common employment types and experience levels
- Salary ranges in Malaysian format

This approach gets you a **working system in 3 hours** rather than a perfect system in 3 weeks! 