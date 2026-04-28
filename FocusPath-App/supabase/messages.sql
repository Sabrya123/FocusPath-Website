-- Run this in the Supabase SQL editor.
-- Creates a messages table for direct chats between accepted friends,
-- plus row-level security so each user can only see their own conversations.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_pair_created_idx
  on public.messages (
    least(sender_id, receiver_id),
    greatest(sender_id, receiver_id),
    created_at desc
  );

create index if not exists messages_unread_idx
  on public.messages (receiver_id, read_at)
  where read_at is null;

alter table public.messages enable row level security;

drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
  on public.messages for insert
  with check (auth.uid() = sender_id);

drop policy if exists "messages_update_received" on public.messages;
create policy "messages_update_received"
  on public.messages for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);
