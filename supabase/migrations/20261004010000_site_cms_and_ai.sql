-- ==============================================================================
-- Migration: CMS Dinâmico do Site (site_settings, content_blocks, media, content_versions)
-- Bucket público site-media e Seed inicial de todo o conteúdo do site
-- ==============================================================================

-- 1. Tabela site_settings
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  secao text not null,
  chave text not null,
  valor jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_secao_chave_unique unique (secao, chave)
);

grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to authenticated, service_role;
alter table public.site_settings enable row level security;

create policy "Leitura pública de configurações"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admin gerencia configurações"
  on public.site_settings for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 2. Tabela content_blocks
create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  pagina text not null,
  secao text not null,
  chave text not null,
  tipo text not null default 'text',
  valor jsonb not null,
  ordem int not null default 0,
  visivel boolean not null default true,
  status text not null default 'publicado' check (status in ('rascunho', 'publicado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_blocks_pagina_secao_chave_unique unique (pagina, secao, chave)
);

grant select on public.content_blocks to anon, authenticated;
grant all on public.content_blocks to authenticated, service_role;
alter table public.content_blocks enable row level security;

create policy "Público lê blocos publicados"
  on public.content_blocks for select
  to anon, authenticated
  using (status = 'publicado' and visivel = true);

create policy "Admin lê todos os blocos"
  on public.content_blocks for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admin gerencia blocos"
  on public.content_blocks for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 3. Tabela media
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  alt text,
  tamanho int,
  tipo text,
  criado_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);

grant select on public.media to anon, authenticated;
grant all on public.media to authenticated, service_role;
alter table public.media enable row level security;

create policy "Público visualiza mídias"
  on public.media for select
  to anon, authenticated
  using (true);

create policy "Admin gerencia mídias"
  on public.media for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 4. Tabela content_versions (histórico)
create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_block_id uuid references public.content_blocks(id) on delete cascade,
  valor jsonb not null,
  status text not null default 'publicado',
  alterado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.content_versions to authenticated;
grant all on public.content_versions to service_role;
alter table public.content_versions enable row level security;

create policy "Admin lê histórico de versões"
  on public.content_versions for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admin gerencia histórico de versões"
  on public.content_versions for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Triggers de atualização de data e versionamento automático
create or replace function public.atualizar_cms_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.atualizar_cms_updated_at();

drop trigger if exists trg_content_blocks_updated_at on public.content_blocks;
create trigger trg_content_blocks_updated_at
before update on public.content_blocks
for each row execute function public.atualizar_cms_updated_at();

create or replace function public.salvar_versao_conteudo()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.content_versions (content_block_id, valor, status, alterado_por)
  values (new.id, new.valor, new.status, auth.uid());
  return new;
end;
$$;

drop trigger if exists trg_content_blocks_versionar on public.content_blocks;
create trigger trg_content_blocks_versionar
after insert or update on public.content_blocks
for each row execute function public.salvar_versao_conteudo();

-- 5. Bucket público site-media
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Público acessa arquivos do site-media" on storage.objects;
create policy "Público acessa arquivos do site-media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-media');

drop policy if exists "Admin faz upload no site-media" on storage.objects;
create policy "Admin faz upload no site-media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admin atualiza arquivos no site-media" on storage.objects;
create policy "Admin atualiza arquivos no site-media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admin remove arquivos no site-media" on storage.objects;
create policy "Admin remove arquivos no site-media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));

-- ==============================================================================
-- 6. SEED INICIAL: Gravando todo o conteúdo atual do site
-- ==============================================================================

-- A) SITE SETTINGS
insert into public.site_settings (secao, chave, valor) values
('identidade', 'geral', $${
  "nome": "Dra. Helena Duarte",
  "titulo": "Psicóloga Clínica",
  "crp": "CRP 00/00000",
  "foto": "/helena-duarte.webp",
  "foto_consultorio": "/consultorio.jpg",
  "cidade": "Lucas do Rio Verde/MT",
  "endereco": "Av. Exemplo, 1000 – Sala 00, Centro, Lucas do Rio Verde/MT"
}$$::jsonb),

('cores', 'paleta', $${
  "nome": "Luxury Editorial",
  "charcoal": "#1F1F21",
  "ivory": "#F7F4ED",
  "gold": "#C5A25D",
  "wine": "#5C2A3A",
  "smoke": "#A29C92"
}$$::jsonb),

('fontes', 'tipografia', $${
  "display": "Fraunces, serif",
  "sans": "Nunito Sans, sans-serif"
}$$::jsonb),

('contato', 'dados', $${
  "telefone": "(65) 90000-0000",
  "whatsapp": "5565900000000",
  "email": "contato@exemplo.com",
  "endereco": "Av. Exemplo, 1000 – Sala 00, Centro, Lucas do Rio Verde/MT",
  "cidade": "Lucas do Rio Verde/MT",
  "horario": "Segunda a sexta, das 8h às 18h"
}$$::jsonb),

('redes', 'links', $${
  "instagram": "https://instagram.com/drahelenaduarte",
  "whatsapp": "https://wa.me/5565900000000"
}$$::jsonb),

('seo', 'metadados', $${
  "titulo_padrao": "Dra. Helena Duarte – Psicóloga Clínica",
  "descricao_padrao": "Psicoterapia com acolhimento e ética para ansiedade, depressão, luto e relacionamentos. Atendimento presencial em Lucas do Rio Verde/MT e online.",
  "og_image": "/helena-duarte.webp",
  "keywords": ["Psicologia", "Psicoterapia", "Terapia Online", "Ansiedade", "Lucas do Rio Verde", "Dra. Helena Duarte"]
}$$::jsonb),

('menu', 'navegacao', $${
  "itens": [
    {"to": "/", "label": "Início"},
    {"to": "/sobre", "label": "Sobre"},
    {"to": "/especialidades", "label": "Especialidades"},
    {"to": "/blog", "label": "Blog"},
    {"to": "/contato", "label": "Contato"}
  ],
  "cta": {"to": "/agendar", "label": "Agendar consulta"}
}$$::jsonb),

('rodape', 'configuracoes', $${
  "texto_sobre": "Atendimento presencial em Lucas do Rio Verde/MT e online para todo o Brasil.",
  "crp": "CRP 00/00000",
  "direitos": "Dra. Helena Duarte. Todos os direitos reservados."
}$$::jsonb),

('agendamento', 'regras', $${
  "duracao_min": 50,
  "modalidades": ["presencial", "online"],
  "aviso_reagendamento": "Remarcações com pelo menos 24 horas de antecedência.",
  "reembolso_plano": "Atendimentos particulares com emissão de recibo para solicitação de reembolso."
}$$::jsonb),

('avisos', 'notas', $${
  "demonstrativo": "Projeto demonstrativo – dados fictícios",
  "emergencia": "Em caso de crise, ligue 188 (CVV) ou 192 (SAMU)."
}$$::jsonb)

on conflict (secao, chave) do update set
  valor = excluded.valor,
  updated_at = now();


-- B) CONTENT BLOCKS (Textos das páginas)
insert into public.content_blocks (pagina, secao, chave, tipo, valor, ordem, visivel, status) values

-- PÁGINA INÍCIO
('inicio', 'hero', 'badge', 'text', $${"texto": "Psicóloga Clínica · CRP 00/00000"}$$::jsonb, 1, true, 'publicado'),
('inicio', 'hero', 'titulo', 'text', $${"texto": "Um espaço seguro para você se escutar."}$$::jsonb, 2, true, 'publicado'),
('inicio', 'hero', 'subtitulo', 'text', $${"texto": "Psicoterapia com acolhimento e ética, presencial em Lucas do Rio Verde/MT ou online, onde você estiver."}$$::jsonb, 3, true, 'publicado'),
('inicio', 'hero', 'cta_primario', 'json', $${"label": "Agendar consulta", "link": "/agendar"}$$::jsonb, 4, true, 'publicado'),
('inicio', 'hero', 'cta_secundario', 'json', $${"label": "Como posso ajudar", "link": "/especialidades"}$$::jsonb, 5, true, 'publicado'),

('inicio', 'sobre_resumo', 'eyebrow', 'text', $${"texto": "Sobre"}$$::jsonb, 10, true, 'publicado'),
('inicio', 'sobre_resumo', 'titulo', 'text', $${"texto": "Olá, eu sou a Helena Duarte."}$$::jsonb, 11, true, 'publicado'),
('inicio', 'sobre_resumo', 'texto', 'text', $${"texto": "Sou psicóloga clínica há mais de 10 anos e acredito que a terapia é um encontro: um lugar onde você pode ser quem é, sem julgamentos. Trabalho com a abordagem cognitivo-comportamental integrada a práticas de atenção plena."}$$::jsonb, 12, true, 'publicado'),
('inicio', 'sobre_resumo', 'link_texto', 'text', $${"texto": "Conheça minha trajetória →"}$$::jsonb, 13, true, 'publicado'),

('inicio', 'como_funciona', 'eyebrow', 'text', $${"texto": "Como funciona"}$$::jsonb, 20, true, 'publicado'),
('inicio', 'como_funciona', 'titulo', 'text', $${"texto": "Três passos simples"}$$::jsonb, 21, true, 'publicado'),
('inicio', 'como_funciona', 'passos', 'json', $$[
  {"n": "01", "titulo": "Agende", "texto": "Escolha um horário livre no formulário ou fale pelo WhatsApp."},
  {"n": "02", "titulo": "Primeira conversa", "texto": "Nos conhecemos, entendemos sua demanda e combinamos o formato."},
  {"n": "03", "titulo": "Acompanhamento", "texto": "Sessões semanais de 50 minutos, presenciais ou online."}
]$$::jsonb, 22, true, 'publicado'),

('inicio', 'depoimentos', 'eyebrow', 'text', $${"texto": "Depoimentos"}$$::jsonb, 30, true, 'publicado'),
('inicio', 'depoimentos', 'titulo', 'text', $${"texto": "O que dizem os pacientes"}$$::jsonb, 31, true, 'publicado'),
('inicio', 'depoimentos', 'aviso', 'text', $${"texto": "Depoimentos fictícios, publicados com iniciais para preservar o sigilo."}$$::jsonb, 32, true, 'publicado'),

('inicio', 'faq', 'eyebrow', 'text', $${"texto": "Dúvidas frequentes"}$$::jsonb, 40, true, 'publicado'),
('inicio', 'faq', 'titulo', 'text', $${"texto": "Perguntas frequentes"}$$::jsonb, 41, true, 'publicado'),
('inicio', 'faq', 'itens', 'json', $$[
  {"p": "Quanto tempo dura cada sessão?", "r": "As sessões têm duração de 50 minutos, geralmente com frequência semanal."},
  {"p": "O atendimento online é tão eficaz quanto o presencial?", "r": "Sim. O atendimento online é regulamentado pelo Conselho Federal de Psicologia e apresenta resultados semelhantes ao presencial."},
  {"p": "Vocês atendem por convênio?", "r": "Os atendimentos são particulares. Emitimos recibo para solicitação de reembolso junto ao seu plano de saúde."},
  {"p": "O que é dito na terapia é sigiloso?", "r": "Sim. O sigilo é um princípio ético da Psicologia e é garantido em todos os atendimentos."},
  {"p": "Como faço para remarcar uma sessão?", "r": "Basta avisar com pelo menos 24 horas de antecedência pelo WhatsApp ou e-mail."}
]$$::jsonb, 42, true, 'publicado'),

('inicio', 'cta_final', 'titulo', 'text', $${"texto": "Dar o primeiro passo é um ato de cuidado."}$$::jsonb, 50, true, 'publicado'),
('inicio', 'cta_final', 'subtitulo', 'text', $${"texto": "Escolha um horário livre e solicite sua primeira consulta, presencial ou online."}$$::jsonb, 51, true, 'publicado'),
('inicio', 'cta_final', 'botao_agendar', 'text', $${"texto": "Agendar consulta"}$$::jsonb, 52, true, 'publicado'),
('inicio', 'cta_final', 'botao_whatsapp', 'text', $${"texto": "Falar no WhatsApp"}$$::jsonb, 53, true, 'publicado'),

-- PÁGINA SOBRE
('sobre', 'header', 'eyebrow', 'text', $${"texto": "Sobre"}$$::jsonb, 1, true, 'publicado'),
('sobre', 'header', 'titulo', 'text', $${"texto": "Psicologia com escuta, ciência e afeto"}$$::jsonb, 2, true, 'publicado'),
('sobre', 'bio', 'paragrafos', 'json', $$[
  "Comecei na Psicologia movida pela curiosidade sobre o que nos faz sofrer e, principalmente, sobre o que nos ajuda a seguir. Ao longo de mais de uma década de clínica, aprendi que cada pessoa traz um caminho único — e que o cuidado precisa respeitar isso.",
  "Minha abordagem principal é a Terapia Cognitivo-Comportamental (TCC), integrada a práticas de atenção plena. Trabalho de forma colaborativa: construímos juntos objetivos, compreensões e estratégias para o seu dia a dia.",
  "Atendo adolescentes a partir de 16 anos e adultos, presencialmente em Lucas do Rio Verde/MT e online para todo o Brasil."
]$$::jsonb, 3, true, 'publicado'),
('sobre', 'formacao', 'titulo', 'text', $${"texto": "Formação"}$$::jsonb, 4, true, 'publicado'),
('sobre', 'formacao', 'itens', 'json', $$[
  "Graduação em Psicologia – Universidade Fictícia (2013)",
  "Especialização em Terapia Cognitivo-Comportamental (2016)",
  "Formação em Mindfulness e Terapias Contextuais (2019)",
  "Aperfeiçoamento em Luto e Perdas (2021)"
]$$::jsonb, 5, true, 'publicado'),

-- PÁGINA ESPECIALIDADES
('especialidades', 'header', 'eyebrow', 'text', $${"texto": "Especialidades"}$$::jsonb, 1, true, 'publicado'),
('especialidades', 'header', 'titulo', 'text', $${"texto": "Áreas de atuação clínica"}$$::jsonb, 2, true, 'publicado'),
('especialidades', 'header', 'texto', 'text', $${"texto": "Cada pessoa vivencia seus desafios de modo particular. Conheça as principais demandas que acolho no consultório."}$$::jsonb, 3, true, 'publicado'),
('especialidades', 'lista', 'itens', 'json', $$[
  {"titulo": "Ansiedade", "texto": "Compreender as origens da preocupação constante e desenvolver formas mais leves de lidar com ela.", "detalhe": "Crises de ansiedade, ansiedade generalizada, pânico e ansiedade social."},
  {"titulo": "Depressão", "texto": "Acolhimento para os dias difíceis e construção gradual de sentido e vitalidade.", "detalhe": "Desânimo persistente, perda de interesse, alterações de sono e apetite."},
  {"titulo": "Luto e perdas", "texto": "Um espaço seguro para atravessar a dor da perda no seu próprio tempo.", "detalhe": "Perda de pessoas queridas, fim de relacionamentos, mudanças de vida."},
  {"titulo": "Relacionamentos", "texto": "Olhar para os vínculos, a comunicação e os padrões que se repetem.", "detalhe": "Conflitos afetivos, dependência emocional, limites e autoestima."},
  {"titulo": "Estresse e burnout", "texto": "Reorganizar a relação com o trabalho e recuperar o equilíbrio.", "detalhe": "Esgotamento profissional, sobrecarga, dificuldade de desligar."},
  {"titulo": "Maternidade", "texto": "Cuidado emocional na gestação, no puerpério e na nova rotina familiar.", "detalhe": "Puerpério, culpa materna, transições familiares."}
]$$::jsonb, 4, true, 'publicado'),

-- PÁGINA CONTATO
('contato', 'header', 'eyebrow', 'text', $${"texto": "Contato"}$$::jsonb, 1, true, 'publicado'),
('contato', 'header', 'titulo', 'text', $${"texto": "Vamos conversar?"}$$::jsonb, 2, true, 'publicado'),
('contato', 'header', 'texto', 'text', $${"texto": "Tire suas dúvidas ou envie uma mensagem. Respondo em até um dia útil."}$$::jsonb, 3, true, 'publicado'),

-- PÁGINA AGENDAR
('agendar', 'header', 'eyebrow', 'text', $${"texto": "Agendamento"}$$::jsonb, 1, true, 'publicado'),
('agendar', 'header', 'titulo', 'text', $${"texto": "Agende sua consulta"}$$::jsonb, 2, true, 'publicado'),
('agendar', 'header', 'texto', 'text', $${"texto": "Escolha a modalidade, selecione um horário disponível e preencha seus dados para solicitar o agendamento."}$$::jsonb, 3, true, 'publicado'),

-- PÁGINA PRIVACIDADE
('privacidade', 'header', 'eyebrow', 'text', $${"texto": "Transparência"}$$::jsonb, 1, true, 'publicado'),
('privacidade', 'header', 'titulo', 'text', $${"texto": "Política de Privacidade"}$$::jsonb, 2, true, 'publicado')

on conflict (pagina, secao, chave) do update set
  valor = excluded.valor,
  ordem = excluded.ordem,
  visivel = excluded.visivel,
  status = excluded.status,
  updated_at = now();


-- C) MEDIA
insert into public.media (url, alt, tamanho, tipo) values
('/helena-duarte.webp', 'Dra. Helena Duarte, psicóloga clínica', 89636, 'image/webp'),
('/consultorio.jpg', 'Consultório acolhedor com poltrona confortável e iluminação suave', 150000, 'image/jpeg')
on conflict (url) do update set
  alt = excluded.alt,
  tamanho = excluded.tamanho,
  tipo = excluded.tipo;
