begin;

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active','suspended','cancelled')),
  plan text not null default 'starter',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'agent' check (role in ('owner','admin','manager','agent','viewer')),
  status text not null default 'active' check (status in ('invited','active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = auth.uid()
      and om.status = 'active'
  );
$$;

create or replace function public.has_org_role(target_org uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = auth.uid()
      and om.status = 'active'
      and om.role = any(allowed_roles)
  );
$$;

alter table public.crm_contacts
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists version integer not null default 1,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists consent_status text not null default 'unknown' check (consent_status in ('unknown','granted','denied','revoked')),
  add column if not exists consent_source text,
  add column if not exists consent_at timestamptz,
  add column if not exists legal_basis text,
  add column if not exists data_retention_until timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists anonymized_at timestamptz;

create index if not exists crm_contacts_org_updated_idx
  on public.crm_contacts (organization_id, updated_at desc);
create index if not exists crm_contacts_org_active_idx
  on public.crm_contacts (organization_id)
  where deleted_at is null;
create index if not exists crm_contacts_data_gin_idx
  on public.crm_contacts using gin (data jsonb_path_ops);

create table if not exists public.integration_channels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  external_account_id text,
  phone_number_id text,
  display_name text,
  status text not null default 'active' check (status in ('active','inactive','error')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, phone_number_id)
);

create table if not exists public.raw_webhook_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  channel_id uuid references public.integration_channels(id) on delete set null,
  provider text not null,
  provider_event_id text,
  event_type text,
  signature_valid boolean not null default false,
  payload jsonb not null,
  headers jsonb not null default '{}'::jsonb,
  processing_status text not null default 'pending' check (processing_status in ('pending','processing','processed','failed','dead_letter')),
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  last_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create unique index if not exists raw_webhook_events_provider_event_uidx
  on public.raw_webhook_events (provider, provider_event_id)
  where provider_event_id is not null;
create index if not exists raw_webhook_events_queue_idx
  on public.raw_webhook_events (processing_status, next_attempt_at, received_at);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  channel_id uuid references public.integration_channels(id) on delete set null,
  message_id text,
  direction text not null default 'inbound' check (direction in ('inbound','outbound')),
  from_number text,
  to_number text,
  message_type text,
  text_body text,
  provider_timestamp timestamptz,
  contact_name text,
  phone_number_id text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_messages
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists channel_id uuid references public.integration_channels(id) on delete set null,
  add column if not exists direction text not null default 'inbound',
  add column if not exists to_number text,
  add column if not exists provider_timestamp timestamptz,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists whatsapp_messages_provider_uidx
  on public.whatsapp_messages (coalesce(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), message_id)
  where message_id is not null;
create index if not exists whatsapp_messages_org_created_idx
  on public.whatsapp_messages (organization_id, created_at desc);
create index if not exists whatsapp_messages_phone_idx
  on public.whatsapp_messages (organization_id, from_number, created_at desc);

create table if not exists public.message_status_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  message_id text not null,
  status text not null,
  error_code text,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (message_id, status, occurred_at)
);

create table if not exists public.integration_errors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  provider text not null,
  operation text not null,
  severity text not null default 'error' check (severity in ('warning','error','critical')),
  error_code text,
  error_message text not null,
  context jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_org_created_idx
  on public.audit_logs (organization_id, created_at desc);

create table if not exists public.daily_conversation_metrics (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  metric_date date not null,
  channel text not null default 'whatsapp',
  inbound_messages integer not null default 0,
  outbound_messages integer not null default 0,
  delivered_messages integer not null default 0,
  read_messages integer not null default 0,
  failed_messages integer not null default 0,
  unique_contacts integer not null default 0,
  avg_first_response_seconds numeric,
  updated_at timestamptz not null default now(),
  primary key (organization_id, metric_date, channel)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.bump_contact_version()
returns trigger
language plpgsql
as $$
begin
  new.version = old.version + 1;
  new.updated_at = now();
  if auth.uid() is not null then
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_crm_contacts_version on public.crm_contacts;
create trigger trg_crm_contacts_version
before update on public.crm_contacts
for each row execute function public.bump_contact_version();

drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at
before update on public.organizations
for each row execute function public.touch_updated_at();

drop trigger if exists trg_organization_members_updated_at on public.organization_members;
create trigger trg_organization_members_updated_at
before update on public.organization_members
for each row execute function public.touch_updated_at();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.integration_channels enable row level security;
alter table public.raw_webhook_events enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.message_status_events enable row level security;
alter table public.integration_errors enable row level security;
alter table public.audit_logs enable row level security;
alter table public.daily_conversation_metrics enable row level security;

drop policy if exists organizations_member_select on public.organizations;
create policy organizations_member_select on public.organizations
for select using (public.is_org_member(id));

drop policy if exists organizations_admin_update on public.organizations;
create policy organizations_admin_update on public.organizations
for update using (public.has_org_role(id, array['owner','admin']))
with check (public.has_org_role(id, array['owner','admin']));

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
for select using (id = auth.uid());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists organization_members_member_select on public.organization_members;
create policy organization_members_member_select on public.organization_members
for select using (public.is_org_member(organization_id));

drop policy if exists organization_members_admin_write on public.organization_members;
create policy organization_members_admin_write on public.organization_members
for all using (public.has_org_role(organization_id, array['owner','admin']))
with check (public.has_org_role(organization_id, array['owner','admin']));

drop policy if exists crm_contacts_member_select on public.crm_contacts;
create policy crm_contacts_member_select on public.crm_contacts
for select using (organization_id is not null and public.is_org_member(organization_id));

drop policy if exists crm_contacts_agent_write on public.crm_contacts;
create policy crm_contacts_agent_write on public.crm_contacts
for all using (organization_id is not null and public.has_org_role(organization_id, array['owner','admin','manager','agent']))
with check (organization_id is not null and public.has_org_role(organization_id, array['owner','admin','manager','agent']));

drop policy if exists integration_channels_member_select on public.integration_channels;
create policy integration_channels_member_select on public.integration_channels
for select using (public.is_org_member(organization_id));

drop policy if exists integration_channels_admin_write on public.integration_channels;
create policy integration_channels_admin_write on public.integration_channels
for all using (public.has_org_role(organization_id, array['owner','admin']))
with check (public.has_org_role(organization_id, array['owner','admin']));

drop policy if exists whatsapp_messages_member_select on public.whatsapp_messages;
create policy whatsapp_messages_member_select on public.whatsapp_messages
for select using (organization_id is not null and public.is_org_member(organization_id));

drop policy if exists message_status_member_select on public.message_status_events;
create policy message_status_member_select on public.message_status_events
for select using (organization_id is not null and public.is_org_member(organization_id));

drop policy if exists integration_errors_admin_select on public.integration_errors;
create policy integration_errors_admin_select on public.integration_errors
for select using (organization_id is not null and public.has_org_role(organization_id, array['owner','admin','manager']));

drop policy if exists audit_logs_admin_select on public.audit_logs;
create policy audit_logs_admin_select on public.audit_logs
for select using (organization_id is not null and public.has_org_role(organization_id, array['owner','admin']));

drop policy if exists daily_metrics_member_select on public.daily_conversation_metrics;
create policy daily_metrics_member_select on public.daily_conversation_metrics
for select using (public.is_org_member(organization_id));

revoke all on public.raw_webhook_events from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
revoke all on public.integration_errors from anon, authenticated;

grant select, insert, update, delete on public.crm_contacts to authenticated;
grant select on public.organizations, public.organization_members, public.integration_channels,
  public.whatsapp_messages, public.message_status_events, public.daily_conversation_metrics to authenticated;

commit;
