-- Units indexes for metrics performance
create index if not exists units_status_idx      on public.units (status);
create index if not exists units_published_at_idx on public.units ("publishedAt");
create index if not exists units_created_at_idx   on public.units ("createdAt");

-- Events indexes for metrics performance
create index if not exists events_unit_created_idx on public.events ("unitId","createdAt");
create index if not exists events_created_idx      on public.events ("createdAt");
create index if not exists events_ts_idx           on public.events ("ts");
