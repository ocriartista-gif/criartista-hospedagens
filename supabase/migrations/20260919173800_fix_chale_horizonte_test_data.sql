update accommodations
set
  beds = '1 cama queen',
  amenities = '["Wi-Fi","Ar-condicionado","Frigobar","Smart TV","Varanda"]'::jsonb
where slug = 'chale-horizonte';
