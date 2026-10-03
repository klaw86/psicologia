import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Monitor, MapPin, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CtaFinal, SiteLayout } from "@/components/site/SiteLayout";
import { ESPECIALIDADES, FAQ, PASSOS, SITE } from "@/data/site";
import { depoimentosQuery } from "@/hooks/use-public-data";
import consultorio from "@/assets/consultorio.jpg";
import retrato from "@/assets/dra-maria.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dra. Maria Victória | Psicóloga em Lucas do Rio Verde e online" },
      { name: "description", content: "Psicoterapia acolhedora para ansiedade, depressão, luto e relacionamentos. Atendimento presencial em Lucas do Rio Verde/MT e online." },
      { property: "og:title", content: "Dra. Maria Victória | Psicóloga Clínica" },
      { property: "og:description", content: "Psicoterapia presencial e online. Agende sua consulta." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: depoimentos } = useQuery(depoimentosQuery);
  return (
    <SiteLayout>
      <section className="bg-hero">
        <div className="container-site grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div className="fade-up">
            <p className="eyebrow">{SITE.titulo} · {SITE.crp}</p>
            <h1 className="mt-4 text-4xl leading-tight text-sage-deep md:text-6xl">Um espaço seguro para você se escutar.</h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Psicoterapia com acolhimento e ética, presencial em {SITE.cidade} ou online, onde você estiver.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8"><Link to="/agendar">Agendar consulta</Link></Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8"><Link to="/especialidades">Como posso ajudar</Link></Button>
            </div>
            <div className="mt-8 flex gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Presencial</span>
              <span className="flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" />Online</span>
            </div>
          </div>
          <img src={consultorio} alt="Consultório acolhedor com poltrona verde-sálvia, sofá claro e plantas" width={1280} height={960} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft" />
        </div>
      </section>

      <section className="container-site mt-24">
        <p className="eyebrow">Como posso ajudar</p>
        <h2 className="mt-3 max-w-2xl text-3xl text-sage-deep md:text-4xl">Cada história merece ser cuidada com atenção.</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ESPECIALIDADES.map((e) => (
            <div key={e.titulo} className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-soft">
              <h3 className="text-xl text-sage-deep">{e.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-site mt-24 grid items-center gap-12 md:grid-cols-[2fr_3fr]">
        <img src={retrato} alt="Retrato da Dra. Maria Victória sorrindo" width={896} height={1120} loading="lazy" className="aspect-[4/5] w-full max-w-sm rounded-3xl object-cover shadow-soft" />
        <div>
          <p className="eyebrow">Sobre</p>
          <h2 className="mt-3 text-3xl text-sage-deep md:text-4xl">Olá, eu sou a Maria Victória.</h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Sou psicóloga clínica há mais de 10 anos e acredito que a terapia é um encontro: um lugar onde você pode ser quem é, sem julgamentos. Trabalho com a abordagem cognitivo-comportamental integrada a práticas de atenção plena.
          </p>
          <Button asChild variant="link" className="mt-4 px-0 text-primary"><Link to="/sobre">Conheça minha trajetória →</Link></Button>
        </div>
      </section>

      <section className="mt-24 bg-secondary/60 py-20">
        <div className="container-site">
          <p className="eyebrow">Como funciona</p>
          <h2 className="mt-3 text-3xl text-sage-deep md:text-4xl">Três passos simples</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {PASSOS.map((p) => (
              <div key={p.n}>
                <span className="font-display text-5xl text-primary/50">{p.n}</span>
                <h3 className="mt-2 text-xl text-sage-deep">{p.titulo}</h3>
                <p className="mt-2 text-muted-foreground">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-site mt-24">
        <p className="eyebrow">Depoimentos</p>
        <h2 className="mt-3 text-3xl text-sage-deep md:text-4xl">O que dizem os pacientes</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(depoimentos ?? []).map((d) => (
            <figure key={d.id} className="rounded-2xl bg-card p-6 shadow-soft">
              <Quote className="h-6 w-6 text-primary/60" aria-hidden />
              <blockquote className="mt-3 leading-relaxed">{d.texto}</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">— {d.autor}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Depoimentos fictícios, publicados com iniciais para preservar o sigilo.</p>
      </section>

      <section className="container-site mt-24 max-w-3xl">
        <p className="eyebrow">Dúvidas frequentes</p>
        <h2 className="mt-3 text-3xl text-sage-deep md:text-4xl">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="text-left text-base">{f.p}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.r}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <CtaFinal />
    </SiteLayout>
  );
}
