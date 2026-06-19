create table if not exists public.crm_contacts (
  id bigint primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists crm_contacts_updated_at_idx on public.crm_contacts (updated_at desc);

alter table public.crm_contacts enable row level security;
