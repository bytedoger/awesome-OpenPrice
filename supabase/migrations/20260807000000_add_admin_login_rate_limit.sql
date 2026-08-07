create table if not exists public.admin_login_rate_limits (
  identifier_hash text primary key,
  attempt_count integer not null check (attempt_count > 0),
  window_started_at timestamptz not null,
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.admin_login_rate_limits enable row level security;

revoke all on table public.admin_login_rate_limits from public, anon, authenticated;

create or replace function public.consume_admin_login_attempt(
  p_identifier_hash text,
  p_limit integer,
  p_window_seconds integer,
  p_block_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_state public.admin_login_rate_limits%rowtype;
  v_next_count integer;
begin
  if p_identifier_hash is null
     or length(p_identifier_hash) <> 64
     or p_limit < 1
     or p_window_seconds < 1
     or p_block_seconds < 1 then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_identifier_hash, 0));

  delete from public.admin_login_rate_limits
   where identifier_hash in (
     select identifier_hash
       from public.admin_login_rate_limits
      where updated_at < v_now - interval '1 day'
      limit 100
   );

  select *
    into v_state
    from public.admin_login_rate_limits
   where identifier_hash = p_identifier_hash
   for update;

  if found and v_state.blocked_until > v_now then
    return false;
  end if;

  if not found
     or v_state.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds) then
    insert into public.admin_login_rate_limits (
      identifier_hash,
      attempt_count,
      window_started_at,
      blocked_until,
      updated_at
    ) values (
      p_identifier_hash,
      1,
      v_now,
      null,
      v_now
    )
    on conflict (identifier_hash) do update set
      attempt_count = excluded.attempt_count,
      window_started_at = excluded.window_started_at,
      blocked_until = excluded.blocked_until,
      updated_at = excluded.updated_at;

    return true;
  end if;

  v_next_count := v_state.attempt_count + 1;

  update public.admin_login_rate_limits
     set attempt_count = v_next_count,
         blocked_until = case
           when v_next_count > p_limit
             then v_now + pg_catalog.make_interval(secs => p_block_seconds)
           else null
         end,
         updated_at = v_now
   where identifier_hash = p_identifier_hash;

  return v_next_count <= p_limit;
end;
$$;

create or replace function public.reset_admin_login_attempts(p_identifier_hash text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.admin_login_rate_limits
   where identifier_hash = p_identifier_hash;
$$;

revoke all on function public.consume_admin_login_attempt(text, integer, integer, integer)
  from public, anon, authenticated;
revoke all on function public.reset_admin_login_attempts(text)
  from public, anon, authenticated;

grant execute on function public.consume_admin_login_attempt(text, integer, integer, integer)
  to service_role;
grant execute on function public.reset_admin_login_attempts(text)
  to service_role;
