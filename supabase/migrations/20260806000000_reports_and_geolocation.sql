-- Coarse geolocation for the "top origins" chart. Only a country string is
-- ever stored; the raw client IP is looked up and discarded in the function.
alter table public.scan_logs add column if not exists country text;

-- Reports submitted from ResultScreen's "Report Link" flow, reviewed by an
-- admin in the panel. status starts pending; accept/decline just updates it.
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  url text not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Allow public inserts" on public.reports
  for insert to anon
  with check (true);

create policy "Allow public read access" on public.reports
  for select to anon
  using (true);

create policy "Allow public status updates" on public.reports
  for update to anon
  using (true)
  with check (true);

-- The admin panel's "Add Rule" form inserts here directly (no separate auth
-- layer beyond the URL token AdminPage already checks).
create policy "Allow public inserts" on public.blacklist
  for insert to anon
  with check (true);
