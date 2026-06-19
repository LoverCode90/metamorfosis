# 05 — Admin Setup

## Overview

The `/admin` section is protected by both Supabase Auth (session required) and an
`admin` role check enforced in `lib/auth/helpers.ts → requireAdmin()`.

---

## 1. Supabase Dashboard Configuration

### 1.1 Auth Providers

Enable the desired providers in **Supabase Dashboard → Authentication → Providers**:

| Provider | Required setting                                                  |
| -------- | ----------------------------------------------------------------- |
| Google   | OAuth Client ID + Secret from Google Cloud Console                |
| Apple    | Service ID, Team ID, Key ID, private key                          |
| Email    | Enable "Confirm email" and set SMTP in **Auth → Email Templates** |

### 1.2 Redirect URLs

Add the following to **Auth → URL Configuration → Redirect URLs**:

```
https://<YOUR_DOMAIN>/auth/callback
http://localhost:3000/auth/callback   # local dev
```

Set **Site URL** to `https://<YOUR_DOMAIN>`.

---

## 2. Database

### 2.1 `public.profiles` table

```sql
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  full_name           text not null default '',
  phone_number        text,
  bio                 text,
  role                text not null default 'customer'
                        check (role in ('customer', 'professional', 'admin')),
  verification_status text not null default 'not_applicable'
                        check (verification_status in (
                          'not_applicable', 'pending_review', 'approved', 'rejected'
                        )),
  business_name       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
```

### 2.2 Auto-create profile on signup

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 2.3 `updated_at` trigger

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
```

### 2.4 Row Level Security

```sql
alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "profiles: own read"  on public.profiles for select using (auth.uid() = id);
create policy "profiles: own write" on public.profiles for update using (auth.uid() = id);

-- Admins can read all profiles
create policy "profiles: admin read" on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
```

---

## 3. Granting Admin Role

Run the following in the Supabase SQL editor (replace the email):

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

---

## 4. Environment Variables

| Variable                         | Description                                       |
| -------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase project URL                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Public anon key                                   |
| `SUPABASE_SERVICE_ROLE_KEY`      | Service role key — **server only, never expose**  |
| `NEXT_PUBLIC_APP_URL`            | Full public URL (e.g. `https://metamorfosis.com`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (optional in dev)   |
| `TURNSTILE_SECRET_KEY`           | Cloudflare Turnstile secret key (server only)     |

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is
gitignored and must never be committed.

---

## 5. Admin UI

The `/admin` route group (`app/(admin)/`) is protected by `requireAdmin()` in each
Server Component. Access is denied at the server level before any HTML is sent.
A `403` page lives at `app/403/page.tsx`.
