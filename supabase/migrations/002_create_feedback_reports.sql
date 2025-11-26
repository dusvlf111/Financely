create table if not exists feedback_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  is_guest boolean default false,
  category text not null,
  severity text not null,
  summary text not null,
  description text,
  reproduction_steps text,
  contact_email text,
  allow_follow_up boolean default false,
  app_version text,
  route text,
  device_info jsonb not null default '{}',
  user_agent text,
  user_context jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists feedback_reports_created_at_idx on feedback_reports (created_at desc);
create index if not exists feedback_reports_user_id_idx on feedback_reports (user_id);
