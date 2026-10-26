-- انسخ هاد الملف كامل فـ Supabase > SQL Editor > New query، وضغط Run (مرة وحدة فقط).

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_name text not null,
  city text,
  whatsapp text,
  bio text,
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  category text,
  price numeric not null,
  weights text[] default '{}',
  delivery text[] default '{}',
  payment text[] default '{}',
  prep_time text,
  shelf_life text,
  image_url text,
  city text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table products enable row level security;

create policy "profiles_read" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

create policy "products_read" on products for select using (is_active or auth.uid() = seller_id);
create policy "products_insert" on products for insert with check (auth.uid() = seller_id);
create policy "products_update" on products for update using (auth.uid() = seller_id);
create policy "products_delete" on products for delete using (auth.uid() = seller_id);

insert into storage.buckets (id, name, public) values ('products', 'products', true);
create policy "img_read" on storage.objects for select using (bucket_id = 'products');
create policy "img_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "img_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and (storage.foldername(name))[1] = auth.uid()::text);
