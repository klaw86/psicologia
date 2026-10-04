import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { artigosQuery } from "@/hooks/use-public-data";
import { fmtData } from "@/lib/datas";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: `Blog | Saúde emocional – ${SITE.nome}` },
      { name: "description", content: "Artigos sobre ansiedade, autocuidado, luto e terapia online para cuidar da saúde emocional." },
      { property: "og:title", content: `Blog – ${SITE.nome}` },
      { property: "og:description", content: "Reflexões sobre saúde emocional." },
      { property: "og:image", content: "/helena-duarte.webp" },
      { name: "twitter:image", content: "/helena-duarte.webp" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(artigosQuery),
  errorComponent: () => <SiteLayout><p className="container-site py-24">Não foi possível carregar os artigos.</p></SiteLayout>,
  component: Blog,
});

function Blog() {
  const { data } = useSuspenseQuery(artigosQuery);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Blog" titulo="Leituras para cuidar de si" />
      <section className="container-site mt-16 grid gap-6 md:grid-cols-2">
        {data.map((a) => (
          <Link key={a.id} to="/blog/$slug" params={{ slug: a.slug }} className="group rounded-3xl border border-border bg-card p-8 transition hover:shadow-soft hover:border-gold/40">
            <p className="eyebrow">{a.categoria}</p>
            <h2 className="mt-3 text-2xl text-wine font-medium group-hover:text-gold transition-colors">{a.titulo}</h2>
            <p className="mt-3 text-muted-foreground">{a.resumo}</p>
            {a.publicado_em && <p className="mt-5 text-xs text-muted-foreground">{fmtData(a.publicado_em)}</p>}
          </Link>
        ))}
      </section>
    </SiteLayout>
  );
}
