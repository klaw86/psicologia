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

import { useQuery } from "@tanstack/react-query";
import { SITE } from "@/data/site";

export function useSiteSettings() {
  const { data } = useQuery(siteSettingsQuery);
  const settings = data ?? {};
  const idGeral = (settings["identidade:geral"] || {}) as Record<string, string>;
  const contato = (settings["contato:dados"] || {}) as Record<string, string>;
  const avisos = (settings["avisos:notas"] || {}) as Record<string, string>;

  return {
    nome: idGeral["nome"] || SITE.nome,
    titulo: idGeral["titulo"] || SITE.titulo,
    foto: idGeral["foto"] || SITE.foto,
    fotoConsultorio: idGeral["foto_consultorio"] || "/consultorio.jpg",
    crp: idGeral["crp"] || SITE.crp,
    cidade: idGeral["cidade"] || contato["cidade"] || SITE.cidade,
    endereco: contato["endereco"] || SITE.endereco,
    telefone: contato["telefone"] || SITE.telefone,
    whatsapp: contato["whatsapp"] || SITE.whatsapp,
    email: contato["email"] || SITE.email,
    horario: contato["horario"] || SITE.horario,
    aviso: avisos["demonstrativo"] || SITE.aviso,
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

