-- ============================================================
-- AI Club Content Dashboard — Supabase Schema
-- Run this in your Supabase project's SQL editor:
--   https://supabase.com/dashboard/project/ovppxqqlpzsqwgqesove/sql
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================

-- ── Posts table — original columns ───────────────────────────
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS thumbnail text NOT NULL DEFAULT 'from-pink-600 to-rose-600',
  ADD COLUMN IF NOT EXISTS tags      text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reach     integer,
  ADD COLUMN IF NOT EXISTS likes     integer,
  ADD COLUMN IF NOT EXISTS comments  integer,
  ADD COLUMN IF NOT EXISTS saves     integer;

-- ── Posts table — scheduling / publishing pipeline ───────────
--
-- publish_status tracks the automated publishing pipeline state:
--   draft       → post is saved, not in pipeline
--   scheduled   → post is queued for publishing at scheduled_for
--   publishing  → scheduler has picked it up and is publishing now
--   published   → successfully published by the scheduler
--   failed      → scheduler attempted to publish and failed
--
-- This is separate from the editorial `status` column which tracks
-- the content workflow (draft / scheduled / review / published).

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS publish_status text NOT NULL DEFAULT 'draft'
    CHECK (publish_status IN ('draft','scheduled','publishing','published','failed')),
  ADD COLUMN IF NOT EXISTS publish_error  text,
  ADD COLUMN IF NOT EXISTS published_at  timestamptz;

-- scheduled_for already exists on the table (timestamptz).
-- Re-add safely in case it was missing on a fresh instance:
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'posts_anon_select'
  ) THEN
    CREATE POLICY posts_anon_select ON posts FOR SELECT TO anon USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'posts_anon_insert'
  ) THEN
    CREATE POLICY posts_anon_insert ON posts FOR INSERT TO anon WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'posts_anon_update'
  ) THEN
    CREATE POLICY posts_anon_update ON posts FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'posts_anon_delete'
  ) THEN
    CREATE POLICY posts_anon_delete ON posts FOR DELETE TO anon USING (true);
  END IF;
END $$;
