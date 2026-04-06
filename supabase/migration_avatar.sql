-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add avatar_url to users table + create avatars storage bucket
-- Run this in the Supabase SQL editor for your project.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add avatar_url column to users (nullable, so existing accounts are unaffected)
alter table public.users
  add column if not exists avatar_url text;

-- 2. Create the "avatars" storage bucket if it doesn't exist
-- NOTE: Run this via Supabase Dashboard → Storage → New Bucket, OR via the JS client/CLI.
-- Storage buckets cannot be created from plain SQL, but the bucket name must be "avatars"
-- and set to PUBLIC so getPublicUrl() works without signing.

-- 3. (Optional) RLS policy so users can upload only to their own folder.
-- Only needed if you have RLS enabled on storage.objects:
--
-- create policy "Users can upload own avatar"
--   on storage.objects for insert
--   to authenticated
--   with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
--
-- create policy "Anyone can read avatars"
--   on storage.objects for select
--   to public
--   using (bucket_id = 'avatars');
