create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  streak_count integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  notifications_enabled boolean not null default false,
  notification_time text not null default '20:30',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  mode text not null check (mode in ('oneshot', 'playlist')),
  source_url text not null,
  source_label text not null default '',
  thumbnail text,
  color text not null default '#FFE45E',
  daily_minutes integer not null default 30,
  next_action text not null default 'Start first section',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  order_index integer not null,
  learning_objectives jsonb not null default '[]'::jsonb
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  youtube_video_id text not null,
  title text not null,
  thumbnail text,
  duration integer not null default 0,
  order_index integer not null
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  title text not null,
  start_timestamp integer not null default 0,
  end_timestamp integer not null default 0,
  duration integer not null default 0,
  day_number integer not null default 1,
  order_index integer not null,
  status text not null default 'available' check (status in ('locked', 'available', 'in_progress', 'completed')),
  timestamps jsonb not null default '[]'::jsonb
);

alter table public.courses
  add column if not exists current_section_id uuid references public.sections(id) on delete set null;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  summary text not null,
  key_points jsonb not null default '[]'::jsonb,
  terms jsonb not null default '[]'::jsonb
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  questions jsonb not null default '[]'::jsonb
);

create table if not exists public.daily_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  day integer not null,
  title text not null,
  minutes integer not null default 0,
  section_ids jsonb not null default '[]'::jsonb,
  unique (course_id, day)
);

create table if not exists public.course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  completed_section_ids jsonb not null default '[]'::jsonb,
  quiz_scores jsonb not null default '{}'::jsonb,
  last_opened_section_id uuid references public.sections(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  completed boolean not null default false,
  quiz_score integer,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, section_id)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  total_minutes integer not null default 0,
  sections_completed integer not null default 0,
  unique (user_id, date)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null check (plan in ('free', 'pro')),
  status text not null,
  current_period_end timestamptz,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_user_id_idx on public.courses(user_id);
create index if not exists modules_course_id_idx on public.modules(course_id);
create index if not exists videos_course_id_idx on public.videos(course_id);
create index if not exists videos_module_id_idx on public.videos(module_id);
create index if not exists sections_course_id_idx on public.sections(course_id);
create index if not exists sections_video_id_idx on public.sections(video_id);
create index if not exists daily_sessions_course_id_idx on public.daily_sessions(course_id);
create index if not exists course_progress_user_id_idx on public.course_progress(user_id);
create index if not exists course_progress_course_id_idx on public.course_progress(course_id);
create index if not exists progress_user_id_idx on public.progress(user_id);
create index if not exists progress_section_id_idx on public.progress(section_id);
create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.videos enable row level security;
alter table public.sections enable row level security;
alter table public.notes enable row level security;
alter table public.quizzes enable row level security;
alter table public.daily_sessions enable row level security;
alter table public.course_progress enable row level security;
alter table public.progress enable row level security;
alter table public.sessions enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "users can read own profile" on public.users;
create policy "users can read own profile" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users can update own profile" on public.users;
create policy "users can update own profile" on public.users
  for update using (auth.uid() = id);

drop policy if exists "users can read own courses" on public.courses;
create policy "users can read own courses" on public.courses
  for select using (auth.uid() = user_id);

drop policy if exists "users can read own modules" on public.modules;
create policy "users can read own modules" on public.modules
  for select using (
    exists (
      select 1
      from public.courses
      where courses.id = modules.course_id
        and courses.user_id = auth.uid()
    )
  );

drop policy if exists "users can read own videos" on public.videos;
create policy "users can read own videos" on public.videos
  for select using (
    exists (
      select 1
      from public.courses
      where courses.id = videos.course_id
        and courses.user_id = auth.uid()
    )
  );

drop policy if exists "users can read own sections" on public.sections;
create policy "users can read own sections" on public.sections
  for select using (
    exists (
      select 1
      from public.courses
      where courses.id = sections.course_id
        and courses.user_id = auth.uid()
    )
  );

drop policy if exists "users can read own notes" on public.notes;
create policy "users can read own notes" on public.notes
  for select using (
    exists (
      select 1
      from public.sections
      join public.courses on courses.id = sections.course_id
      where sections.id = notes.section_id
        and courses.user_id = auth.uid()
    )
  );

drop policy if exists "users can read own quizzes" on public.quizzes;
create policy "users can read own quizzes" on public.quizzes
  for select using (
    exists (
      select 1
      from public.sections
      join public.courses on courses.id = sections.course_id
      where sections.id = quizzes.section_id
        and courses.user_id = auth.uid()
    )
  );

drop policy if exists "users can read own daily sessions" on public.daily_sessions;
create policy "users can read own daily sessions" on public.daily_sessions
  for select using (
    exists (
      select 1
      from public.courses
      where courses.id = daily_sessions.course_id
        and courses.user_id = auth.uid()
    )
  );

drop policy if exists "users can read own course progress" on public.course_progress;
create policy "users can read own course progress" on public.course_progress
  for select using (auth.uid() = user_id);

drop policy if exists "users can upsert own course progress" on public.course_progress;
create policy "users can upsert own course progress" on public.course_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can read own progress" on public.progress;
create policy "users can read own progress" on public.progress
  for select using (auth.uid() = user_id);

drop policy if exists "users can upsert own progress" on public.progress;
create policy "users can upsert own progress" on public.progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can read own sessions" on public.sessions;
create policy "users can read own sessions" on public.sessions
  for select using (auth.uid() = user_id);

drop policy if exists "users can upsert own sessions" on public.sessions;
create policy "users can upsert own sessions" on public.sessions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can read own subscriptions" on public.subscriptions;
create policy "users can read own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row
execute function public.set_updated_at();

drop trigger if exists set_course_progress_updated_at on public.course_progress;
create trigger set_course_progress_updated_at
before update on public.course_progress
for each row
execute function public.set_updated_at();

drop trigger if exists set_progress_updated_at on public.progress;
create trigger set_progress_updated_at
before update on public.progress
for each row
execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    name,
    avatar_url
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Skillmeter learner'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(excluded.name, public.users.name),
        avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
