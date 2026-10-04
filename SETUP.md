# Manual de Configuração do Supabase, Autenticação & IA (SETUP)

Este guia explica em passos simples como aplicar a estrutura de segurança, criar o usuário administrador oficial e configurar a Edge Function de Inteligência Artificial (`ai-assist`).

---

## 1. Aplicar as Migrations no Supabase

As migrations criam a estrutura do CMS, mídias e a segurança de acesso restrito ao administrador.

### Passo a passo:

1. Acesse o painel do seu projeto no **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. No menu lateral esquerdo, clique em **SQL Editor** (ícone `>_`).
3. Clique em **New query** (Nova consulta).
4. Execute primeiro o arquivo:
   - [`supabase/migrations/20261004010000_site_cms_and_ai.sql`](supabase/migrations/20261004010000_site_cms_and_ai.sql) *(Tabelas do CMS, Mídias e Conteúdo inicial)*
5. Em seguida, crie outra query e execute o arquivo de segurança:
   - [`supabase/migrations/20261004020000_admin_auth_and_roles.sql`](supabase/migrations/20261004020000_admin_auth_and_roles.sql) *(Papéis, restrição exclusiva para `klaw.com@gmail.com` e trigger automático)*
6. O Supabase confirmará com sucesso (`Success. No rows returned`).

---

## 2. Primeiro Acesso: Criar o Usuário Administrador e Definir a Senha

O e-mail oficial do administrador do sistema é: **`klaw.com@gmail.com`**.

Por segurança, **não existe cadastro público** na página de login do site. A criação da conta e definição da senha inicial são feitas de forma 100% segura diretamente pelo painel do Supabase:

### Como criar a conta e definir a senha:

1. No painel do seu projeto no Supabase, clique em **Authentication** (ícone de cadeado/usuários no menu lateral esquerdo).
2. Na aba **Users**, clique no botão **Add user** (canto superior direito) e selecione **Create user**.
3. Preencha os campos:
   - **Email:** `klaw.com@gmail.com`
   - **Password:** Digite a senha forte que deseja utilizar para acessar o painel administrativo.
   - **Auto Confirm User?:** Marque esta caixa como **Ativada (Yes)** para que o e-mail já fique confirmado imediatamente, sem depender de confirmação por link.
4. Clique em **Create user**.
5. **Pronto!** O gatilho de segurança do banco de dados (`on_auth_user_created_assign_role`) atribuirá automaticamente o papel `admin` na tabela `user_roles` exclusivamente para este e-mail.

---

## 3. Como Acessar o Painel no Site

1. Abra o site no navegador:
   - Acesse diretamente: `http://localhost:8080/login` (ou o domínio publicado).
   - Ou clique no botão discreto **"Área restrita"** localizado no canto inferior do rodapé ou dentro do menu.
2. Na tela de login:
   - Informe o e-mail: `klaw.com@gmail.com`
   - Digite a senha definida no passo anterior.
   - Clique em **"Entrar no Painel"**.
3. O sistema valida as credenciais e confirma o papel `admin` no banco via RLS.
4. Você será redirecionado imediatamente para o painel de gerenciamento (`/admin`).
5. Enquanto você estiver logado:
   - O menu e o rodapé exibirão as opções **"Painel"** (para voltar ao CMS) e **"Sair"** (para encerrar a sessão com segurança).

### Esqueci minha senha:
Caso precise recuperar o acesso futuramente, na tela `/login` clique em **"Esqueci minha senha"**, informe `klaw.com@gmail.com` e o Supabase enviará um link de redefinição seguro para a sua caixa de entrada.

---

## 4. Configurar a Chave de Inteligência Artificial (Edge Function)

A Edge Function `ai-assist` permite gerar textos éticos, reescrever conteúdos e criar imagens profissionais diretamente no Editor Visual (`/admin/editor`).

A chave de IA **nunca** fica exposta no código-fonte nem no front-end. Ela deve ser cadastrada como um segredo no Supabase:

1. No menu lateral do [Supabase Dashboard](https://supabase.com/dashboard), clique em **Project Settings** (ícone de engrenagem).
2. No menu de configurações, vá em **Edge Functions** (ou **Secrets / Vault**).
3. Adicione o segredo:
   - **Name (Nome):** `OPENAI_API_KEY`
   - **Secret (Valor):** Cole sua chave de API da OpenAI (iniciada por `sk-...`).
4. Clique em **Add Secret** (Salvar).

*(Se preferir usar o Supabase CLI via terminal:)*
```bash
npx supabase secrets set OPENAI_API_KEY=sua_chave_aqui
```

### Conformidade Ética (Código de Ética do Psicólogo - CFP):
- **Sem promessa de cura ou resultados:** Vedado por normas profissionais.
- **Sem depoimentos de pacientes reais:** Vedado pelo CFP.
- **Linguagem acolhedora e científica:** Tom humanizado e reflexivo.
- **Orientações para situações de crise:** Indicação do CVV (188) e emergências.

---

## 5. Segurança do Sistema

- **Restrição a nível de banco:** Mesmo que alguém tente alterar papéis via API, a trigger `check_admin_role_restriction` impede a atribuição de `admin` para qualquer usuário que não possua o e-mail `klaw.com@gmail.com`.
- **Rotas protegidas:** Todas as rotas `/admin` (`/admin`, `/admin/ajustes`, `/admin/editor`) são blindadas por verificação de autenticação e papel. Usuários sem login ou com papel `demo`/`user` são redirecionados imediatamente para `/login`.
- **Privacidade e SEO:** Tanto a página `/login` quanto todas as páginas `/admin` possuem metatag `noindex, nofollow` e estão bloqueadas no arquivo `public/robots.txt`.
- **Sem cadastro público:** Visitantes comuns não conseguem criar contas no site.
