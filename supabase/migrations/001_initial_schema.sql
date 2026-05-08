-- Enable UUID extension
create extension if not exists "pgcrypto";

-- =============================================
-- PROFILES
-- =============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text unique,
  role text default 'user' check (role in ('admin', 'user')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- RECIPES
-- =============================================
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  ingredients text[],
  instructions text,
  tags text[],
  category text,
  prep_time_mins int,
  cook_time_mins int,
  servings int,
  anti_inflammatory_score int check (anti_inflammatory_score between 0 and 100),
  nutrition jsonb,
  published boolean default false,
  author_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists recipes_slug_idx on recipes(slug);
create index if not exists recipes_published_idx on recipes(published);
create index if not exists recipes_category_idx on recipes(category);

-- =============================================
-- FOODS
-- =============================================
create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text,
  description text,
  benefits text[],
  avoid_if text[],
  score int check (score between 0 and 100),
  image_url text,
  "references" text[],
  published boolean default false,
  created_at timestamptz default now()
);

create index if not exists foods_slug_idx on foods(slug);
create index if not exists foods_category_idx on foods(category);

-- =============================================
-- PROTOCOLS
-- =============================================
create table if not exists protocols (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,
  duration text,
  goal text,
  difficulty text,
  steps jsonb,
  tags text[],
  published boolean default false,
  author_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists protocols_slug_idx on protocols(slug);

-- =============================================
-- SAVED RECIPES
-- =============================================
create table if not exists saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  saved_at timestamptz default now(),
  unique(user_id, recipe_id)
);

-- =============================================
-- USER PROTOCOLS
-- =============================================
create table if not exists user_protocols (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  protocol_id uuid references protocols(id) on delete cascade not null,
  started_at timestamptz default now(),
  unique(user_id, protocol_id)
);

-- =============================================
-- NEWSLETTER
-- =============================================
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Profiles
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Recipes (public read for published, admin full CRUD)
alter table recipes enable row level security;
create policy "Public can read published recipes" on recipes for select using (published = true);
create policy "Admins have full access to recipes" on recipes for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Foods (public read for published, admin full CRUD)
alter table foods enable row level security;
create policy "Public can read published foods" on foods for select using (published = true);
create policy "Admins have full access to foods" on foods for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Protocols (public read for published, admin full CRUD)
alter table protocols enable row level security;
create policy "Public can read published protocols" on protocols for select using (published = true);
create policy "Admins have full access to protocols" on protocols for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Saved recipes
alter table saved_recipes enable row level security;
create policy "Users can manage their own saved recipes" on saved_recipes for all using (auth.uid() = user_id);

-- User protocols
alter table user_protocols enable row level security;
create policy "Users can manage their own protocols" on user_protocols for all using (auth.uid() = user_id);

-- Newsletter (insert only for public, admin can read)
alter table newsletter_subscribers enable row level security;
create policy "Anyone can subscribe" on newsletter_subscribers for insert with check (true);
create policy "Admins can read subscribers" on newsletter_subscribers for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
