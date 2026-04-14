create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('td', 'counselor', 'principal', 'staff', 'student')),
  campus text check (campus in ('elementary', 'secondary', 'both')),
  created_at timestamptz default now()
);

alter table public.user_roles enable row level security;

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
