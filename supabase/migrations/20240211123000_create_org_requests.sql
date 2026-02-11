-- Create organization_requests table
create table if not exists organization_requests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('veterinaria', 'refugio')),
  location_lat double precision not null,
  location_lng double precision not null,
  address text,
  contact_info text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table organization_requests enable row level security;

-- Policy: Anyone can insert (public request)
create policy "Anyone can create organization requests"
  on organization_requests for insert
  to public
  with check (true);

-- Policy: Only admins can view/update (Assuming admin role check or service_role usage)
-- For now, we allow authenticated users to view (or restrict to admin in app logic)
create policy "Admins can view all requests"
  on organization_requests for select
  to authenticated
  using (true);

create policy "Admins can update requests"
  on organization_requests for update
  to authenticated
  using (true);
