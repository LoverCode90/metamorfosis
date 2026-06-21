-- Add document_hash column to profiles for duplicate-document detection.
-- SHA-256 hex digest of the uploaded license file buffer.
alter table public.profiles
  add column if not exists document_hash text;

create unique index if not exists idx_profiles_document_hash
  on public.profiles(document_hash)
  where document_hash is not null;
