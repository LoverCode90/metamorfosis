-- Split profiles.full_name into first_name + last_name.
-- Existing rows: split on the first space. Single-word names → entire string in first_name.
-- Application code keeps reading full_name for now (kept as a generated/backwards-compat
-- column would over-couple — instead the storefront mappers compose it from the parts).

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name  text;

-- Backfill from existing full_name. Run once; subsequent runs are no-ops.
update public.profiles
set
  first_name = coalesce(first_name, split_part(full_name, ' ', 1)),
  last_name  = coalesce(
    last_name,
    case
      when position(' ' in full_name) = 0 then ''
      else substring(full_name from position(' ' in full_name) + 1)
    end
  )
where first_name is null or last_name is null;

-- Keep full_name in sync with the parts so any legacy code that still reads it
-- (auth.users.raw_user_meta_data and old client queries) sees a coherent value.
create or replace function public.sync_full_name()
returns trigger as $$
begin
  if new.first_name is not null or new.last_name is not null then
    new.full_name := trim(both ' ' from coalesce(new.first_name, '') || ' ' || coalesce(new.last_name, ''));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists sync_full_name_trigger on public.profiles;
create trigger sync_full_name_trigger
  before insert or update of first_name, last_name on public.profiles
  for each row execute procedure public.sync_full_name();

-- Cache the split first_name + last_name on pending_signups so verify-email can
-- create the profile with the structured fields instead of re-splitting at insert.
alter table public.pending_signups
  add column if not exists first_name text,
  add column if not exists last_name  text;
