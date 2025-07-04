-- Migration: Clean up unused tables and optimize schema
-- This migration removes tables that are not being used effectively

-- Drop unused tables
-- Analysis results:
-- - candidate_table: Empty (0 records) - can be dropped
-- - company_table: Has 33 records with embeddings - MUST KEEP
-- - test: Empty (0 records) - can be dropped

DROP TABLE IF EXISTS candidate_table CASCADE;
DROP TABLE IF EXISTS test CASCADE;
-- Keep company_table as it has active embeddings data
-- DROP TABLE IF EXISTS company_table CASCADE;

-- Clean up any orphaned records or inconsistencies
-- Remove any candidates without proper foreign key relationships
DELETE FROM candidate_files WHERE candidate_id NOT IN (SELECT id FROM candidates);
DELETE FROM candidate_stage_history WHERE candidate_id NOT IN (SELECT id FROM candidates);
DELETE FROM candidate_ai_analysis WHERE candidate_id NOT IN (SELECT id FROM candidates);

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_files_candidate_id ON candidate_files(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_files_file_type ON candidate_files(file_type);
CREATE INDEX IF NOT EXISTS idx_candidate_stage_history_candidate_id ON candidate_stage_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_stage_history_timestamp ON candidate_stage_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_candidate_ai_analysis_candidate_id ON candidate_ai_analysis(candidate_id);

-- Update existing tables to ensure consistency
-- Fix any missing default values or constraints
UPDATE candidates SET status = 'active' WHERE status IS NULL;
UPDATE candidates SET stage = 'applied' WHERE stage IS NULL;
UPDATE candidates SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE candidates SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Clean up events table
UPDATE events SET status = 'active' WHERE status IS NULL;
UPDATE events SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE events SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Clean up jobs table
UPDATE jobs SET status = 'active' WHERE status IS NULL;
UPDATE jobs SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE jobs SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Ensure all existing foreign key relationships are valid
-- Remove any orphaned records
DELETE FROM event_registrations WHERE candidate_id NOT IN (SELECT id FROM candidates);
DELETE FROM event_registrations WHERE event_id NOT IN (SELECT id FROM events);
DELETE FROM event_interviews WHERE candidate_id NOT IN (SELECT id FROM candidates);
DELETE FROM event_interviews WHERE event_id NOT IN (SELECT id FROM events);
DELETE FROM event_interviews WHERE job_id NOT IN (SELECT id FROM jobs);

-- Add comments to important tables for documentation
COMMENT ON TABLE candidates IS 'Main candidates table storing all candidate information';
COMMENT ON TABLE events IS 'Events table for managing recruitment events';
COMMENT ON TABLE jobs IS 'Jobs table for managing job openings';
COMMENT ON TABLE candidate_files IS 'Files uploaded by candidates (resumes, certificates, etc.)';
COMMENT ON TABLE candidate_stage_history IS 'Audit trail of candidate stage transitions';
COMMENT ON TABLE candidate_ai_analysis IS 'AI analysis results for candidates';

-- Log the cleanup
INSERT INTO migration_log (migration_name, executed_at, description) VALUES 
('004_cleanup_unused_tables', CURRENT_TIMESTAMP, 'Cleaned up unused tables and optimized schema')
ON CONFLICT DO NOTHING; 