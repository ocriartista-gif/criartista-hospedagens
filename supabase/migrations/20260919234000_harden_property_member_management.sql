alter table property_members
  add column if not exists invited_by uuid references auth.users(id) on delete set null,
  add column if not exists invited_at timestamptz;

create index if not exists property_members_invited_by_idx
  on property_members(invited_by)
  where invited_by is not null;

create or replace function private.prevent_last_owner_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_other_owners integer;
begin
  if old.role = 'owner'
     and (
       tg_op = 'DELETE'
       or (tg_op = 'UPDATE' and new.role <> 'owner')
     )
  then
    select count(*)
      into v_other_owners
    from public.property_members pm
    where pm.property_id = old.property_id
      and pm.user_id <> old.user_id
      and pm.role = 'owner';

    if v_other_owners = 0 then
      raise exception 'A hospedagem precisa manter pelo menos um proprietário.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_last_owner_removal on property_members;

create trigger trg_prevent_last_owner_removal
before update or delete on property_members
for each row execute function private.prevent_last_owner_removal();
