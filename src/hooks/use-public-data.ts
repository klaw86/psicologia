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
