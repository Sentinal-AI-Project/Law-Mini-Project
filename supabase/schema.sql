-- Sentinel Law - Supabase schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'analyst' check (role in ('admin', 'analyst', 'viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  doc_type text not null check (doc_type in ('contract', 'email', 'invoice', 'policy')),
  upload_user_id uuid not null references public.users(id) on delete cascade,
  source_url text,
  status text not null default 'pending' check (status in ('pending', 'analyzing', 'analyzed', 'completed', 'failed')),
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_documents_upload_user_status
  on public.documents(upload_user_id, status);

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  framework text not null,
  description text,
  version text not null default '1.0',
  rules jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clauses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  clause_text text not null,
  clause_type text not null default 'other',
  position_start integer,
  position_end integer,
  extracted_at timestamptz not null default now()
);

create index if not exists idx_clauses_document on public.clauses(document_id);

create table if not exists public.findings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  clause_id uuid references public.clauses(id) on delete set null,
  risk_type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  confidence numeric(4,3) not null check (confidence >= 0 and confidence <= 1),
  description text not null,
  evidence_snippet text,
  policy_ref_id uuid references public.policies(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_findings_doc_severity on public.findings(document_id, severity);
create index if not exists idx_findings_confidence on public.findings(confidence);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  generated_by uuid not null references public.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  framework text,
  total_findings integer not null default 0,
  critical_count integer not null default 0,
  high_count integer not null default 0,
  medium_count integer not null default 0,
  low_count integer not null default 0,
  file_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_generated_by_created_at
  on public.reports(generated_by, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_policies_updated_at on public.policies;
create trigger trg_policies_updated_at
before update on public.policies
for each row
execute procedure public.set_updated_at();
