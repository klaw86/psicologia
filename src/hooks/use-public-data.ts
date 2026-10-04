import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const depoimentosQuery = queryOptions({
  queryKey: ["depoimentos", "publicos"],
  queryFn: async () => {
    const { data, error } = await supabase.from("depoimentos").select("id, autor, texto").eq("aprovado", true).order("created_at");
    if (error) throw error;
    return data;
  },
});

export const artigosQuery = queryOptions({
  queryKey: ["artigos", "publicados"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("artigos")
      .select("id, slug, titulo, resumo, categoria, publicado_em")
      .eq("publicado", true)
      .order("publicado_em", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const artigoQuery = (slug: string) =>
  queryOptions({
    queryKey: ["artigo", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("artigos").select("*").eq("slug", slug).eq("publicado", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const disponibilidadeQuery = queryOptions({
  queryKey: ["disponibilidade"],
  queryFn: async () => {
    const { data, error } = await supabase.from("disponibilidade").select("dia_semana, hora_inicio, hora_fim");
    if (error) throw error;
    return data;
  },
});

export const siteSettingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("secao, chave, valor");
      if (error || !data) return {} as Record<string, any>;
      const map: Record<string, any> = {};
      for (const row of data) {
        map[`${row.secao}:${row.chave}`] = row.valor;
      }
      return map;
    } catch {
      return {} as Record<string, any>;
    }
  },
  staleTime: 1000 * 60 * 5,
});

export const contentBlocksQuery = (pagina?: string) =>
  queryOptions({
    queryKey: ["content_blocks", pagina ?? "todos"],
    queryFn: async () => {
      try {
        let query = supabase
          .from("content_blocks")
          .select("pagina, secao, chave, tipo, valor")
          .eq("status", "publicado")
          .eq("visivel", true);
        if (pagina) {
          query = query.eq("pagina", pagina);
        }
        const { data, error } = await query;
        if (error || !data) return {} as Record<string, any>;
        const map: Record<string, any> = {};
        for (const row of data) {
          map[`${row.pagina}:${row.secao}:${row.chave}`] = row.valor;
          map[`${row.secao}:${row.chave}`] = row.valor;
        }
        return map;
      } catch {
        return {} as Record<string, any>;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { NAV, SITE } from "@/data/site";

export const LUXURY_EDITORIAL_COLORS = {
  charcoal: "#1F1F21",
  ivory: "#F7F4ED",
  gold: "#C5A25D",
  wine: "#5C2A3A",
  smoke: "#A29C92",
};

export function applyThemeColors(colors: Partial<typeof LUXURY_EDITORIAL_COLORS>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (colors.charcoal) {
    root.style.setProperty("--charcoal", colors.charcoal);
    root.style.setProperty("--foreground", colors.charcoal);
  }
  if (colors.ivory) {
    root.style.setProperty("--ivory", colors.ivory);
    root.style.setProperty("--background", colors.ivory);
  }
  if (colors.gold) {
    root.style.setProperty("--gold", colors.gold);
    root.style.setProperty("--primary", colors.gold);
    root.style.setProperty("--ring", colors.gold);
  }
  if (colors.wine) {
    root.style.setProperty("--wine", colors.wine);
    root.style.setProperty("--sage-deep", colors.wine);
  }
  if (colors.smoke) {
    root.style.setProperty("--smoke", colors.smoke);
    root.style.setProperty("--border", colors.smoke);
  }
}

export function useSiteSettings() {
  const { data } = useQuery(siteSettingsQuery);
  const settings = data ?? {};
  const idGeral = (settings["identidade:geral"] || {}) as Record<string, string>;
  const cores = (settings["cores:paleta"] || {}) as Record<string, string>;
  const fontes = (settings["fontes:tipografia"] || {}) as Record<string, string>;
  const contato = (settings["contato:dados"] || {}) as Record<string, string>;
  const redes = (settings["redes:links"] || {}) as Record<string, string>;
  const seo = (settings["seo:metadados"] || {}) as Record<string, any>;
  const menu = (settings["menu:navegacao"] || {}) as Record<string, any>;
  const rodape = (settings["rodape:configuracoes"] || {}) as Record<string, string>;
  const agendamento = (settings["agendamento:regras"] || {}) as Record<string, any>;
  const depoimentos = (settings["depoimentos:config"] || {}) as Record<string, any>;
  const avisos = (settings["avisos:notas"] || {}) as Record<string, string>;

  // Cores ativas
  const activeColors = {
    charcoal: cores["charcoal"] || LUXURY_EDITORIAL_COLORS.charcoal,
    ivory: cores["ivory"] || LUXURY_EDITORIAL_COLORS.ivory,
    gold: cores["gold"] || LUXURY_EDITORIAL_COLORS.gold,
    wine: cores["wine"] || LUXURY_EDITORIAL_COLORS.wine,
    smoke: cores["smoke"] || LUXURY_EDITORIAL_COLORS.smoke,
  };

  useEffect(() => {
    applyThemeColors(activeColors);
  }, [activeColors.charcoal, activeColors.ivory, activeColors.gold, activeColors.wine, activeColors.smoke]);

  return {
    raw: settings,
    // Identidade
    nome: idGeral["nome"] || SITE.nome,
    titulo: idGeral["titulo"] || SITE.titulo,
    foto: idGeral["foto"] || SITE.foto,
    fotoConsultorio: idGeral["foto_consultorio"] || "/consultorio.jpg",
    crp: idGeral["crp"] || SITE.crp,
    logo: idGeral["logo"] || "",
    favicon: idGeral["favicon"] || "/favicon.ico",
    cidade: idGeral["cidade"] || contato["cidade"] || SITE.cidade,

    // Cores
    cores: activeColors,

    // Fontes
    fontes: {
      display: fontes["display"] || "Fraunces, Georgia, serif",
      sans: fontes["sans"] || "Nunito Sans, system-ui, sans-serif",
    },

    // Contato
    endereco: contato["endereco"] || SITE.endereco,
    telefone: contato["telefone"] || SITE.telefone,
    whatsapp: contato["whatsapp"] || SITE.whatsapp,
    email: contato["email"] || SITE.email,
    horario: contato["horario"] || SITE.horario,
    mapa: contato["mapa"] || "",

    // Redes
    redes: {
      instagram: redes["instagram"] || "https://instagram.com/drahelenaduarte",
      whatsapp: redes["whatsapp"] || `https://wa.me/${contato["whatsapp"] || SITE.whatsapp}`,
      linkedin: redes["linkedin"] || "",
    },

    // SEO
    seo: {
      tituloPadrao: seo["titulo_padrao"] || "Dra. Helena Duarte – Psicóloga Clínica",
      descricaoPadrao: seo["descricao_padrao"] || "Psicoterapia com acolhimento e ética para ansiedade, depressão, luto e relacionamentos.",
      ogImage: seo["og_image"] || "/helena-duarte.webp",
      keywords: seo["keywords"] || ["Psicologia", "Psicoterapia", "Terapia Online"],
      paginas: (seo["paginas"] || {}) as Record<string, { titulo?: string; descricao?: string }>,
    },

    // Menu
    menu: {
      itens: (menu["itens"] || NAV) as Array<{ to: string; label: string; visivel?: boolean }>,
      cta: (menu["cta"] || { to: "/agendar", label: "Agendar consulta" }) as { to: string; label: string },
    },

    // Rodapé
    rodape: {
      texto: rodape["texto_sobre"] || "Atendimento presencial em Lucas do Rio Verde/MT e online para todo o Brasil.",
      crp: rodape["crp"] || SITE.crp,
      direitos: rodape["direitos"] || "Dra. Helena Duarte. Todos os direitos reservados.",
    },

    // Agendamento
    agendamento: {
      duracaoMin: Number(agendamento["duracao_min"]) || 50,
      intervaloMin: Number(agendamento["intervalo_min"]) || 10,
      antecedenciaMin: Number(agendamento["antecedencia_min"]) || 120,
      cancelamentoHoras: Number(agendamento["cancelamento_horas"]) || 24,
      modalidades: (agendamento["modalidades"] || ["presencial", "online"]) as string[],
      emailNotificacao: agendamento["email_notificacao"] || contato["email"] || SITE.email,
      reembolsoPlano: agendamento["reembolso_plano"] || "Atendimentos particulares com emissão de recibo para solicitação de reembolso.",
    },

    // Depoimentos
    depoimentosConfig: {
      visivel: depoimentos["visivel"] !== false,
      aviso: depoimentos["aviso_sigilo"] || "Depoimentos fictícios, publicados com iniciais para preservar o sigilo.",
    },

    // Avisos
    aviso: avisos["demonstrativo"] || SITE.aviso,
    emergencia: avisos["emergencia"] || "Em caso de crise, ligue 188 (CVV) ou 192 (SAMU).",
  };
}

export function usePageContent(pagina: string) {
  const { data: blocks } = useQuery(contentBlocksQuery(pagina));

  function getBlock<T>(secao: string, chave: string, fallback: T): T {
    if (!blocks) return fallback;
    const item = blocks[`${pagina}:${secao}:${chave}`] ?? blocks[`${secao}:${chave}`];
    if (item === undefined || item === null) return fallback;
    if (typeof fallback === "string" && typeof item === "object" && item !== null && "texto" in item) {
      return (item as { texto: string }).texto as unknown as T;
    }
    return item as T;
  }

  return { getBlock, blocks: blocks ?? {} };
}


