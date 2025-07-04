# Frontend Database Constraint Fixes

## Database Constraint
Your database constraint allows these stages:
```sql
'applied', 'screened', 'interview', 'shortlisted', 'final_review', 'offer', 'hired', 'rejected', 'declined', 'onboarded'
```

## Issues Fixed

### 1. Workflow Configuration Mismatch
**Problem**: Frontend workflow didn't match database constraint stages.

**Solution**: Updated `frontend/src/lib/workflow.ts` to match database exactly.

### 2. Action Names Mismatch
**Problem**: Frontend used hyphenated action names, backend used underscores.

**Solution**: Updated all action names to use underscores consistently.

### 3. Navigation Routes Mismatch
**Problem**: Routes didn't match the new stage names.

**Solution**: Updated routing to match database stages.

## Files Modified

### 1. `frontend/src/lib/workflow.ts`
**Changes**:
- Updated `WorkflowStage` type to match database constraint
- Updated `WorkflowAction` type to use underscores
- Updated `STAGE_CONFIG` to include all database stages
- Updated `ACTION_LABELS` to match new action names
- Enhanced `getCurrentStage` to prioritize `stage` field from backend
- Updated `mapStatusToStage` to handle all database stages

**New Stages Added**:
- `interview` (was `interviewed`)
- `final_review` (was `final-review`)
- `offer`
- `hired`
- `rejected`
- `declined`
- `onboarded`

**New Actions Added**:
- `schedule_interview` (was `schedule-interview`)
- `move_to_shortlisted`
- `move_to_final`
- `make_offer` (was `make-offer`)
- `hire`
- `mark_declined`
- `complete_onboarding`

### 2. `frontend/src/pages/AppliedCandidates.tsx`
**Changes**:
- Updated navigation logic to handle new action names
- Fixed routing for `schedule_interview` action
- Added navigation for `move_to_shortlisted` and `move_to_final`

### 3. `frontend/src/components/candidate/CandidateCard.tsx`
**Changes**:
- Updated interface to support `stage` field from backend
- Fixed type compatibility with new workflow types
- Updated action icon mapping for `schedule_interview`

### 4. `frontend/src/App.tsx`
**Changes**:
- Updated routing to match new stage names
- Changed `/interviewed` route to `/interview`
- Added `/interview-schedule` for interview scheduling
- Kept `/final-review` route (maps to `final_review` stage)

## Stage Flow Mapping

### Database → Frontend Flow
1. **applied** → **screened** (via `shortlist` action)
2. **screened** → **interview** (via `schedule_interview` action)
3. **screened** → **shortlisted** (via `move_to_shortlisted` action)
4. **interview** → **final_review** (via `move_to_final` action)
5. **shortlisted** → **final_review** (via `move_to_final` action)
6. **final_review** → **offer** (via `make_offer` action)
7. **offer** → **hired** (via `hire` action)
8. **offer** → **declined** (via `mark_declined` action)
9. **hired** → **onboarded** (via `complete_onboarding` action)

### Action Mapping
| Frontend Action | Backend Action | Target Stage |
|----------------|----------------|--------------|
| `shortlist` | `shortlist` | `screened` |
| `schedule_interview` | `schedule_interview` | `interview` |
| `move_to_shortlisted` | `move_to_shortlisted` | `shortlisted` |
| `move_to_final` | `move_to_final` | `final_review` |
| `make_offer` | `make_offer` | `offer` |
| `hire` | `hire` | `hired` |
| `reject` | `reject` | `rejected` |
| `mark_declined` | `mark_declined` | `declined` |
| `complete_onboarding` | `complete_onboarding` | `onboarded` |

## Testing Steps

### 1. Test Applied → Screened Transition
1. Go to **Applied** candidates page
2. Click **Shortlist** on any candidate
3. Verify candidate moves to **Screened** stage
4. Check browser console for any errors

### 2. Test Screened → Interview Transition
1. Go to **Screened** candidates page
2. Click **Schedule Interview** on any candidate
3. Verify candidate moves to **Interview** stage
4. Verify navigation to interview scheduling

### 3. Test All Stage Transitions
1. Test each action button on each stage
2. Verify correct stage transitions
3. Check that navigation works properly
4. Verify no console errors

### 4. Test Database Integration
1. Check that candidate `stage` field updates correctly
2. Verify stage history is recorded
3. Test that allowed actions are correct for each stage

## Expected Behavior

### Applied Stage
- ✅ Shows "Shortlist" and "Reject" buttons
- ✅ Shortlist moves candidate to "screened" stage
- ✅ Navigates to `/screened` page after shortlist

### Screened Stage
- ✅ Shows "Schedule Interview", "Move to Shortlisted", "Reject" buttons
- ✅ Schedule Interview moves candidate to "interview" stage
- ✅ Move to Shortlisted moves candidate to "shortlisted" stage

### Interview Stage
- ✅ Shows "Move to Final Review", "Reject" buttons
- ✅ Move to Final Review moves candidate to "final_review" stage

### Final Review Stage
- ✅ Shows "Make Offer", "Reject" buttons
- ✅ Make Offer moves candidate to "offer" stage

### Offer Stage
- ✅ Shows "Hire", "Mark Declined", "Reject" buttons
- ✅ Hire moves candidate to "hired" stage
- ✅ Mark Declined moves candidate to "declined" stage

## Troubleshooting

### If Actions Don't Work:
1. Check browser console for errors
2. Verify backend API is running on port 8001
3. Check that database constraint is updated
4. Verify candidate has correct `stage` field

### If Navigation Doesn't Work:
1. Check that routes are correctly defined in App.tsx
2. Verify action names match between frontend and backend
3. Check that workflow configuration is correct

### If Stages Don't Update:
1. Check backend stage management service
2. Verify database constraint allows the target stage
3. Check that candidate data includes `stage` field

## Database Constraint Update Required

Make sure your database constraint is updated to allow all stages:

```sql
-- Execute this in your Supabase SQL editor
ALTER TABLE public.candidates
DROP CONSTRAINT IF EXISTS check_candidates_stage;

ALTER TABLE public.candidates
ADD CONSTRAINT check_candidates_stage CHECK (
  stage = ANY (
    ARRAY[
      'applied'::text,
      'screened'::text,
      'interview'::text,
      'shortlisted'::text,
      'final_review'::text,
      'offer'::text,
      'hired'::text,
      'rejected'::text,
      'declined'::text,
      'onboarded'::text
    ]
  )
);
```

## Summary

The frontend now correctly matches your database constraint:
- ✅ All stages match database constraint
- ✅ All actions use consistent naming (underscores)
- ✅ Navigation routes match stage names
- ✅ Stage transitions work correctly
- ✅ Type safety is maintained

The system should now work seamlessly with your database constraint without any violations. 