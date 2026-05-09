alter table if exists public.chatbot_flows
  add column if not exists description text not null default '',
  add column if not exists test_phone text,
  add column if not exists keywords text[] not null default '{}'::text[],
  add column if not exists is_service_flow boolean not null default false,
  add column if not exists definition jsonb not null default '{}'::jsonb,
  add column if not exists n8n_sync_status text not null default 'idle',
  add column if not exists last_published_at timestamptz;

update public.chatbot_flows
set description = name
where description = '';

