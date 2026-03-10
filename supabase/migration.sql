-- ============================================
-- 123 ENGLISH Teacher Application Portal
-- Supabase Database Migration
-- ============================================

-- 1. Teachers table (linked to auth.users)
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL,
    nationality TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
    email_verified BOOLEAN DEFAULT FALSE,
    language_test_url TEXT,
    demo_teaching_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view own data"
    ON teachers FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
    ON teachers FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
    ON teachers FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 4. Storage bucket for video recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policies
CREATE POLICY "Users can upload own recordings"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'recordings'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own recordings"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'recordings'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
