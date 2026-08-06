-- Admin views (scan logs, blacklist) read via the public anon key, so RLS
-- needs an explicit SELECT policy for them or every query returns empty.
create policy "Allow public read access" on public.scan_logs
  for select to anon
  using (true);

create policy "Allow public read access" on public.blacklist
  for select to anon
  using (true);
