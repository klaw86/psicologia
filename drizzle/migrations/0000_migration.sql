
create type public.app_role as enum ('admin','user');
create type public.status_agendamento as enum ('solicitado','confirmado','realizado','cancelado','faltou');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Usuário lê seus papéis" on public.user_roles for select to authenticated using (user_id = auth.uid());

create table public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 120),
  email text check (char_length(email) <= 255),
  telefone text check (char_length(telefone) <= 30),
  data_nascimento date,
  ativo boolean not null default true,
  modalidade_preferida text not null default 'presencial' check (modalidade_preferida in ('presencial','online')),
  observacoes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.pacientes to authenticated;
grant all on public.pacientes to service_role;
alter table public.pacientes enable row level security;
create policy "Admin gerencia pacientes" on public.pacientes for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references public.pacientes(id) on delete set null,
  nome text not null check (char_length(nome) between 2 and 120),
  email text not null check (char_length(email) between 5 and 255),
  telefone text not null check (char_length(telefone) between 8 and 30),
  modalidade text not null check (modalidade in ('presencial','online')),
  inicio timestamptz not null,
  duracao_min int not null default 50,
  status status_agendamento not null default 'solicitado',
  mensagem text check (char_length(mensagem) <= 1000),
  notas text,
  created_at timestamptz not null default now()
);
create unique index agendamentos_horario_unico on public.agendamentos (inicio) where status <> 'cancelado';
grant insert on public.agendamentos to anon;
grant select, insert, update, delete on public.agendamentos to authenticated;
grant all on public.agendamentos to service_role;
alter table public.agendamentos enable row level security;
create policy "Visitantes solicitam agendamento" on public.agendamentos for insert to anon, authenticated
  with check (status = 'solicitado' and paciente_id is null and notas is null);
create policy "Admin gerencia agendamentos" on public.agendamentos for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.validar_agendamento_publico()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('anon','authenticated') and not public.has_role(auth.uid(),'admin') and new.inicio < now() then
    raise exception 'Horário inválido';
  end if;
  return new;
end $$;
create trigger trg_validar_agendamento before insert on public.agendamentos
  for each row execute function public.validar_agendamento_publico();

create or replace function public.horarios_ocupados(_de date, _ate date)
returns setof timestamptz language sql stable security definer set search_path = public as $$
  select inicio from public.agendamentos
  where status <> 'cancelado' and inicio >= _de::timestamptz and inicio < (_ate + 1)::timestamptz
$$;
grant execute on function public.horarios_ocupados(date, date) to anon, authenticated;

create table public.disponibilidade (
  id uuid primary key default gen_random_uuid(),
  dia_semana int not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fim time not null,
  ativo boolean not null default true
);
grant select on public.disponibilidade to anon;
grant select, insert, update, delete on public.disponibilidade to authenticated;
grant all on public.disponibilidade to service_role;
alter table public.disponibilidade enable row level security;
create policy "Público lê disponibilidade" on public.disponibilidade for select to anon, authenticated using (ativo);
create policy "Admin gerencia disponibilidade" on public.disponibilidade for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.depoimentos (
  id uuid primary key default gen_random_uuid(),
  autor text not null,
  texto text not null,
  aprovado boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.depoimentos to anon;
grant select, insert, update, delete on public.depoimentos to authenticated;
grant all on public.depoimentos to service_role;
alter table public.depoimentos enable row level security;
create policy "Público lê depoimentos aprovados" on public.depoimentos for select to anon, authenticated using (aprovado);
create policy "Admin gerencia depoimentos" on public.depoimentos for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.artigos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  resumo text not null default '',
  conteudo text not null default '',
  categoria text not null default 'Bem-estar',
  publicado boolean not null default false,
  publicado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.artigos to anon;
grant select, insert, update, delete on public.artigos to authenticated;
grant all on public.artigos to service_role;
alter table public.artigos enable row level security;
create policy "Público lê artigos publicados" on public.artigos for select to anon, authenticated using (publicado);
create policy "Admin gerencia artigos" on public.artigos for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.mensagens_contato (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 120),
  email text not null check (char_length(email) between 5 and 255),
  telefone text check (char_length(telefone) <= 30),
  mensagem text not null check (char_length(mensagem) between 5 and 1000),
  lida boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.mensagens_contato to anon;
grant select, insert, update, delete on public.mensagens_contato to authenticated;
grant all on public.mensagens_contato to service_role;
alter table public.mensagens_contato enable row level security;
create policy "Visitantes enviam mensagem" on public.mensagens_contato for insert to anon, authenticated with check (lida = false);
create policy "Admin gerencia mensagens" on public.mensagens_contato for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- SEED
insert into public.disponibilidade (dia_semana, hora_inicio, hora_fim)
select d, '08:00', '18:00' from generate_series(1,5) d;

insert into public.pacientes (nome, email, telefone, data_nascimento, ativo, modalidade_preferida, observacoes) values
('Ana Beatriz Souza','ana.souza@exemplo.com','(65) 90000-0001','1992-03-14',true,'presencial','Ansiedade generalizada.'),
('Bruno Carvalho','bruno.c@exemplo.com','(65) 90000-0002','1988-07-22',true,'online','Estresse no trabalho.'),
('Camila Ferreira','camila.f@exemplo.com','(65) 90000-0003','1996-11-05',true,'presencial','Luto recente.'),
('Diego Martins','diego.m@exemplo.com','(65) 90000-0004','1985-01-30',true,'online','Autoestima.'),
('Eduarda Lima','eduarda.l@exemplo.com','(65) 90000-0005','2000-09-18',true,'presencial','Orientação acadêmica.'),
('Felipe Rocha','felipe.r@exemplo.com','(65) 90000-0006','1979-05-09',false,'presencial','Alta em agosto.'),
('Gabriela Nunes','gabriela.n@exemplo.com','(65) 90000-0007','1994-12-01',true,'online','Relacionamentos.'),
('Henrique Alves','henrique.a@exemplo.com','(65) 90000-0008','1990-04-27',true,'presencial','Insônia.'),
('Isabela Moreira','isabela.m@exemplo.com','(65) 90000-0009','1998-08-15',true,'online','Ansiedade social.'),
('João Pedro Dias','joao.d@exemplo.com','(65) 90000-0010','1983-02-11',false,'online','Pausa no acompanhamento.'),
('Larissa Costa','larissa.c@exemplo.com','(65) 90000-0011','1991-06-03',true,'presencial','Maternidade.'),
('Marcos Ribeiro','marcos.r@exemplo.com','(65) 90000-0012','1987-10-20',true,'presencial','Burnout.');

with p as (select id, nome, email, telefone, modalidade_preferida, row_number() over (order by nome) rn from public.pacientes),
dias as (
  select d::date dia, row_number() over (order by d) n
  from generate_series(current_date - 30, current_date + 28, interval '1 day') d
  where extract(isodow from d) < 6 and d::date <> current_date
),
sel as (select dia, n, row_number() over (order by dia) k from dias where n % 2 = 1 limit 25)
insert into public.agendamentos (paciente_id, nome, email, telefone, modalidade, inicio, status, mensagem)
select p.id, p.nome, p.email, p.telefone, p.modalidade_preferida,
  (sel.dia + make_time(9 + (sel.k % 8)::int, 0, 0)) at time zone 'America/Cuiaba',
  case
    when sel.dia < current_date then (case when sel.k % 6 = 0 then 'faltou' when sel.k % 9 = 0 then 'cancelado' else 'realizado' end)::status_agendamento
    else (case when sel.k % 4 = 0 then 'solicitado' else 'confirmado' end)::status_agendamento
  end,
  null
from sel join p on p.rn = ((sel.k - 1) % 12) + 1;

insert into public.depoimentos (autor, texto, aprovado) values
('A. S., 32 anos','Encontrei um espaço seguro para falar sobre a minha ansiedade. Hoje me sinto muito mais leve e consciente.',true),
('B. C., 36 anos','O atendimento online foi tão acolhedor quanto o presencial. Recomendo de olhos fechados.',true),
('C. F., 28 anos','Passei por um luto difícil e tive todo o cuidado e paciência de que precisava.',true),
('D. M., 40 anos','Aprendi a me enxergar com mais gentileza. A terapia mudou a forma como me relaciono comigo.',true),
('G. N., 30 anos','Profissional ética, atenta e muito humana. Cada sessão faz diferença.',true),
('L. C., 34 anos','Me ajudou muito na transição para a maternidade. Gratidão!',false);

insert into public.artigos (slug, titulo, resumo, conteudo, categoria, publicado, publicado_em) values
('ansiedade-sinais-e-cuidados','Ansiedade: sinais de alerta e cuidados no dia a dia','Como diferenciar a ansiedade comum de um quadro que merece atenção profissional.',
E'A ansiedade é uma resposta natural do corpo diante de situações de risco ou incerteza. Ela nos prepara para agir.\n\nQuando, porém, a preocupação se torna constante, desproporcional e começa a interferir no sono, no trabalho e nas relações, é hora de olhar com mais cuidado.\n\n## Sinais comuns\n\n- Pensamentos acelerados e dificuldade de concentração\n- Tensão muscular, taquicardia, falta de ar\n- Evitação de situações do cotidiano\n\n## Pequenos cuidados\n\nRespiração diafragmática, rotina de sono regular e movimento físico ajudam. A psicoterapia oferece ferramentas para compreender a origem da ansiedade e construir novas formas de lidar com ela.','Ansiedade',true, now() - interval '40 days'),
('terapia-online-funciona','Terapia online funciona? O que dizem as pesquisas','Entenda como funciona o atendimento psicológico online e para quem ele é indicado.',
E'O atendimento psicológico online é regulamentado no Brasil e tem se mostrado eficaz para diversas demandas.\n\n## Vantagens\n\n- Flexibilidade de horários e local\n- Continuidade do cuidado em viagens ou mudanças\n- Conforto de estar em um ambiente familiar\n\n## Como se preparar\n\nEscolha um lugar reservado, use fones de ouvido e garanta uma boa conexão. O vínculo terapêutico se constrói da mesma forma: com escuta, confiança e regularidade.','Terapia',true, now() - interval '25 days'),
('autocuidado-nao-e-egoismo','Autocuidado não é egoísmo','Por que cuidar de si é a base para cuidar de quem amamos.',
E'Muitas pessoas sentem culpa ao reservar tempo para si. Mas o autocuidado é uma necessidade, não um luxo.\n\n## Comece pequeno\n\n- Dez minutos de silêncio pela manhã\n- Dizer \"não\" a um compromisso que esgota\n- Perceber e nomear as próprias emoções\n\nCuidar de si é também um exercício de responsabilidade afetiva com as pessoas ao redor.','Bem-estar',true, now() - interval '12 days'),
('luto-tempo-de-cada-um','Luto: cada pessoa tem o seu tempo','Reflexões sobre o processo de luto e quando buscar apoio.',
E'O luto não é linear. Há dias de saudade intensa e dias de alívio, e ambos fazem parte.\n\n## Não há jeito certo\n\nComparar o próprio luto ao de outras pessoas costuma trazer mais sofrimento. Respeite o seu ritmo.\n\n## Quando buscar ajuda\n\nSe a dor impede as atividades básicas por um longo período, ou se surgem pensamentos de desesperança, procure apoio profissional. Em situações de crise, ligue 188 (CVV).','Luto',true, now() - interval '3 days');
