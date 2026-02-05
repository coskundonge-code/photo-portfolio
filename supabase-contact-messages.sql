-- =====================================================
-- CONTACT MESSAGES TABLOSU - SUPABASE ŞEMA
-- =====================================================
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- =====================================================

-- Contact Messages tablosu
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    subject_label VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public can insert messages (for contact form)
CREATE POLICY "Public can insert contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Only authenticated/admin can read messages (handled by service role in API)
CREATE POLICY "Service role can read all messages" ON contact_messages
    FOR SELECT USING (true);

-- =====================================================
-- KURULUM TAMAMLANDI!
-- =====================================================
