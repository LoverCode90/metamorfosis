-- Allow admins to close case messaging without resolving the case.
alter table public.cases
  add column if not exists chat_closed_at timestamptz;

comment on column public.cases.chat_closed_at is
  'When set, neither customer nor admin can send new case messages.';
