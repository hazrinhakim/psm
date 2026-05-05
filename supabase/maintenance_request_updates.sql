-- Maintenance request tracking history table
create table if not exists public.maintenance_request_updates (
  id uuid primary key default gen_random_uuid(),
  maintenance_request_id uuid not null references public.maintenance_requests(id) on delete cascade,
  progress_step text not null,
  note text null,
  updated_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Allowed progress step values
alter table public.maintenance_request_updates
  add constraint maintenance_request_updates_progress_step_check
  check (
    progress_step in (
      'Submitted',
      'Received by Admin',
      'Under Review',
      'In Progress',
      'Waiting for Parts',
      'Resolved',
      'Completed'
    )
  );

create index if not exists maintenance_request_updates_request_id_idx
  on public.maintenance_request_updates (maintenance_request_id);

create index if not exists maintenance_request_updates_created_at_idx
  on public.maintenance_request_updates (created_at);

-- Seed initial tracking rows for existing requests that do not have updates yet.
insert into public.maintenance_request_updates (
  maintenance_request_id,
  progress_step,
  note,
  updated_by,
  created_at
)
select
  mr.id,
  'Submitted',
  null,
  mr.requested_by,
  mr.created_at
from public.maintenance_requests mr
where not exists (
  select 1
  from public.maintenance_request_updates u
  where u.maintenance_request_id = mr.id
);
