-- Schema for Jorge's multi-project task app.
-- Single-user app: RLS is enabled everywhere but with zero policies for the
-- `anon` key (default-deny). All reads/writes happen server-side via the
-- service role key from Next.js API routes.

create extension if not exists "pgcrypto";

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#8fe08a',
  position double precision not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  due_date timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  position double precision not null default 0,
  source text not null default 'manual' check (source in ('voice', 'text', 'manual')),
  raw_capture_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table capture_sessions (
  id uuid primary key default gen_random_uuid(),
  input_type text not null check (input_type in ('voice', 'text')),
  raw_text text not null,
  claude_response jsonb,
  created_at timestamptz not null default now()
);

create index tasks_project_position_idx on tasks (project_id, position);
create index tasks_due_date_idx on tasks (due_date);
create index attachments_task_id_idx on attachments (task_id);

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_set_updated_at
  before update on tasks
  for each row
  execute function set_updated_at();

-- RLS: enabled, default-deny for anon/authenticated. Only the service role
-- (used server-side) bypasses RLS entirely.
alter table projects enable row level security;
alter table tasks enable row level security;
alter table attachments enable row level security;
alter table capture_sessions enable row level security;

-- Storage bucket for task attachments (private; access via signed URLs
-- minted server-side).
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;

-- Seed Jorge's initial projects/columns.
insert into projects (name, color, position) values
  ('Inbox', '#93aba0', 0),
  ('Edu Farah', '#8fe08a', 1),
  ('Jornada do Propósito', '#c7a9e0', 2),
  ('Projetos Pessoais', '#e0c98a', 3),
  ('YouTube – PodFaià', '#e08a8a', 4),
  ('YouTube – Jorge Mauricio', '#8ab4e0', 5),
  ('Trutas do Rocio', '#6fce6a', 6),
  ('Afazeres Pessoais', '#a3d1ad', 7);
