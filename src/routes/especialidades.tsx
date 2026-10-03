import { createFileRoute } from "@tanstack/react-router";
import { CtaFinal, PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ESPECIALIDADES } from "@/data/site";

export const Route = createFileRoute("/especialidades")({
  head: () => ({
    meta: [
      { title: "Especialidades | Ansiedade, depressão, luto e mais" },
      { name: "description", content: "Áreas de atuação em psicoterapia: ansiedade, depressão, luto, relacionamentos, burnout e maternidade." },
      { property: "og:title", content: "Especialidades – Dra. Maria Victória" },
      { property: "og:description", content: "Conheça as demandas atendidas na psicoterapia." },
    ],
  }),
  component: Especialidades,
});

function Especialidades() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Especialidades" titulo="Como a terapia pode te ajudar" texto="Algumas das demandas mais frequentes no consultório. Se a sua não está aqui, converse comigo." />
      <section className="container-site mt-16 grid gap-6 md:grid-cols-2">
        {ESPECIALIDADES.map((e, i) => (
          <article key={e.titulo} className="rounded-3xl border border-border bg-card p-8">
            <span className="font-display text-sm text-primary">0{i + 1}</span>
            <h2 className="mt-2 text-2xl text-sage-deep">{e.titulo}</h2>
            <p className="mt-3 leading-relaxed">{e.texto}</p>
            <p className="mt-3 text-sm text-muted-foreground">{e.detalhe}</p>
          </article>
        ))}
      </section>
      <CtaFinal />
    </SiteLayout>
  );
}
