create schema if not exists portfolio;

create table if not exists portfolio.projects (
  slug text primary key check (slug ~ '^[a-z][a-z0-9-]*$'),
  title text not null check (length(trim(title)) > 0),
  description text not null,
  thumbnail_key text not null,
  display_order integer not null check (display_order > 0),
  published boolean not null default false
);

-- El servidor recibe únicamente permiso de lectura sobre esta tabla.
do $role$
begin
  if not exists (select 1 from pg_roles where rolname = 'portfolio_catalog_reader') then
    create role portfolio_catalog_reader nologin;
  end if;
end;
$role$;
revoke all on schema portfolio from public;
grant usage on schema portfolio to portfolio_catalog_reader;
grant select on portfolio.projects to portfolio_catalog_reader;

insert into portfolio.projects (slug, title, description, thumbnail_key, display_order, published)
values
  ('museo', 'Museo', 'Diseño y desarrollo web para explorar un museo en formato digital.', 'museo', 10, true),
  ('personajes', 'Personajes 2D', 'Diseño de personajes, expresiones y animaciones para una aventura ilustrada.', 'personajes', 20, true),
  ('educa', 'EDUCA', 'Identidad visual y branding con referencias a la arquitectura de Sucre.', 'educa', 30, true)
on conflict (slug) do nothing;
