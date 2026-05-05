create table if not exists public.chatbot_flows (
  id bigint primary key,
  name text not null,
  trigger text not null,
  active boolean not null default true,
  conversations integer not null default 0,
  last_test_score integer,
  last_test_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chatbot_agents (
  id bigint primary key,
  name text not null,
  channel text not null,
  focus text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chatbot_flows_active_idx on public.chatbot_flows (active);
create index if not exists chatbot_agents_status_idx on public.chatbot_agents (status);
