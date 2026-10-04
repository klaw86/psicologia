import { createFileRoute } from "@tanstack/react-router";
import { CtaFinal, PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/data/site";
import retrato from "@/assets/helena-duarte.webp";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: `Sobre a ${SITE.nome} | ${SITE.titulo}` },
      { name: "description", content: `Formação, abordagem e trajetória da psicóloga clínica ${SITE.nome}, com atendimento em Lucas do Rio Verde/MT e online.` },
      { property: "og:title", content: `Sobre a ${SITE.nome}` },
      { property: "og:description", content: "Conheça a formação e a abordagem terapêutica." },
      { property: "og:image", content: "/helena-duarte.webp" },
      { name: "twitter:image", content: "/helena-duarte.webp" },
    ],
  }),
  component: Sobre,
});

import { usePageContent, useSiteSettings } from "@/hooks/use-public-data";

const FORMACAO = [
  "Graduação em Psicologia – Universidade Fictícia (2013)",
  "Especialização em Terapia Cognitivo-Comportamental (2016)",
  "Formação em Mindfulness e Terapias Contextuais (2019)",
  "Aperfeiçoamento em Luto e Perdas (2021)",
];

function Sobre() {
  const site = useSiteSettings();
  const { getBlock } = usePageContent("sobre");

  const headerEyebrow = getBlock("header", "eyebrow", "Sobre");
  const headerTitulo = getBlock("header", "titulo", "Psicologia com escuta, ciência e afeto");
  const bioParagrafos = getBlock("bio", "paragrafos", [
    "Comecei na Psicologia movida pela curiosidade sobre o que nos faz sofrer e, principalmente, sobre o que nos ajuda a seguir. Ao longo de mais de uma década de clínica, aprendi que cada pessoa traz um caminho único — e que o cuidado precisa respeitar isso.",
    "Minha abordagem principal é a Terapia Cognitivo-Comportamental (TCC), integrada a práticas de atenção plena. Trabalho de forma colaborativa: construímos juntos objetivos, compreensões e estratégias para o seu dia a dia.",
    `Atendo adolescentes a partir de 16 anos e adultos, presencialmente em ${site.cidade} e online para todo o Brasil.`,
  ]);
  const formacaoTitulo = getBlock("formacao", "titulo", "Formação");
  const formacaoItens = getBlock("formacao", "itens", FORMACAO);

  return (
    <SiteLayout>
      <PageHeader eyebrow={headerEyebrow} titulo={headerTitulo} texto={`${site.nome} · ${site.crp}`} />
      <section className="container-site mt-16 grid gap-12 md:grid-cols-[2fr_3fr]">
        <img
          src={retrato}
          alt={`${site.nome}, psicóloga clínica`}
          width={1200}
          height={1500}
          loading="lazy"
          className="aspect-[4/5] w-full max-w-sm rounded-3xl object-cover object-[50%_25%] shadow-soft"
        />
        <div className="space-y-5 leading-relaxed text-muted-foreground">
          {bioParagrafos.map((p: string, idx: number) => (
            <p key={idx}>{p}</p>
          ))}
          <h2 className="pt-4 text-2xl text-wine font-medium">{formacaoTitulo}</h2>
          <ul className="space-y-2">
            {formacaoItens.map((f: string) => <li key={f} className="border-l-2 border-gold pl-4">{f}</li>)}
          </ul>
        </div>
      </section>
      <CtaFinal />
    </SiteLayout>
  );
}
