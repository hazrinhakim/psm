create table public.notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  message text not null,
  type text not null,
  date timestamp with time zone not null default now(),
  read boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint notifications_pkey primary key (id),
  constraint notifications_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade,
  constraint notifications_type_check check (
    (
      type = any (
        array[
          'maintenance'::text,
          'warranty'::text,
          'general'::text
        ]
      )
    )
  )
) tablespace pg_default;

create index if not exists notifications_user_id_idx on public.notifications using btree (user_id) tablespace pg_default;

create index if not exists notifications_read_idx on public.notifications using btree (user_id, read) tablespace pg_default;

create index if not exists notifications_date_idx on public.notifications using btree (date desc) tablespace pg_default;
