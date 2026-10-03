# Site de Psicologia

Crie um site completo para uma psicóloga clínica, em português do Brasil. Todos os dados são fictícios e o rodapé mostra "Projeto demonstrativo – dados fictícios".

FICTÍCIO: Dra. Maria Victória, CP 00/00000, [Lucas do Rio Verde/MT], atendimento presencial e online.

DESIGN: acolhedor e profissional, tons verde-sálvia, areia e branco, muito espaço em branco, mobile-first, código organizado (components, pages, hooks, data).

PÁGINAS PÚBLICAS: Início (hero com "Agendar consulta", como posso ajudar, sobre, como funciona em 3 passos, depoimentos, FAQ, CTA), Sobre, Especialidades, Blog (lista + artigo), Contato, Política de Privacidade.

AGENDAR: formulário (nome, e-mail, telefone, modalidade, data e horário livre, mensagem) que grava no banco; os horários ocupados não aparecem para outros visitantes.

BANCO (RLS ativo em todas as tabelas): pacientes, agendamentos (status: solicitado, confirmado, realizado, cancelado, faltou), disponibilidade, depoimentos (campo aprovado), artigos, mensagens de contato. Visitantes só podem inserir solicitações e ler conteúdo publicado.

DADOS INICIAIS (seed): 12 pacientes fictícios, 25 agendamentos distribuídos nas próximas semanas e no mês anterior, 6 depoimentos fictícios, 4 artigos, horários de atendimento de segunda a sexta.

PAINEL /admin com login: crie um usuário demo (demo@exemplo.com / senha exibida na tela de login para visitantes do portfólio). Telas: Dashboard (consultas da semana, solicitações novas, pacientes ativos, faltas), Agenda em calendário (criar, remarcar, cancelar), Pacientes (busca, filtros, ficha com histórico), Depoimentos (aprovar/ocultar), Blog (criar/editar artigos).

EXTRAS: botão flutuante de WhatsApp, H1 único por página, title e description distintos por página, alt nas imagens.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1cf9f8fa-68f3-4ac6-97ff-041c36f400e9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
