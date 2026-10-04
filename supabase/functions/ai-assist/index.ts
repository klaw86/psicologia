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
    const { action, prompt, text, context, size, tone, targetLang } = body;

    // Helper para chamadas ao Chat Completions
    async function callChat(userContent: string, temperature = 0.7) {
      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature,
          messages: [
            { role: "system", content: PSYCHOLOGY_ETHICAL_SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (!openAiRes.ok) {
        const errText = await openAiRes.text();
        throw new Error("Erro na API de IA: " + errText);
      }

      const data = await openAiRes.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    }

    // Ação: Gerar texto livre
    if (action === "generate_text") {
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Prompt não fornecido." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const textResult = await callChat(`Contexto / Seção: ${context || "Geral do site"}\nInstrução: ${prompt}`);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Reescrever texto
    if (action === "rewrite_text") {
      if (!text) {
        return new Response(JSON.stringify({ error: "Texto original não fornecido." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const textResult = await callChat(`Reescreva o texto a seguir com excelência editorial, tom acolhedor e ética:\n${prompt ? `Instrução: ${prompt}\n` : ""}\nTexto original:\n"""\n${text}\n"""`, 0.6);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Encurtar texto
    if (action === "shorten") {
      if (!text) {
        return new Response(JSON.stringify({ error: "Texto não fornecido." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const textResult = await callChat(`Encurte e sintetize o texto a seguir mantendo os pontos essenciais, concisão e tom acolhedor:\n\n"""\n${text}\n"""`, 0.5);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Expandir texto
    if (action === "expand") {
      if (!text) {
        return new Response(JSON.stringify({ error: "Texto não fornecido." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const textResult = await callChat(`Expanda e enriqueça o texto a seguir com clareza, empatia, reflexão e profundidade clínica:\n\n"""\n${text}\n"""`, 0.7);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Mudar tom
    if (action === "change_tone") {
      if (!text) {
        return new Response(JSON.stringify({ error: "Texto não fornecido." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const textResult = await callChat(`Reescreva o texto alterando o tom para "${tone || "mais acolhedor, humano e empático"}":\n\n"""\n${text}\n"""`, 0.6);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Corrigir gramática
    if (action === "fix_grammar") {
      if (!text) {
        return new Response(JSON.stringify({ error: "Texto não fornecido." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const textResult = await callChat(`Corrija a pontuação, ortografia e concordância do texto a seguir, mantendo exatamente o estilo e a mensagem:\n\n"""\n${text}\n"""`, 0.3);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Traduzir
    if (action === "translate") {
      if (!text) {
        return new Response(JSON.stringify({ error: "Texto não fornecido." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const textResult = await callChat(`Traduza o seguinte texto para ${targetLang || "Inglês"}, mantendo a sensibilidade do contexto psicológico:\n\n"""\n${text}\n"""`, 0.4);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Sugerir títulos
    if (action === "suggest_titles") {
      const textResult = await callChat(`Sugira 5 opções de títulos refinados, éticos e envolventes para:\nTema / Conteúdo: ${prompt || text}`, 0.7);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Sugerir SEO (Título + Meta Description)
    if (action === "suggest_seo") {
      const textResult = await callChat(`Para o seguinte conteúdo ou página, sugira:\n1) Título SEO otimizado (50-60 caracteres)\n2) Meta Description persuasiva e ética (130-155 caracteres)\n3) 5 Palavras-chave relevantes\n\nConteúdo:\n${prompt || text}`, 0.5);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Sugerir FAQ
    if (action === "suggest_faq") {
      const textResult = await callChat(`Gere 3 perguntas frequentes com respostas acolhedoras e claras para pacientes de psicoterapia sobre: ${prompt || text || "Processo terapêutico"}`, 0.6);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ação: Gerar Artigo Completo de Blog
    if (action === "generate_article") {
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Tema não fornecido para gerar artigo." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const textResult = await callChat(`Escreva um artigo de blog completo e informativo para pacientes, com cerca de 500 palavras em formato Markdown.\nEstrutura obrigatória:\n- Título atrativo em #\n- Introdução acolhedora\n- 3 seções explicativas com subtítulos ##\n- Conclusão com orientação para buscar apoio profissional e menção ao CVV (188) se relevante.\n\nTema solicitado: ${prompt}`, 0.7);
      return new Response(JSON.stringify({ success: true, text: textResult }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
          prompt: `${prompt}. High quality, professional photography, warm soft studio lighting, natural textures, refined psychology office ambiance in ivory and charcoal tones, realistic photography, vertical 4:5 or balanced composition.`,
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
