import { createFileRoute } from "@tanstack/react-router";
import { CtaFinal, PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/data/site";
import retrato from "@/assets/dra-maria.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Dra. Maria Victória | Psicóloga Clínica" },
      { name: "description", content: "Formação, abordagem e trajetória da psicóloga clínica Maria Victória, com atendimento em Lucas do Rio Verde/MT e online." },
      { property: "og:title", content: "Sobre a Dra. Maria Victória" },
      { property: "og:description", content: "Conheça a formação e a abordagem terapêutica." },
    ],
  }),
  component: Sobre,
});

const FORMACAO = [
  "Graduação em Psicologia – Universidade Fictícia (2013)",
  "Especialização em Terapia Cognitivo-Comportamental (2016)",
  "Formação em Mindfulness e Terapias Contextuais (2019)",
  "Aperfeiçoamento em Luto e Perdas (2021)",
];

function Sobre() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Sobre" titulo="Psicologia com escuta, ciência e afeto" texto={`${SITE.nome} · ${SITE.crp}`} />
      <section className="container-site mt-16 grid gap-12 md:grid-cols-[2fr_3fr]">
        <img src={retrato} alt="Dra. Maria Victória em seu consultório" width={896} height={1120} loading="lazy" className="aspect-[4/5] w-full max-w-sm rounded-3xl object-cover shadow-soft" />
        <div className="space-y-5 leading-relaxed text-muted-foreground">
          <p>Comecei na Psicologia movida pela curiosidade sobre o que nos faz sofrer e, principalmente, sobre o que nos ajuda a seguir. Ao longo de mais de uma década de clínica, aprendi que cada pessoa traz um caminho único — e que o cuidado precisa respeitar isso.</p>
          <p>Minha abordagem principal é a Terapia Cognitivo-Comportamental (TCC), integrada a práticas de atenção plena. Trabalho de forma colaborativa: construímos juntos objetivos, compreensões e estratégias para o seu dia a dia.</p>
          <p>Atendo adolescentes a partir de 16 anos e adultos, presencialmente em {SITE.cidade} e online para todo o Brasil.</p>
          <h2 className="pt-4 text-2xl text-wine font-medium">Formação</h2>
          <ul className="space-y-2">
            {FORMACAO.map((f) => <li key={f} className="border-l-2 border-gold pl-4">{f}</li>)}
          </ul>
        </div>
      </section>
      <CtaFinal />
    </SiteLayout>
  );
}
