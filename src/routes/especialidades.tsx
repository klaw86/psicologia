import { createFileRoute } from "@tanstack/react-router";
import { CtaFinal, PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ESPECIALIDADES, SITE } from "@/data/site";

export const Route = createFileRoute("/especialidades")({
  head: () => ({
    meta: [
      { title: `Especialidades | ${SITE.nome}` },
      { name: "description", content: "Áreas de atuação em psicoterapia: ansiedade, depressão, luto, relacionamentos, burnout e maternidade." },
      { property: "og:title", content: `Especialidades – ${SITE.nome}` },
      { property: "og:description", content: "Conheça as demandas atendidas na psicoterapia." },
      { property: "og:image", content: "/helena-duarte.webp" },
      { name: "twitter:image", content: "/helena-duarte.webp" },
    ],
  }),
  component: Especialidades,
});

import { usePageContent } from "@/hooks/use-public-data";

function Especialidades() {
  const { getBlock } = usePageContent("especialidades");
  const eyebrow = getBlock("header", "eyebrow", "Especialidades");
  const titulo = getBlock("header", "titulo", "Como a terapia pode te ajudar");
  const texto = getBlock("header", "texto", "Algumas das demandas mais frequentes no consultório. Se a sua não está aqui, converse comigo.");
  const lista = getBlock("lista", "itens", ESPECIALIDADES);

  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} titulo={titulo} texto={texto} />
      <section className="container-site mt-16 grid gap-6 md:grid-cols-2">
        {lista.map((e, i) => (
          <article key={e.titulo} className="rounded-3xl border border-border bg-card p-8 shadow-xs hover:border-gold/40 transition">
            <span className="font-display text-sm text-gold font-bold">0{i + 1}</span>
            <h2 className="mt-2 text-2xl text-wine font-medium">{e.titulo}</h2>
            <p className="mt-3 leading-relaxed text-foreground">{e.texto}</p>
            <p className="mt-3 text-sm text-muted-foreground">{e.detalhe}</p>
          </article>
        ))}
      </section>
      <CtaFinal />
    </SiteLayout>
  );
}
