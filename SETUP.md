# Manual de Configuração do Supabase & IA (SETUP)

Este guia explica os passos manuais necessários para aplicar a nova estrutura do CMS dinâmico no Supabase e configurar a Edge Function de Inteligência Artificial (`ai-assist`).

---

## 1. Aplicar a Migration no Supabase

Criamos uma migration completa com todas as tabelas, permissões de segurança (RLS), bucket de mídias e o conteúdo inicial (seed) do site.

### Como aplicar:

1. Acesse o painel do seu projeto no **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. No menu lateral esquerdo, clique em **SQL Editor** (ícone `>_`).
3. Clique em **New query** (Nova consulta).
4. Abra o arquivo local:
   - [`supabase/migrations/20261004010000_site_cms_and_ai.sql`](supabase/migrations/20261004010000_site_cms_and_ai.sql)
5. Copie todo o conteúdo desse arquivo e cole na área de texto do SQL Editor.
6. Clique no botão verde **Run** (Executar) no canto inferior direito.
7. O Supabase confirmará que o script foi executado com sucesso (`Success. No rows returned`).

### O que essa migration cria:
- **`site_settings`**: Armazena identidade da psicóloga, paleta de cores (Luxury Editorial), tipografia, contatos, SEO, menu e rodapé.
- **`content_blocks`**: Blocos de conteúdo com controle de versão, rascunho/publicado e ordenação para cada página (Início, Sobre, Especialidades, Contato, Agendar, Privacidade).
- **`media`**: Cadastro de imagens e arquivos com dimensões, alt text descritivo e tamanho em bytes.
- **`content_versions`**: Histórico automático de alterações em qualquer bloco de conteúdo.
- **Bucket público `site-media`**: Bucket de armazenamento para fotos e documentos, com leitura pública e upload restrito a administradores.
- **Seed inicial**: Preenchimento automático com todos os textos, telefones, links e fotos atuais da Dra. Helena Duarte.

---

## 2. Configurar a Chave de Inteligência Artificial (Edge Function)

A Edge Function `ai-assist` permite que o administrador gere textos éticos, reescreva conteúdos e gere imagens profissionais diretamente no sistema.

A chave da IA **nunca** fica salva no código-fonte nem no front-end. Ela deve ser cadastrada como um segredo no Supabase.

### Como cadastrar a chave no Supabase:

1. No menu lateral do [Supabase Dashboard](https://supabase.com/dashboard), clique em **Project Settings** (ícone de engrenagem).
2. No menu de configurações, vá em **Edge Functions** (ou **Secrets / Vault**).
3. Adicione o segredo:
   - **Name (Nome):** `OPENAI_API_KEY`
   - **Secret (Valor):** Cole sua chave de API da OpenAI (iniciada por `sk-...`).
4. Clique em **Add Secret** (Salvar).

*(Se você preferir usar o Supabase CLI no terminal, basta executar:)*
```bash
npx supabase secrets set OPENAI_API_KEY=sua_chave_aqui
```

### Diretrizes Éticas Embutidas na IA:
A função já possui prompt de sistema que cumpre estritamente a Resolução CFP nº 010/05 (Código de Ética do Psicólogo):
- **Sem promessa de cura ou resultados:** A IA nunca gerará promessas milagrosas ou prazos fechados.
- **Sem depoimentos de pacientes reais:** Vedado pelo Conselho Federal de Psicologia.
- **Linguagem acolhedora e científica:** Tom humanizado, sóbrio e reflexivo.
- **Orientações para situações de crise:** Indicação de serviços de emergência (CVV 188 e SAMU 192).

---

## 3. Como Vincular seu Usuário como Administrador (`admin`)

O sistema identifica o administrador através da tabela `public.user_roles` e da função de segurança `public.has_role(auth.uid(), 'admin')`.

### Passo a passo:

1. No painel do Supabase, clique em **Authentication** -> **Users**.
2. Localize a sua conta (ou crie uma nova clicando em *Add user* -> *Create user*).
3. Copie o valor da coluna **User UID** (exemplo: `a1b2c3d4-e5f6-7890-abcd-1234567890ab`).
4. Abra o **SQL Editor** do Supabase e execute:
   ```sql
   insert into public.user_roles (user_id, role)
   values ('COLE_SEU_USER_UID_AQUI', 'admin')
   on conflict (user_id, role) do nothing;
   ```
5. Pronto! Agora o seu login possui permissão total de gerenciamento no CMS, upload de imagens no bucket `site-media` e uso da Edge Function `ai-assist`.

---

## 4. Reserva Automática (Fallback)

O site foi desenvolvido com proteção contra falhas:
- Se você ainda não tiver aplicado a migration ou caso o banco fique temporariamente indisponível, **o site público não quebra nem exibe erros**.
- Ele utiliza automaticamente os textos, contatos e imagens atuais como reserva (*fallback*), garantindo que os visitantes sempre vejam uma página completa e funcional.
