-- Create candidate_files table
CREATE TABLE IF NOT EXISTS public.candidate_files (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    candidate_id UUID NULL,
    file_type TEXT NULL,
    file_url TEXT NULL,
    extracted_text TEXT NULL,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT now(),
    file_name TEXT NULL,
    file_size INTEGER NULL,
    file_category TEXT NULL,
    CONSTRAINT candidate_files_pkey PRIMARY KEY (id),
    CONSTRAINT candidate_files_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create index for candidate_id
CREATE INDEX IF NOT EXISTS idx_candidate_files_candidate_id ON public.candidate_files USING btree (candidate_id) TABLESPACE pg_default;

-- Create index for file_type
CREATE INDEX IF NOT EXISTS idx_candidate_files_file_type ON public.candidate_files USING btree (file_type) TABLESPACE pg_default;

-- Create index for file_category
CREATE INDEX IF NOT EXISTS idx_candidate_files_file_category ON public.candidate_files USING btree (file_category) TABLESPACE pg_default; 