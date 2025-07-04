-- Execute this in Supabase SQL Editor to create candidate_table

-- First, enable the vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create candidate_table for storing candidate document embeddings
CREATE TABLE IF NOT EXISTS candidate_table (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(1536),
    document_id TEXT,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_table_embedding ON candidate_table USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_candidate_table_document_id ON candidate_table(document_id);
CREATE INDEX IF NOT EXISTS idx_candidate_table_name ON candidate_table(name);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_candidate_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id bigint,
    content text,
    metadata jsonb,
    document_id text,
    name text,
    similarity float
)
LANGUAGE sql STABLE
AS $$
SELECT 
    id,
    content,
    metadata,
    document_id,
    name,
    1 - (embedding <=> query_embedding) as similarity
FROM candidate_table
WHERE 1 - (embedding <=> query_embedding) > match_threshold
ORDER BY embedding <=> query_embedding
LIMIT match_count;
$$;

-- Create fallback function for match_documents
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id bigint,
    content text,
    metadata jsonb,
    document_id text,
    name text,
    similarity float
)
LANGUAGE sql STABLE
AS $$
SELECT 
    id,
    content,
    metadata,
    document_id,
    name,
    1 - (embedding <=> query_embedding) as similarity
FROM candidate_table
WHERE 1 - (embedding <=> query_embedding) > match_threshold
ORDER BY embedding <=> query_embedding
LIMIT match_count;
$$;

-- Enable RLS
ALTER TABLE candidate_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access for authenticated users" ON candidate_table
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for service role" ON candidate_table
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON candidate_table TO authenticated;
GRANT ALL ON candidate_table TO service_role;
GRANT USAGE ON SEQUENCE candidate_table_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE candidate_table_id_seq TO service_role; 