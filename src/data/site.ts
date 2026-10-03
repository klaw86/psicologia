export const SITE = {
  nome: "Dra. Maria Victória",
  titulo: "Psicóloga Clínica",
  crp: "CRP 00/00000",
  cidade: "Lucas do Rio Verde/MT",
  endereco: "Av. Exemplo, 1000 – Sala 00, Centro, Lucas do Rio Verde/MT",
  telefone: "(65) 90000-0000",
  whatsapp: "5565900000000",
  email: "contato@exemplo.com",
  horario: "Segunda a sexta, das 8h às 18h",
  aviso: "Projeto demonstrativo – dados fictícios",
};

export const whatsappLink = (texto = "Olá! Gostaria de informações sobre consultas.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;

export const NAV = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/especialidades", label: "Especialidades" },
  { to: "/blog", label: "Blog" },
  { to: "/contato", label: "Contato" },
] as const;

export const ESPECIALIDADES = [
  { titulo: "Ansiedade", texto: "Compreender as origens da preocupação constante e desenvolver formas mais leves de lidar com ela.", detalhe: "Crises de ansiedade, ansiedade generalizada, pânico e ansiedade social." },
  { titulo: "Depressão", texto: "Acolhimento para os dias difíceis e construção gradual de sentido e vitalidade.", detalhe: "Desânimo persistente, perda de interesse, alterações de sono e apetite." },
  { titulo: "Luto e perdas", texto: "Um espaço seguro para atravessar a dor da perda no seu próprio tempo.", detalhe: "Perda de pessoas queridas, fim de relacionamentos, mudanças de vida." },
  { titulo: "Relacionamentos", texto: "Olhar para os vínculos, a comunicação e os padrões que se repetem.", detalhe: "Conflitos afetivos, dependência emocional, limites e autoestima." },
  { titulo: "Estresse e burnout", texto: "Reorganizar a relação com o trabalho e recuperar o equilíbrio.", detalhe: "Esgotamento profissional, sobrecarga, dificuldade de desligar." },
  { titulo: "Maternidade", texto: "Cuidado emocional na gestação, no puerpério e na nova rotina familiar.", detalhe: "Puerpério, culpa materna, transições familiares." },
];

export const PASSOS = [
  { n: "01", titulo: "Agende", texto: "Escolha um horário livre no formulário ou fale pelo WhatsApp." },
  { n: "02", titulo: "Primeira conversa", texto: "Nos conhecemos, entendemos sua demanda e combinamos o formato." },
  { n: "03", titulo: "Acompanhamento", texto: "Sessões semanais de 50 minutos, presenciais ou online." },
];

export const FAQ = [
  { p: "Quanto tempo dura cada sessão?", r: "As sessões têm duração de 50 minutos, geralmente com frequência semanal." },
  { p: "O atendimento online é tão eficaz quanto o presencial?", r: "Sim. O atendimento online é regulamentado pelo Conselho Federal de Psicologia e apresenta resultados semelhantes ao presencial." },
  { p: "Vocês atendem por convênio?", r: "Os atendimentos são particulares. Emitimos recibo para solicitação de reembolso junto ao seu plano de saúde." },
  { p: "O que é dito na terapia é sigiloso?", r: "Sim. O sigilo é um princípio ético da Psicologia e é garantido em todos os atendimentos." },
  { p: "Como faço para remarcar uma sessão?", r: "Basta avisar com pelo menos 24 horas de antecedência pelo WhatsApp ou e-mail." },
];
