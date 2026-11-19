create table if not exists portfolio.analytics_events (
  id uuid primary key,
  kind text not null,
  target text not null,
  created_at timestamptz not null default now(),
  constraint analytics_event_allowed check (
    (kind = 'page_view' and target = 'portfolio')
    or (kind = 'contact_click' and target in ('whatsapp', 'instagram', 'email', 'linkedin'))
  )
);

create index if not exists analytics_events_created_at_idx
  on portfolio.analytics_events (created_at);

-- El rol de conexión alojado se provisiona fuera de las migraciones.
do $grant$
begin
  if exists (select 1 from pg_roles where rolname = 'portfolio_web') then
    grant select on portfolio.analytics_events to portfolio_web;
    grant insert (id, kind, target) on portfolio.analytics_events to portfolio_web;
  end if;
end;
$grant$;
