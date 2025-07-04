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
CREATE INDEX IF NOT EXISTS idx_candidate_table_created_at ON candidate_table(created_at);

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

-- Create function for regular match_documents (fallback)
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

-- Enable RLS (Row Level Security)
ALTER TABLE candidate_table ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON candidate_table
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON candidate_table
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON candidate_table
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON candidate_table
    FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON candidate_table TO authenticated;
GRANT ALL ON candidate_table TO service_role;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_candidate_table_updated_at'
    ) THEN
        CREATE TRIGGER update_candidate_table_updated_at 
            BEFORE UPDATE ON candidate_table 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$; 