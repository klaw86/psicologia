import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PSYCHOLOGY_ETHICAL_SYSTEM_PROMPT = `Você é um assistente de redação especializado em psicologia clínica e comunicação em saúde mental, pautado rigorosamente pelas diretrizes do Conselho Federal de Psicologia do Brasil (CFP - Resolução CFP nº 010/05).

DIRETRIZES ÉTICAS E DE ESTILO OBRIGATÓRIAS:
1. SEM PROMESSA DE CURA OU RESULTADOS: É expressamente proibido garantir prazos ou eficácia (ex: nunca use "cure sua ansiedade", "resultado garantido em 4 semanas"). O processo terapêutico é colaborativo e individual.
2. SEM DEPOIMENTOS DE PACIENTES REAIS: O Código de Ética do Psicólogo veda a utilização de depoimentos de pessoas atendidas como forma de propaganda ou autopromoção.
3. LINGUAGEM ACOLHEDORA E CIENTÍFICA: Utilize tom empático, sóbrio, elegante, caloroso e livre de termos sensacionalistas ou comerciais agressivos.
4. PRESERVAÇÃO DO SIGILO E DA AUTONOMIA: Enfatize o sigilo profissional, a escuta qualificada e o respeito à individualidade de cada pessoa.
5. CUIDADO EM CRISES: Em temas sensíveis de sofrimento extremo, sempre mencione canais públicos de ajuda imediata (Centro de Valorização da Vida - 188 e SAMU - 192).
6. ELEGÂNCIA E COESÃO: Escreva em português do Brasil com alto padrão editorial condizente com a paleta e proposta refinada da clínica.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Cabeçalho de autorização não fornecido." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Configuração do Supabase incompleta no servidor." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Validar usuário autenticado
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida ou expirada. Faça login novamente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validar papel de admin no banco
    const adminCheckClient = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : userClient;

    const { data: roleData, error: roleError } = await adminCheckClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Acesso negado. Apenas administradores podem utilizar este recurso de IA." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Obter chave de API de IA secreta do ambiente
    const apiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_AI_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Chave de IA não configurada. Configure a variável secreta OPENAI_API_KEY nas configurações do Supabase.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, prompt, text, context, size } = body;

    // Ação: Gerar texto
    if (action === "generate_text") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "Prompt não fornecido para geração de texto." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.7,
          messages: [
            { role: "system", content: PSYCHOLOGY_ETHICAL_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Contexto / Seção: ${context || "Geral do site"}\nInstrução: ${prompt}`,
            },
          ],
        }),
      });

      if (!openAiRes.ok) {
        const errText = await openAiRes.text();
        return new Response(
          JSON.stringify({ error: "Erro na API de IA: " + errText }),
          { status: openAiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await openAiRes.json();
      const generatedText = data.choices?.[0]?.message?.content?.trim() || "";
      return new Response(
        JSON.stringify({ success: true, text: generatedText }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ação: Reescrever texto
    if (action === "rewrite_text") {
      if (!text) {
        return new Response(
          JSON.stringify({ error: "Texto original não fornecido para reescrita." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.6,
          messages: [
            { role: "system", content: PSYCHOLOGY_ETHICAL_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Reescreva o texto a seguir com excelência editorial, tom acolhedor e total conformidade ética.\n\nInstrução adicional: ${prompt || "Aprimorar clareza, empatia e refinamento estético."}\n\nTexto original:\n"""\n${text}\n"""`,
            },
          ],
        }),
      });

      if (!openAiRes.ok) {
        const errText = await openAiRes.text();
        return new Response(
          JSON.stringify({ error: "Erro na API de IA: " + errText }),
          { status: openAiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await openAiRes.json();
      const rewrittenText = data.choices?.[0]?.message?.content?.trim() || "";
      return new Response(
        JSON.stringify({ success: true, text: rewrittenText }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ação: Gerar imagem
    if (action === "generate_image") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "Prompt não fornecido para geração de imagem." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const openAiRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `${prompt}. High quality, professional photography, warm elegant lighting, natural textures, refined psychology office ambiance.`,
          n: 1,
          size: size === "portrait" ? "1024x1792" : "1024x1024",
          response_format: "url",
        }),
      });

      if (!openAiRes.ok) {
        const errText = await openAiRes.text();
        return new Response(
          JSON.stringify({ error: "Erro na geração de imagem: " + errText }),
          { status: openAiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await openAiRes.json();
      const imageUrl = data.data?.[0]?.url || "";
      return new Response(
        JSON.stringify({ success: true, imageUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Ação '${action}' não reconhecida. Use generate_text, rewrite_text ou generate_image.` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "Erro interno: " + message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
