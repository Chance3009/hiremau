-- SUPABASE STORAGE 
company
candidate-files
resumes
certificates
transcripts


-- DATABASE MODEL AT SUPABASE

CREATE TABLE public.candidate_ai_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid,
  analysis_json jsonb,
  model_version text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT candidate_ai_analysis_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_ai_analysis_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.candidate_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid,
  file_type text,
  file_url text,
  extracted_text text,
  uploaded_at timestamp without time zone DEFAULT now(),
  file_name text,
  file_size integer,
  file_category text,
  CONSTRAINT candidate_files_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_files_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.candidate_stage_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid,
  action text,
  from_stage text,
  to_stage text,
  notes text,
  performed_by text,
  timestamp timestamp without time zone DEFAULT now(),
  status text,
  CONSTRAINT candidate_stage_history_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_stage_history_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  status text,
  stage text,
  education text,
  experience text,
  ai_profile_json jsonb,
  ai_profile_summary text,
  profile_embedding USER-DEFINED,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  linkedin_url text,
  github_url text,
  portfolio_url text,
  current_position text,
  years_experience integer,
  certifications ARRAY,
  languages ARRAY,
  availability text,
  salary_expectations numeric,
  preferred_work_type text,
  source text,
  notes text,
  skills ARRAY,
  CONSTRAINT candidates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.company_profile (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  industry text,
  profile_text text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT company_profile_pkey PRIMARY KEY (id)
);
CREATE TABLE public.company_table (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  vector USER-DEFINED,
  text text,
  CONSTRAINT company_table_pkey PRIMARY KEY (id)
);
CREATE TABLE public.event_interviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  candidate_id uuid,
  job_id uuid,
  interviewer text,
  scheduled_at timestamp without time zone,
  status text,
  duration_minutes integer DEFAULT 30,
  notes text,
  CONSTRAINT event_interviews_pkey PRIMARY KEY (id),
  CONSTRAINT event_interviews_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_interviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT event_interviews_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.event_positions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  job_id uuid,
  positions_available integer DEFAULT 1,
  positions_filled integer DEFAULT 0,
  CONSTRAINT event_positions_pkey PRIMARY KEY (id),
  CONSTRAINT event_positions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_positions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.event_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  candidate_id uuid,
  registered_at timestamp without time zone DEFAULT now(),
  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id),
  CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time text,
  location text,
  status text,
  positions integer,
  registrations integer,
  interviews integer,
  analytics_json jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  name text,
  description text,
  event_type text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  max_participants integer,
  current_participants integer DEFAULT 0,
  CONSTRAINT events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.interviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid,
  job_id uuid,
  event_id uuid,
  interviewer text,
  date date,
  time text,
  duration integer,
  type text,
  status text,
  room text,
  notes text,
  transcript_file_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  interview_type text,
  scheduled_date timestamp with time zone,
  duration_minutes integer,
  ai_analysis jsonb,
  CONSTRAINT interviews_pkey PRIMARY KEY (id),
  CONSTRAINT interviews_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT interviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT interviews_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id),
  CONSTRAINT interviews_transcript_file_id_fkey FOREIGN KEY (transcript_file_id) REFERENCES public.candidate_files(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text,
  location text,
  type text,
  experience text,
  salary text,
  status text,
  applicants integer,
  shortlisted integer,
  interviewed integer,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  company text DEFAULT 'Your Company'::text,
  job_type text,
  salary_range text,
  responsibilities ARRAY,
  benefits ARRAY,
  requirements ARRAY,
  CONSTRAINT jobs_pkey PRIMARY KEY (id)
);