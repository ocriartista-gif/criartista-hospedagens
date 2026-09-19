insert into property_members (property_id, user_id, role)
select p.id, 'ce71778d-d225-4876-be69-61e7cb992191'::uuid, 'owner'
from properties p
where p.slug = 'villa-ipe'
on conflict (property_id, user_id)
do update set role = excluded.role;
