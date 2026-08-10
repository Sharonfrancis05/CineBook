
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";        -- fast fuzzy text search on titles

do $$ begin
    create type user_role as enum ('customer', 'admin');
    create type screen_type as enum ('Standard', 'Recliner', 'IMAX', '4DX');
    create type movie_status as enum ('now_showing', 'coming_soon', 'archived');
    create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'refunded');
    create type payment_method as enum ('card', 'upi', 'wallet');
    create type payment_status as enum ('success', 'failed', 'refunded', 'pending');
    create type coupon_type as enum ('percentage', 'fixed');
    create type notification_type as enum ('booking', 'offer', 'system', 'reminder');
    create type seat_tier as enum ('standard', 'premium', 'vip');
exception
    when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  avatar_url   text,
  role         user_role not null default 'customer',
  phone        text,
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.theatres (
  id bigserial primary key,
  name         text not null,
  city         text not null,
  address      text not null,
  contact_email text,
  contact_phone text,
  image_url    text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.screens (
  id bigserial primary key,
  theatre_id bigint not null references public.theatres(id) on delete cascade,
  name         text not null,
  type         screen_type not null default 'Standard',
  total_seats  int not null default 0,
  layout       jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.seats (
  id bigserial primary key,
  screen_id bigint not null references public.screens(id) on delete cascade,
  row_label    text not null,
  seat_number  int not null,
  tier         seat_tier not null default 'standard',
  is_active    boolean not null default true,
  unique (screen_id, row_label, seat_number)
);

create table if not exists public.movies (
  id bigserial primary key,
  title          text not null,
  synopsis       text,
  genres         text[] not null default '{}',
  language       text not null default 'English',
  duration_mins  int not null check (duration_mins > 0),
  rating         numeric(3,1) not null default 0 check (rating >= 0 and rating <= 10),
  total_reviews  int not null default 0,
  certificate    text check (certificate in ('U', 'UA', 'A', 'S')),
  release_date   date,
  poster_url     text,
  backdrop_url   text,
  trailer_url    text,
  cast_json      jsonb not null default '[]'::jsonb,
  status         movie_status not null default 'now_showing',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.shows (
  id bigserial primary key,
  movie_id bigint not null references public.movies(id) on delete cascade,
  screen_id bigint not null references public.screens(id) on delete cascade,
  theatre_id bigint not null references public.theatres(id) on delete cascade,
  show_date        date not null,
  show_time        time not null,
  price_standard   numeric(8,2) not null check (price_standard >= 0),
  price_premium    numeric(8,2) not null check (price_premium >= 0),
  price_vip        numeric(8,2) not null default 0 check (price_vip >= 0),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (screen_id, show_date, show_time)
);

create table if not exists public.coupons (
  id bigserial primary key,
  code           text not null unique,
  type           coupon_type not null,
  discount_value numeric(10,2) not null check (discount_value > 0),
  min_order_value numeric(10,2) default 0,
  max_discount   numeric(10,2),
  valid_from     timestamptz not null default now(),
  valid_until    timestamptz not null,
  usage_limit    int,
  used_count     int not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ---- bookings ---------------------------------------------------------------
create table if not exists public.bookings (
  id bigserial primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  show_id bigint not null references public.shows(id) on delete restrict,
  coupon_id bigint references public.coupons(id) on delete set null,
  subtotal       numeric(10,2) not null check (subtotal >= 0),
  discount_amount numeric(10,2) not null default 0 check (discount_amount >= 0),
  tax_amount     numeric(10,2) not null default 0 check (tax_amount >= 0),
  total_amount   numeric(10,2) not null check (total_amount >= 0),
  status         booking_status not null default 'pending',
  booking_code   text not null unique,
  ticket_url     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---- booking_seats ---------------------------------------------------------
create table if not exists public.booking_seats (
  id bigserial primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  show_id bigint not null references public.shows(id) on delete cascade,
  seat_id bigint not null references public.seats(id) on delete restrict,
  price        numeric(8,2) not null,
  created_at   timestamptz not null default now(),
  unique (show_id, seat_id)
);

-- ---- payments ---------------------------------------------------------------
create table if not exists public.payments (
  id bigserial primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  amount         numeric(10,2) not null,
  method         payment_method not null,
  status         payment_status not null default 'pending',
  provider_ref   text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---- reviews ----------------------------------------------------------------
create table if not exists public.reviews (
  id bigserial primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null references public.movies(id) on delete cascade,
  rating         int not null check (rating >= 1 and rating <= 10),
  comment        text,
  is_approved    boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, movie_id)
);

-- ---- favourites -------------------------------------------------------------
create table if not exists public.favourites (
  id bigserial primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null references public.movies(id) on delete cascade,
  created_at     timestamptz not null default now(),
  unique (user_id, movie_id)
);

-- ---- notifications ----------------------------------------------------------
create table if not exists public.notifications (
  id bigserial primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  message        text not null,
  type           notification_type not null default 'system',
  link_url       text,
  is_read        boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ---- admin_logs -------------------------------------------------------------
create table if not exists public.admin_logs (
  id bigserial primary key,
  admin_id       uuid not null references auth.users(id) on delete restrict,
  action         text not null,
  entity_type    text not null,
  entity_id bigint,
  metadata       jsonb,
  created_at     timestamptz not null default now()
);

-- =============================================================================
-- 3. INDEXES
-- =============================================================================
create index if not exists idx_movies_status        on public.movies(status);
create index if not exists idx_movies_title_trgm    on public.movies using gin (title gin_trgm_ops);
create index if not exists idx_shows_movie          on public.shows(movie_id);
create index if not exists idx_shows_theatre_date   on public.shows(theatre_id, show_date);
create index if not exists idx_bookings_user        on public.bookings(user_id);
create index if not exists idx_bookings_show        on public.bookings(show_id);
create index if not exists idx_booking_seats_show   on public.booking_seats(show_id);
create index if not exists idx_seats_screen         on public.seats(screen_id);
create index if not exists idx_reviews_movie        on public.reviews(movie_id);
create index if not exists idx_favourites_user      on public.favourites(user_id);
create index if not exists idx_notifications_user   on public.notifications(user_id, is_read);



insert into storage.buckets (id, name, public) values
  ('posters', 'posters', true),
  ('banners', 'banners', true),
  ('theatres', 'theatres', true),
  ('profiles', 'profiles', true),
  ('tickets', 'tickets', false)
on conflict (id) do nothing;

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Generic updated_at stamper
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists trg_movies_updated_at on public.movies;
create trigger trg_movies_updated_at before update on public.movies for each row execute procedure public.set_updated_at();
drop trigger if exists trg_theatres_updated_at on public.theatres;
create trigger trg_theatres_updated_at before update on public.theatres for each row execute procedure public.set_updated_at();
drop trigger if exists trg_screens_updated_at on public.screens;
create trigger trg_screens_updated_at before update on public.screens for each row execute procedure public.set_updated_at();
drop trigger if exists trg_shows_updated_at on public.shows;
create trigger trg_shows_updated_at before update on public.shows for each row execute procedure public.set_updated_at();
drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at before update on public.bookings for each row execute procedure public.set_updated_at();
drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at before update on public.payments for each row execute procedure public.set_updated_at();

-- Auto-update movie ratings
create or replace function public.update_movie_rating() returns trigger as $$
declare
  v_avg_rating numeric;
  v_total_reviews int;
begin
  select coalesce(round(avg(rating)::numeric, 1), 0), count(*)
  into v_avg_rating, v_total_reviews
  from public.reviews
  where movie_id = coalesce(new.movie_id, old.movie_id) and is_approved = true;

  update public.movies
  set rating = v_avg_rating, total_reviews = v_total_reviews
  where id = coalesce(new.movie_id, old.movie_id);

  return null; -- After trigger doesn't need to return new
end;
$$ language plpgsql security definer;

drop trigger if exists trg_update_movie_rating on public.reviews;
create trigger trg_update_movie_rating after insert or update or delete on public.reviews
  for each row execute procedure public.update_movie_rating();


-- Atomic Booking Transaction (Overhauled for real seats and coupons)
create or replace function public.book_seats(
  p_show_id bigint,
  p_seat_ids bigint[],
  p_coupon_code text default null
) returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking public.bookings;
  v_seat_id bigint;
  v_seat_record record;
  v_price numeric;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_tax numeric := 0;
  v_total numeric := 0;
  v_coupon record;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if array_length(p_seat_ids, 1) is null then raise exception 'No seats supplied'; end if;

  -- 1. Calculate Subtotal and validate seats
  foreach v_seat_id in array p_seat_ids loop
    select s.tier, sh.price_standard, sh.price_premium, sh.price_vip 
    into v_seat_record
    from public.seats s
    join public.shows sh on sh.screen_id = s.screen_id
    where s.id = v_seat_id and sh.id = p_show_id;
    
    if not found then raise exception 'Invalid seat % for this show', v_seat_id; end if;
    
    if v_seat_record.tier = 'standard' then v_price := v_seat_record.price_standard;
    elsif v_seat_record.tier = 'premium' then v_price := v_seat_record.price_premium;
    else v_price := v_seat_record.price_vip; end if;
    
    v_subtotal := v_subtotal + v_price;
  end loop;

  -- 2. Process Coupon
  if p_coupon_code is null or p_coupon_code = '' then
    v_discount := 0;
  else
    select * into v_coupon from public.coupons 
    where code = p_coupon_code and is_active = true and valid_from <= now() and valid_until >= now();
    
    if not found then raise exception 'Invalid or expired coupon'; end if;
    if v_coupon.min_order_value > v_subtotal then raise exception 'Minimum order value not met'; end if;
    if v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit then raise exception 'Coupon limit reached'; end if;
    
    if v_coupon.type = 'percentage' then
      v_discount := v_subtotal * (v_coupon.discount_value / 100);
      if v_coupon.max_discount is not null and v_discount > v_coupon.max_discount then v_discount := v_coupon.max_discount; end if;
    else
      v_discount := v_coupon.discount_value;
    end if;
    
    if v_discount > v_subtotal then v_discount := v_subtotal; end if;
    
    -- Increment coupon usage
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  -- 3. Calculate Final Amounts (Assuming 18% Tax)
  v_tax := (v_subtotal - v_discount) * 0.18;
  v_total := (v_subtotal - v_discount) + v_tax;

  -- 4. Create Booking
  declare
    v_inserted_coupon_id bigint := null;
  begin
    if p_coupon_code is not null and p_coupon_code != '' then
      v_inserted_coupon_id := v_coupon.id;
    end if;

    insert into public.bookings (user_id, show_id, coupon_id, subtotal, discount_amount, tax_amount, total_amount, booking_code, status)
    values (v_user_id, p_show_id, v_inserted_coupon_id, v_subtotal, v_discount, v_tax, v_total, upper(substr(md5(random()::text), 1, 7)), 'confirmed')
    returning * into v_booking;
  end;

  -- 5. Insert Seats (This triggers unique constraint if already booked!)
  foreach v_seat_id in array p_seat_ids loop
    -- Re-fetch price for insert
    select s.tier, sh.price_standard, sh.price_premium, sh.price_vip into v_seat_record from public.seats s join public.shows sh on sh.screen_id = s.screen_id where s.id = v_seat_id and sh.id = p_show_id;
    if v_seat_record.tier = 'standard' then v_price := v_seat_record.price_standard; elsif v_seat_record.tier = 'premium' then v_price := v_seat_record.price_premium; else v_price := v_seat_record.price_vip; end if;
    
    insert into public.booking_seats (booking_id, show_id, seat_id, price)
    values (v_booking.id, p_show_id, v_seat_id, v_price);
  end loop;

  -- 6. Send Notification
  insert into public.notifications (user_id, title, message, type)
  values (v_user_id, 'Booking Confirmed', 'Your booking for ' || v_booking.booking_code || ' is confirmed!', 'booking');

  return v_booking;
end;
$$;


-- =============================================================================
-- 6. VIEWS
-- =============================================================================

create or replace view public.seat_status as
select
  sh.id as show_id,
  s.id as seat_id,
  s.row_label,
  s.seat_number,
  s.tier,
  case when bs.id is not null then 'booked' else 'available' end as status
from public.shows sh
join public.seats s on s.screen_id = sh.screen_id
left join public.bookings b on b.show_id = sh.id and b.status = 'confirmed'
left join public.booking_seats bs on bs.seat_id = s.id and bs.booking_id = b.id
where s.is_active = true;

create or replace view public.revenue_analytics as
select
  date_trunc('day', created_at)::date as day,
  sum(total_amount) as revenue,
  count(*) as bookings,
  sum(discount_amount) as discounts_given
from public.bookings
where status = 'confirmed'
group by 1 order by 1 desc;

create or replace view public.top_movies as
select
  m.id as movie_id,
  m.title,
  m.rating,
  sum(bk.total_amount) as revenue,
  count(distinct bk.id) as tickets_sold
from public.movies m
join public.shows sh on sh.movie_id = m.id
join public.bookings bk on bk.show_id = sh.id and bk.status = 'confirmed'
group by m.id, m.title, m.rating
order by revenue desc;


-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.theatres enable row level security;
alter table public.screens enable row level security;
alter table public.seats enable row level security;
alter table public.movies enable row level security;
alter table public.shows enable row level security;
alter table public.coupons enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_seats enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.favourites enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_logs enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Admins can do everything
drop policy if exists "admin_all_profiles" on public.profiles;
create policy "admin_all_profiles" on public.profiles for all using (public.is_admin());
drop policy if exists "admin_all_theatres" on public.theatres;
create policy "admin_all_theatres" on public.theatres for all using (public.is_admin());
drop policy if exists "admin_all_screens" on public.screens;
create policy "admin_all_screens" on public.screens for all using (public.is_admin());
drop policy if exists "admin_all_seats" on public.seats;
create policy "admin_all_seats" on public.seats for all using (public.is_admin());
drop policy if exists "admin_all_movies" on public.movies;
create policy "admin_all_movies" on public.movies for all using (public.is_admin());
drop policy if exists "admin_all_shows" on public.shows;
create policy "admin_all_shows" on public.shows for all using (public.is_admin());
drop policy if exists "admin_all_coupons" on public.coupons;
create policy "admin_all_coupons" on public.coupons for all using (public.is_admin());
drop policy if exists "admin_all_bookings" on public.bookings;
create policy "admin_all_bookings" on public.bookings for all using (public.is_admin());
drop policy if exists "admin_all_payments" on public.payments;
create policy "admin_all_payments" on public.payments for all using (public.is_admin());
drop policy if exists "admin_all_reviews" on public.reviews;
create policy "admin_all_reviews" on public.reviews for all using (public.is_admin());
drop policy if exists "admin_all_logs" on public.admin_logs;
create policy "admin_all_logs" on public.admin_logs for all using (public.is_admin());

-- Customers policies
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

drop policy if exists "public_read_theatres" on public.theatres;
create policy "public_read_theatres" on public.theatres for select using (is_active = true);
drop policy if exists "public_read_screens" on public.screens;
create policy "public_read_screens" on public.screens for select using (true);
drop policy if exists "public_read_seats" on public.seats;
create policy "public_read_seats" on public.seats for select using (is_active = true);
drop policy if exists "public_read_movies" on public.movies;
create policy "public_read_movies" on public.movies for select using (status != 'archived');
drop policy if exists "public_read_shows" on public.shows;
create policy "public_read_shows" on public.shows for select using (is_active = true);
drop policy if exists "public_read_reviews" on public.reviews;
create policy "public_read_reviews" on public.reviews for select using (is_approved = true);

drop policy if exists "auth_insert_reviews" on public.reviews;
create policy "auth_insert_reviews" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "auth_update_reviews" on public.reviews;
create policy "auth_update_reviews" on public.reviews for update using (auth.uid() = user_id);
drop policy if exists "auth_delete_reviews" on public.reviews;
create policy "auth_delete_reviews" on public.reviews for delete using (auth.uid() = user_id);

drop policy if exists "fav_select_self" on public.favourites;
create policy "fav_select_self" on public.favourites for select using (auth.uid() = user_id);
drop policy if exists "fav_insert_self" on public.favourites;
create policy "fav_insert_self" on public.favourites for insert with check (auth.uid() = user_id);
drop policy if exists "fav_delete_self" on public.favourites;
create policy "fav_delete_self" on public.favourites for delete using (auth.uid() = user_id);

drop policy if exists "notif_select_self" on public.notifications;
create policy "notif_select_self" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "notif_update_self" on public.notifications;
create policy "notif_update_self" on public.notifications for update using (auth.uid() = user_id);

drop policy if exists "bookings_select_self" on public.bookings;
create policy "bookings_select_self" on public.bookings for select using (auth.uid() = user_id);
drop policy if exists "payments_select_self" on public.payments;
create policy "payments_select_self" on public.payments for select using (auth.uid() = user_id);
drop policy if exists "booking_seats_public_read" on public.booking_seats;
create policy "booking_seats_public_read" on public.booking_seats for select using (true); -- needed for seat map

-- =============================================================================
-- 8. REALTIME
-- =============================================================================
do $$
begin
    alter publication supabase_realtime add table public.booking_seats;
exception
    when duplicate_object then null;
end $$;
do $$
begin
    alter publication supabase_realtime add table public.notifications;
exception
    when duplicate_object then null;
end $$;

-- =============================================================================
-- 9. SEED DATA
-- =============================================================================
do $$
declare
  v_theatre_id bigint := 1;
  v_screen_id bigint := 1;
  v_movie_id bigint := 1;
  r int;
  s int;
  row_char text;
  v_tier seat_tier;
begin
  insert into public.theatres (id, name, city, address) values (v_theatre_id, 'CineBook Grand', 'Mumbai', 'Andheri West') on conflict do nothing;
  insert into public.screens (id, theatre_id, name, type, total_seats) values (v_screen_id, v_theatre_id, 'Screen 1', 'Standard', 60) on conflict do nothing;
  
  -- Generate 60 seats (A-E, 1-12)
  for r in 1..5 loop
    row_char := chr(64 + r); -- A, B, C...
    v_tier := case when r > 3 then 'premium'::seat_tier else 'standard'::seat_tier end;
    for s in 1..12 loop
      insert into public.seats (screen_id, row_label, seat_number, tier) values (v_screen_id, row_char, s, v_tier) on conflict do nothing;
    end loop;
  end loop;

  insert into public.movies (id, title, synopsis, duration_mins, rating, release_date) 
  values (v_movie_id, 'Inception', 'A thief who steals corporate secrets.', 148, 8.8, '2010-07-16') on conflict do nothing;

  insert into public.shows (movie_id, screen_id, theatre_id, show_date, show_time, price_standard, price_premium)
  values (v_movie_id, v_screen_id, v_theatre_id, current_date + interval '1 day', '19:00:00', 250, 400) on conflict do nothing;
  
  insert into public.coupons (code, type, discount_value, min_order_value, valid_until)
  values ('WELCOME50', 'fixed', 50, 300, now() + interval '30 days') on conflict do nothing;
end $$;

-- =============================================================================
-- End of Expanded Schema
-- =============================================================================
