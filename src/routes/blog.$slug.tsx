import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CtaFinal, SiteLayout } from "@/components/site/SiteLayout";
import { Markdown } from "@/components/site/Markdown";
import { artigoQuery } from "@/hooks/use-public-data";
import { fmtData } from "@/lib/datas";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const artigo = await context.queryClient.ensureQueryData(artigoQuery(params.slug));
    if (!artigo) throw notFound();
    return { titulo: artigo.titulo, resumo: artigo.resumo };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Artigo não encontrado" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${loaderData.titulo} | Blog ${SITE.nome}` },
        { name: "description", content: loaderData.resumo },
        { property: "og:title", content: loaderData.titulo },
        { property: "og:description", content: loaderData.resumo },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "/helena-duarte.webp" },
        { name: "twitter:image", content: "/helena-duarte.webp" },
      ],
    };
  },
  notFoundComponent: ArtigoNaoEncontrado,
  errorComponent: ArtigoNaoEncontrado,
  component: Artigo,
});

function ArtigoNaoEncontrado() {
  return (
    <SiteLayout>
      <div className="container-site py-24 text-center">
        <h1 className="text-3xl text-wine font-medium">Artigo não encontrado</h1>
        <Link to="/blog" className="mt-4 inline-block text-wine hover:underline font-medium">Voltar ao blog</Link>
      </div>
    </SiteLayout>
  );
}

function Artigo() {
  const { slug } = Route.useParams();
  const { data: a } = useSuspenseQuery(artigoQuery(slug));
  if (!a) return null;
  return (
    <SiteLayout>
      <article className="container-site max-w-3xl py-16 md:py-24">
        <Link to="/blog" className="text-sm text-wine hover:underline font-medium">← Blog</Link>
        <p className="eyebrow mt-8">{a.categoria}</p>
        <h1 className="mt-3 text-4xl leading-tight text-wine font-medium md:text-5xl">{a.titulo}</h1>
        {a.publicado_em && <p className="mt-4 text-sm text-muted-foreground">{fmtData(a.publicado_em, { day: "2-digit", month: "long", year: "numeric" })}</p>}
        <p className="mt-8 text-xl leading-relaxed text-muted-foreground">{a.resumo}</p>
        <div className="mt-8"><Markdown texto={a.conteudo} /></div>
      </article>
      <CtaFinal />
    </SiteLayout>
  );
}
