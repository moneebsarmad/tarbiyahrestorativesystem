create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_app_campus()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select campus
  from public.user_roles
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.refresh_student_3r_profile()
returns void
language sql
security definer
set search_path = public
as $$
  refresh materialized view public.student_3r_profile;
$$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('td', 'counselor', 'principal', 'staff', 'student')),
  campus text check (campus in ('elementary', 'secondary', 'both')),
  created_at timestamptz default now()
);

alter table if exists public.students
  add column if not exists division text
  check (division in ('elementary', 'secondary'));

create table if not exists public.tarbiyah_referrals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  referred_by uuid references auth.users(id),
  infraction text not null,
  infraction_level integer check (infraction_level between 1 and 4),
  staff_notes text,
  sycamore_log_id text,
  complexity text check (complexity in ('simple', 'compound', 'complex')),
  primary_r text check (primary_r in ('righteousness', 'respect', 'responsibility')),
  primary_sub_value text,
  secondary_r text,
  secondary_sub_value text,
  tertiary_r text,
  tertiary_sub_value text,
  status text not null default 'pending'
    check (status in ('pending', 'td_review', 'scheduled', 'in_session', 'completed', 'flagged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.islamic_anchor_library (
  id uuid primary key default gen_random_uuid(),
  sub_value text not null,
  anchor_type text not null check (anchor_type in ('ayah', 'hadith')),
  arabic_text text not null,
  transliteration text,
  translation text not null,
  source text not null,
  discussion_questions jsonb not null default '[]'::jsonb,
  is_system_default boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tarbiyah_sessions (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.tarbiyah_referrals(id) on delete cascade,
  session_number integer not null default 1,
  session_date date not null,
  td_id uuid not null references auth.users(id),
  phase_notes jsonb not null default '{}'::jsonb,
  phases_completed integer[] not null default '{}'::integer[],
  islamic_anchor_id uuid references public.islamic_anchor_library(id),
  action_steps jsonb not null default '[]'::jsonb,
  follow_up_date date,
  follow_up_notes text,
  parent_contacted boolean not null default false,
  parent_conference_held boolean not null default false,
  muraaqabah_flag boolean not null default false,
  muraaqabah_flag_reason text,
  muraaqabah_overridden boolean not null default false,
  student_token text unique,
  student_token_expires_at timestamptz,
  status text not null default 'open'
    check (status in ('open', 'completed', 'split_pending')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tarbiyah_action_steps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tarbiyah_sessions(id) on delete cascade,
  r text not null check (r in ('righteousness', 'respect', 'responsibility')),
  sub_value text not null,
  description text not null,
  assigned_date date not null,
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  completed_by_role text,
  completion_notes text,
  created_at timestamptz default now()
);

create table if not exists public.tarbiyah_worksheet_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tarbiyah_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  what_happened text,
  feelings text,
  who_affected text,
  prophet_reflection text,
  righteousness_response text,
  respect_response text,
  responsibility_response text,
  submitted_at timestamptz default now()
);

create table if not exists public.tarbiyah_parent_comms (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tarbiyah_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  comm_type text not null check (comm_type in ('email_summary', 'conference', 'phone')),
  sent_at timestamptz,
  sent_by uuid references auth.users(id),
  recipient_email text,
  email_subject text,
  email_body text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists tarbiyah_referrals_student_id_idx
  on public.tarbiyah_referrals(student_id);

create index if not exists tarbiyah_referrals_referred_by_idx
  on public.tarbiyah_referrals(referred_by);

create index if not exists tarbiyah_referrals_status_idx
  on public.tarbiyah_referrals(status);

create index if not exists tarbiyah_sessions_referral_id_idx
  on public.tarbiyah_sessions(referral_id);

create index if not exists tarbiyah_sessions_session_date_idx
  on public.tarbiyah_sessions(session_date desc);

create index if not exists tarbiyah_sessions_status_idx
  on public.tarbiyah_sessions(status);

create index if not exists tarbiyah_sessions_student_token_idx
  on public.tarbiyah_sessions(student_token);

create index if not exists tarbiyah_action_steps_session_id_idx
  on public.tarbiyah_action_steps(session_id);

create index if not exists tarbiyah_action_steps_due_date_idx
  on public.tarbiyah_action_steps(due_date);

create index if not exists tarbiyah_action_steps_completed_idx
  on public.tarbiyah_action_steps(completed);

create index if not exists islamic_anchor_library_sub_value_idx
  on public.islamic_anchor_library(sub_value);

create index if not exists tarbiyah_worksheet_responses_session_id_idx
  on public.tarbiyah_worksheet_responses(session_id);

create index if not exists tarbiyah_parent_comms_session_id_idx
  on public.tarbiyah_parent_comms(session_id);

drop trigger if exists tarbiyah_referrals_set_updated_at on public.tarbiyah_referrals;
create trigger tarbiyah_referrals_set_updated_at
before update on public.tarbiyah_referrals
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists islamic_anchor_library_set_updated_at on public.islamic_anchor_library;
create trigger islamic_anchor_library_set_updated_at
before update on public.islamic_anchor_library
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists tarbiyah_sessions_set_updated_at on public.tarbiyah_sessions;
create trigger tarbiyah_sessions_set_updated_at
before update on public.tarbiyah_sessions
for each row
execute function public.set_current_timestamp_updated_at();

drop materialized view if exists public.student_3r_profile;

create materialized view public.student_3r_profile as
select
  s.id as student_id,
  s.name,
  s.grade,
  s.house,
  s.division,
  count(distinct r.id) filter (where r.primary_r = 'righteousness')::integer as righteousness_demerits,
  count(distinct r.id) filter (where r.primary_r = 'respect')::integer as respect_demerits,
  count(distinct r.id) filter (where r.primary_r = 'responsibility')::integer as responsibility_demerits,
  0::integer as righteousness_merits,
  0::integer as respect_merits,
  0::integer as responsibility_merits,
  count(distinct sess.id)::integer as total_sessions,
  count(distinct sess.id) filter (where r.complexity = 'simple')::integer as simple_sessions,
  count(distinct sess.id) filter (where r.complexity = 'compound')::integer as compound_sessions,
  count(distinct sess.id) filter (where r.complexity = 'complex')::integer as complex_sessions,
  coalesce(
    round(
      (
        count(distinct ast.id) filter (where ast.completed)
      )::numeric / nullif(count(distinct ast.id), 0),
      2
    ),
    0
  ) as action_step_completion_rate,
  max(sess.session_date) as last_session_date,
  coalesce(bool_or(sess.muraaqabah_flag and not sess.muraaqabah_overridden), false) as muraaqabah_active
from public.students s
left join public.tarbiyah_referrals r on r.student_id = s.id
left join public.tarbiyah_sessions sess on sess.referral_id = r.id
left join public.tarbiyah_action_steps ast on ast.session_id = sess.id
group by s.id, s.name, s.grade, s.house, s.division;

create unique index if not exists student_3r_profile_student_id_idx
  on public.student_3r_profile(student_id);

create or replace view public.student_3r_profile_read
with (security_invoker = true)
as
select *
from public.student_3r_profile
where public.current_app_role() in ('td', 'counselor', 'principal');

create or replace view public.tarbiyah_session_outcomes
with (security_invoker = true)
as
select
  sess.id,
  sess.referral_id,
  ref.student_id,
  sess.session_number,
  sess.session_date,
  sess.td_id,
  sess.islamic_anchor_id,
  sess.follow_up_date,
  sess.follow_up_notes,
  sess.parent_contacted,
  sess.parent_conference_held,
  sess.muraaqabah_flag,
  sess.muraaqabah_flag_reason,
  sess.muraaqabah_overridden,
  sess.status,
  sess.created_at,
  sess.updated_at
from public.tarbiyah_sessions sess
join public.tarbiyah_referrals ref on ref.id = sess.referral_id
where public.current_app_role() in ('td', 'counselor');

grant select on public.student_3r_profile_read to authenticated;
grant select on public.tarbiyah_session_outcomes to authenticated;

alter table public.user_roles enable row level security;
alter table public.tarbiyah_referrals enable row level security;
alter table public.islamic_anchor_library enable row level security;
alter table public.tarbiyah_sessions enable row level security;
alter table public.tarbiyah_action_steps enable row level security;
alter table public.tarbiyah_worksheet_responses enable row level security;
alter table public.tarbiyah_parent_comms enable row level security;

drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Service role can manage user roles" on public.user_roles;
create policy "Service role can manage user roles"
on public.user_roles
for all
to service_role
using (true)
with check (true);

drop policy if exists "TD full access referrals" on public.tarbiyah_referrals;
create policy "TD full access referrals"
on public.tarbiyah_referrals
for all
to authenticated
using (public.current_app_role() = 'td')
with check (public.current_app_role() = 'td');

drop policy if exists "Counselor read referrals" on public.tarbiyah_referrals;
create policy "Counselor read referrals"
on public.tarbiyah_referrals
for select
to authenticated
using (public.current_app_role() = 'counselor');

drop policy if exists "Staff insert referrals" on public.tarbiyah_referrals;
create policy "Staff insert referrals"
on public.tarbiyah_referrals
for insert
to authenticated
with check (
  public.current_app_role() = 'staff'
  and referred_by = auth.uid()
);

drop policy if exists "Staff read own referrals" on public.tarbiyah_referrals;
create policy "Staff read own referrals"
on public.tarbiyah_referrals
for select
to authenticated
using (
  public.current_app_role() = 'staff'
  and referred_by = auth.uid()
);

drop policy if exists "TD full access anchors" on public.islamic_anchor_library;
create policy "TD full access anchors"
on public.islamic_anchor_library
for all
to authenticated
using (public.current_app_role() = 'td')
with check (public.current_app_role() = 'td');

drop policy if exists "Counselor read anchors" on public.islamic_anchor_library;
create policy "Counselor read anchors"
on public.islamic_anchor_library
for select
to authenticated
using (
  public.current_app_role() in ('td', 'counselor')
  and is_active = true
);

drop policy if exists "TD full access sessions" on public.tarbiyah_sessions;
create policy "TD full access sessions"
on public.tarbiyah_sessions
for all
to authenticated
using (public.current_app_role() = 'td')
with check (public.current_app_role() = 'td');

drop policy if exists "TD full access action steps" on public.tarbiyah_action_steps;
create policy "TD full access action steps"
on public.tarbiyah_action_steps
for all
to authenticated
using (public.current_app_role() = 'td')
with check (public.current_app_role() = 'td');

drop policy if exists "Counselor read action steps" on public.tarbiyah_action_steps;
create policy "Counselor read action steps"
on public.tarbiyah_action_steps
for select
to authenticated
using (public.current_app_role() = 'counselor');

drop policy if exists "TD full access worksheet responses" on public.tarbiyah_worksheet_responses;
create policy "TD full access worksheet responses"
on public.tarbiyah_worksheet_responses
for all
to authenticated
using (public.current_app_role() = 'td')
with check (public.current_app_role() = 'td');

drop policy if exists "Student worksheet token insert" on public.tarbiyah_worksheet_responses;
create policy "Student worksheet token insert"
on public.tarbiyah_worksheet_responses
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.tarbiyah_sessions sess
    join public.tarbiyah_referrals ref on ref.id = sess.referral_id
    where sess.id = session_id
      and ref.student_id = student_id
      and sess.student_token = current_setting('app.session_token', true)
      and sess.student_token_expires_at > now()
  )
);

drop policy if exists "Student worksheet token read" on public.tarbiyah_worksheet_responses;
create policy "Student worksheet token read"
on public.tarbiyah_worksheet_responses
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.tarbiyah_sessions sess
    join public.tarbiyah_referrals ref on ref.id = sess.referral_id
    where sess.id = session_id
      and ref.student_id = student_id
      and sess.student_token = current_setting('app.session_token', true)
      and sess.student_token_expires_at > now()
  )
);

drop policy if exists "Student worksheet token update" on public.tarbiyah_worksheet_responses;
create policy "Student worksheet token update"
on public.tarbiyah_worksheet_responses
for update
to anon, authenticated
using (
  exists (
    select 1
    from public.tarbiyah_sessions sess
    join public.tarbiyah_referrals ref on ref.id = sess.referral_id
    where sess.id = session_id
      and ref.student_id = student_id
      and sess.student_token = current_setting('app.session_token', true)
      and sess.student_token_expires_at > now()
  )
)
with check (
  exists (
    select 1
    from public.tarbiyah_sessions sess
    join public.tarbiyah_referrals ref on ref.id = sess.referral_id
    where sess.id = session_id
      and ref.student_id = student_id
      and sess.student_token = current_setting('app.session_token', true)
      and sess.student_token_expires_at > now()
  )
);

drop policy if exists "TD full access parent comms" on public.tarbiyah_parent_comms;
create policy "TD full access parent comms"
on public.tarbiyah_parent_comms
for all
to authenticated
using (public.current_app_role() = 'td')
with check (public.current_app_role() = 'td');

drop policy if exists "Counselor read parent comms" on public.tarbiyah_parent_comms;
create policy "Counselor read parent comms"
on public.tarbiyah_parent_comms
for select
to authenticated
using (public.current_app_role() = 'counselor');
