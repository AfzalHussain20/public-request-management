-- Load verified geographic master data from CSV templates.
-- 1. Replace template headers with verified data from official sources.
-- 2. Run from the project root:
--      psql "<connection string>" -f supabase/seed-data/load.sql
-- 3. `source` and `source_version` must record the official source of the data.
-- Administrative geography and election geography are loaded independently.

begin;

create temp table tmp_districts (
  code text primary key, name_en text, name_ta text,
  source text, source_version text, effective_from date, effective_to date
);
\copy tmp_districts from 'supabase/seed-data/districts.csv' with (format csv, header true)
insert into public.districts (code, name_en, name_ta, source, source_version, effective_from, effective_to)
select code, name_en, name_ta, source, source_version, effective_from, effective_to from tmp_districts
on conflict (code) do update set name_en = excluded.name_en, name_ta = excluded.name_ta;

create temp table tmp_taluks (
  district_code text, code text primary key, name_en text, name_ta text,
  source text, source_version text, effective_from date, effective_to date
);
\copy tmp_taluks from 'supabase/seed-data/taluks.csv' with (format csv, header true)
insert into public.taluks (district_id, code, name_en, name_ta, source, source_version, effective_from, effective_to)
select d.id, t.code, t.name_en, t.name_ta, t.source, t.source_version, t.effective_from, t.effective_to
from tmp_taluks t join public.districts d on d.code = t.district_code
on conflict (code) do update set name_en = excluded.name_en, name_ta = excluded.name_ta;

create temp table tmp_lb_types (code text primary key, name_en text, name_ta text);
\copy tmp_lb_types from 'supabase/seed-data/local_body_types.csv' with (format csv, header true)
insert into public.local_body_types (code, name_en, name_ta)
select code, name_en, name_ta from tmp_lb_types
on conflict (code) do update set name_en = excluded.name_en, name_ta = excluded.name_ta;

create temp table tmp_local_bodies (
  district_code text, local_body_type_code text, code text primary key, name_en text, name_ta text,
  source text, source_version text, effective_from date, effective_to date
);
\copy tmp_local_bodies from 'supabase/seed-data/local_bodies.csv' with (format csv, header true)
insert into public.local_bodies (district_id, local_body_type_id, code, name_en, name_ta, source, source_version, effective_from, effective_to)
select d.id, t.id, lb.code, lb.name_en, lb.name_ta, lb.source, lb.source_version, lb.effective_from, lb.effective_to
from tmp_local_bodies lb
join public.districts d on d.code = lb.district_code
join public.local_body_types t on t.code = lb.local_body_type_code
on conflict (code) do update set name_en = excluded.name_en, name_ta = excluded.name_ta;

create temp table tmp_wards (
  local_body_code text, code text primary key, name_en text, name_ta text,
  source text, source_version text, effective_from date, effective_to date
);
\copy tmp_wards from 'supabase/seed-data/wards.csv' with (format csv, header true)
insert into public.wards (local_body_id, code, name_en, name_ta, source, source_version, effective_from, effective_to)
select lb.id, w.code, w.name_en, w.name_ta, w.source, w.source_version, w.effective_from, w.effective_to
from tmp_wards w join public.local_bodies lb on lb.code = w.local_body_code
on conflict (code) do update set name_en = excluded.name_en, name_ta = excluded.name_ta;

create temp table tmp_ac (
  code text primary key, name_en text, name_ta text,
  source text, source_version text, effective_from date, effective_to date
);
\copy tmp_ac from 'supabase/seed-data/assembly_constituencies.csv' with (format csv, header true)
insert into public.assembly_constituencies (code, name_en, name_ta, source, source_version, effective_from, effective_to)
select code, name_en, name_ta, source, source_version, effective_from, effective_to from tmp_ac
on conflict (code) do update set name_en = excluded.name_en, name_ta = excluded.name_ta;

create temp table tmp_pc (
  code text primary key, name_en text, name_ta text,
  source text, source_version text, effective_from date, effective_to date
);
\copy tmp_pc from 'supabase/seed-data/parliament_constituencies.csv' with (format csv, header true)
insert into public.parliament_constituencies (code, name_en, name_ta, source, source_version, effective_from, effective_to)
select code, name_en, name_ta, source, source_version, effective_from, effective_to from tmp_pc
on conflict (code) do update set name_en = excluded.name_en, name_ta = excluded.name_ta;

create temp table tmp_apm (
  assembly_code text, parliament_code text, effective_from date, effective_to date,
  source text, source_version text
);
\copy tmp_apm from 'supabase/seed-data/assembly_parliament_mapping.csv' with (format csv, header true)
insert into public.assembly_parliament_mapping (assembly_constituency_id, parliament_constituency_id, effective_from, effective_to, source, source_version)
select ac.id, pc.id, m.effective_from, m.effective_to, m.source, m.source_version
from tmp_apm m
join public.assembly_constituencies ac on ac.code = m.assembly_code
join public.parliament_constituencies pc on pc.code = m.parliament_code
on conflict (assembly_constituency_id) do update set parliament_constituency_id = excluded.parliament_constituency_id;

commit;
