-- Migração: Criação da tabela de sinalizações de auditoria (audit_flags)
-- Tabela para persistir os problemas apontados por docentes e administradores

create table if not exists public.audit_flags (
  id uuid primary key default gen_random_uuid(),
  id_prova text not null,               -- Identificador da prova, ex: '2024_CCP', '2021_ADS'
  id_questao text not null,             -- Identificador da questão, ex: 'q01', 'qd02'
  reasons text[] not null default '{}', -- Motivos selecionados pelo usuário
  note text,                            -- Observação descritiva opcional
  reported_from text default 'docente', -- Origem: 'docente' ou 'admin'
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),

  constraint unique_prova_questao unique (id_prova, id_questao)
);

-- Índices para consultas de alta performance
create index if not exists idx_audit_flags_prova_questao on public.audit_flags(id_prova, id_questao);
create index if not exists idx_audit_flags_created_at on public.audit_flags(created_at desc);

-- Habilitar Row Level Security (RLS)
alter table public.audit_flags enable row level security;

-- Políticas de acesso para a chave Anon pública
drop policy if exists "Permitir leitura pública de sinalizações" on public.audit_flags;
create policy "Permitir leitura pública de sinalizações"
  on public.audit_flags for select
  using (true);

drop policy if exists "Permitir inserção e atualização de sinalizações" on public.audit_flags;
create policy "Permitir inserção e atualização de sinalizações"
  on public.audit_flags for insert
  with check (true);

drop policy if exists "Permitir atualização de sinalizações" on public.audit_flags;
create policy "Permitir atualização de sinalizações"
  on public.audit_flags for update
  using (true);

drop policy if exists "Permitir remoção de sinalizações" on public.audit_flags;
create policy "Permitir remoção de sinalizações"
  on public.audit_flags for delete
  using (true);
