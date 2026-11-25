-- 001: Member profile tables.
-- Already applied to Neon `production` (and copied to `dev`) on 2026-11-14 via the SQL Editor.
-- Kept here so the schema is version-controlled and can be rebuilt.

create extension if not exists citext;

-- Emails pre-approved to sign in and create a profile
create table approved_emails (
  email       citext primary key,
  subteam     text,
  role        text,
  added_by    text,
  created_at  timestamptz not null default now()
);

-- Admin accounts
create table admins (
  user_id     text primary key,
  created_at  timestamptz not null default now()
);

create type profile_status as enum ('pending', 'published', 'hidden');

create table profiles (
  user_id      text primary key,
  public_id    uuid not null unique default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 80),
  role         text check (char_length(role) <= 80),
  subteam      text not null check (subteam in
                 ('software-ai', 'electrical-embedded', 'mechanical', 'operations')),
  program      text check (char_length(program) <= 120),
  bio          text check (char_length(bio) <= 500),
  photo_id     text,
  linkedin_url text check (linkedin_url ~ '^https://(www\.)?linkedin\.com/'),
  github_url   text check (github_url ~ '^https://github\.com/'),
  consent      boolean not null default false,
  status       profile_status not null default 'pending',
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint published_requires_consent
    check (status <> 'published' or consent)
);

create index profiles_published_idx
  on profiles (subteam, sort_order, name)
  where status = 'published';

create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- The only view the public API reads: published profiles, display fields only
create view public_members as
select public_id as id, name, role, subteam, program, bio,
       photo_id, linkedin_url, github_url, sort_order
from profiles
where status = 'published';

-- Limited role used by the website's serverless functions (created in the Neon console).
grant usage on schema public to aim_app;
grant select                 on public_members  to aim_app;
grant select, insert, update on profiles        to aim_app;
grant select, insert, delete on approved_emails to aim_app;
grant select                 on admins          to aim_app;
