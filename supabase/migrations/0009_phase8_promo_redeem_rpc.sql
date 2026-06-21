create or replace function redeem_promo_code(promo_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count int;
begin
  update promo_codes
  set
    used_count = used_count + 1,
    updated_at = now()
  where id = promo_id
    and active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
    and (usage_limit is null or used_count < usage_limit);

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;
