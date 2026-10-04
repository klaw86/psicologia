# Manual de Configuração do Supabase, Autenticação & IA (SETUP)

Este guia explica em passos simples como acessar o painel administrativo através da sua **Conta Google**, via **Link Mágico sem senha** ou com **e-mail e senha**.

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
   - [`supabase/migrations/20261004020000_admin_auth_and_roles.sql`](supabase/migrations/20261004020000_admin_auth_and_roles.sql) *(Papéis, restrição exclusiva para `klaw.com@gmail.com`, trigger e função `claim_admin_role`)*
6. O Supabase confirmará com sucesso (`Success. No rows returned`).

---

## 2. Como Acessar o Painel Sem Precisar de Senha

O e-mail oficial do administrador é: **`klaw.com@gmail.com`**.

Na tela `/login` (ou clicando no botão **"Área restrita"** no rodapé ou no menu), você tem 3 opções de acesso:

### Opção A (Recomendada): Entrar com a Conta Google
1. Na tela de login, clique no botão branco **"Entrar com a Conta Google"**.
2. Selecione a sua conta Google **`klaw.com@gmail.com`**.
3. O Supabase autentica a conta e o sistema reconhece automaticamente o papel de administrador, redirecionando você direto para o painel `/admin`!

> **Como ativar o Google OAuth no Supabase (se ainda não estiver ativo):**
> 1. No Supabase Dashboard, acesse **Authentication** -> **Providers** -> **Google**.
> 2. Marque **Enable Google provider**.
> 3. No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie uma credencial OAuth 2.0 (Tipo: Aplicação Web).
> 4. Copie a **Authorized redirect URI** do Supabase (`https://<seu-projeto>.supabase.co/auth/v1/callback`) e cole no Google Cloud.
> 5. Cole o **Client ID** e **Client Secret** no Supabase e clique em **Save**.

---

### Opção B (Acesso Instantâneo Sem Senha): Link Mágico no E-mail
Se você não tem senha e ainda não configurou as chaves do Google:
1. Na tela `/login`, clique no botão cinza **"Acessar via Link no E-mail (Sem Senha)"**.
2. O sistema enviará imediatamente um e-mail para **`klaw.com@gmail.com`**.
3. Abra sua caixa de entrada (ou spam) no Gmail e clique no botão de login da mensagem do Supabase.
4. Você será redirecionado para o site **já logado com sucesso**, sem precisar de senha!

---

### Opção C: Definir uma Senha Manual no Painel do Supabase
Se você preferir definir uma senha fixa:
1. No Supabase Dashboard, clique em **Authentication** -> **Users**.
2. Clique no botão **Add user** -> **Create user**.
3. Preencha:
   - **Email:** `klaw.com@gmail.com`
   - **Password:** Escolha sua senha.
   - **Auto Confirm User?:** Marque **Sim (Yes)**.
4. Clique em **Create user**.
5. Agora você pode entrar na tela `/login` informando esse e-mail e essa senha.

---

## 3. Configurar a Chave de Inteligência Artificial (Edge Function)

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

---

## 4. Segurança do Sistema

- **Restrição exclusiva no banco:** A trigger `check_admin_role_restriction` e a função RPC `claim_admin_role` garantem que nenhuma outra conta ou e-mail receba privilégios de administrador além de `klaw.com@gmail.com`.
- **Rotas protegidas:** As rotas `/admin`, `/admin/ajustes` e `/admin/editor` possuem guarda de autenticação ativo. Usuários não autenticados ou com outras contas são impedidos e redirecionados para `/login`.
- **Privacidade e SEO:** As telas `/login` e `/admin/*` possuem metatag `noindex, nofollow` e bloqueio explícito no `public/robots.txt`.
