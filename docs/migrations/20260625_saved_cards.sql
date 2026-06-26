create table public.saved_cards (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references public.profiles(id) on delete cascade,
  square_card_id     text        not null,
  square_customer_id text        not null,
  brand              text,
  last_four          text        not null,
  exp_month          integer     not null,
  exp_year           integer     not null,
  is_default         boolean     not null default false,
  created_at         timestamptz not null default now()
);

alter table public.saved_cards enable row level security;

create policy "users_select_own_cards"
  on public.saved_cards for select
  using (auth.uid() = user_id);

create policy "users_delete_own_cards"
  on public.saved_cards for delete
  using (auth.uid() = user_id);

-- No INSERT policy — service role (admin client) inserts only

create index idx_saved_cards_user_id       on public.saved_cards(user_id);
create index idx_saved_cards_square_card_id on public.saved_cards(square_card_id);
