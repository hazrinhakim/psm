create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  email text,
  role text not null check (role in ('staff', 'assistant')),
  message text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'closed'))
);

alter table public.feedback
  add column if not exists email text;

alter table public.feedback
  drop column if exists title,
  drop column if exists rating;

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_status_idx on public.feedback (status);
create index if not exists feedback_role_idx on public.feedback (role);

alter table public.feedback enable row level security;

create policy "feedback_insert_own"
on public.feedback
for insert
to authenticated
with check (auth.uid() = created_by and role in ('staff', 'assistant'));

create policy "feedback_select_own"
on public.feedback
for select
to authenticated
using (auth.uid() = created_by or exists (
  select 1 from public.profiles
  where profiles.id = auth.uid() and profiles.role = 'admin'
));
