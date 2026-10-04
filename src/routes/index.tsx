import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Monitor, MapPin, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CtaFinal, SiteLayout } from "@/components/site/SiteLayout";
import { ESPECIALIDADES, FAQ, PASSOS, SITE } from "@/data/site";
import { depoimentosQuery, usePageContent, useSiteSettings } from "@/hooks/use-public-data";
import consultorio from "@/assets/consultorio.jpg";
import retrato from "@/assets/helena-duarte.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.nome} | Psicóloga em Lucas do Rio Verde e online` },
      { name: "description", content: "Psicoterapia acolhedora para ansiedade, depressão, luto e relacionamentos. Atendimento presencial em Lucas do Rio Verde/MT e online." },
      { property: "og:title", content: `${SITE.nome} | ${SITE.titulo}` },
      { property: "og:description", content: "Psicoterapia presencial e online. Agende sua consulta." },
      { property: "og:image", content: "/helena-duarte.webp" },
      { name: "twitter:image", content: "/helena-duarte.webp" },
    ],
  }),
  component: Index,
});

function Index() {
  const site = useSiteSettings();
  const { getBlock } = usePageContent("inicio");
  const { data: depoimentos } = useQuery(depoimentosQuery);

  const heroBadge = getBlock("hero", "badge", `${site.titulo} · ${site.crp}`);
  const heroTitulo = getBlock("hero", "titulo", "Um espaço seguro para você se escutar.");
  const heroSubtitulo = getBlock("hero", "subtitulo", `Psicoterapia com acolhimento e ética, presencial em ${site.cidade} ou online, onde você estiver.`);
  const heroCta1 = getBlock("hero", "cta_primario", { label: "Agendar consulta", link: "/agendar" });
  const heroCta2 = getBlock("hero", "cta_secundario", { label: "Como posso ajudar", link: "/especialidades" });

  const sobreEyebrow = getBlock("sobre_resumo", "eyebrow", "Sobre");
  const sobreTitulo = getBlock("sobre_resumo", "titulo", "Olá, eu sou a Helena Duarte.");
  const sobreTexto = getBlock("sobre_resumo", "texto", "Sou psicóloga clínica há mais de 10 anos e acredito que a terapia é um encontro: um lugar onde você pode ser quem é, sem julgamentos. Trabalho com a abordagem cognitivo-comportamental integrada a práticas de atenção plena.");
  const sobreLinkTexto = getBlock("sobre_resumo", "link_texto", "Conheça minha trajetória →");

  const comoFuncionaEyebrow = getBlock("como_funciona", "eyebrow", "Como funciona");
  const comoFuncionaTitulo = getBlock("como_funciona", "titulo", "Três passos simples");
  const passosLista = getBlock("como_funciona", "passos", PASSOS);

  const depoimentosEyebrow = getBlock("depoimentos", "eyebrow", "Depoimentos");
  const depoimentosTitulo = getBlock("depoimentos", "titulo", "O que dizem os pacientes");
  const depoimentosAviso = getBlock("depoimentos", "aviso", "Depoimentos fictícios, publicados com iniciais para preservar o sigilo.");

  const faqEyebrow = getBlock("faq", "eyebrow", "Dúvidas frequentes");
  const faqTitulo = getBlock("faq", "titulo", "Perguntas frequentes");
  const faqItens = getBlock("faq", "itens", FAQ);

  return (
    <SiteLayout>
      <section className="bg-hero">
        <div className="container-site grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div className="fade-up">
            <p className="eyebrow">{heroBadge}</p>
            <h1 className="mt-4 text-4xl leading-tight text-wine md:text-6xl">{heroTitulo}</h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              {heroSubtitulo}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 bg-gold text-charcoal hover:bg-gold-hover font-medium shadow-sm">
                <Link to={heroCta1.link}>{heroCta1.label}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-border text-foreground hover:bg-secondary hover:text-wine font-medium">
                <Link to={heroCta2.link}>{heroCta2.label}</Link>
              </Button>
            </div>
            <div className="mt-8 flex gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />Presencial</span>
              <span className="flex items-center gap-2"><Monitor className="h-4 w-4 text-gold" />Online</span>
            </div>
          </div>
          <img src={consultorio} alt="Consultório acolhedor com poltrona confortável, sofá claro e plantas" width={1280} height={960} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft" />
        </div>
      </section>

      <section className="container-site mt-24">
        <p className="eyebrow">Como posso ajudar</p>
        <h2 className="mt-3 max-w-2xl text-3xl text-wine md:text-4xl">Cada história merece ser cuidada com atenção.</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ESPECIALIDADES.map((e) => (
            <div key={e.titulo} className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-soft hover:border-gold/40">
              <h3 className="text-xl text-wine font-medium">{e.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-site mt-24 grid items-center gap-12 md:grid-cols-[2fr_3fr]">
        <img
          src={retrato}
          alt="Dra. Helena Duarte, psicóloga clínica"
          width={1200}
          height={1500}
          loading="lazy"
          className="aspect-[4/5] w-full max-w-sm rounded-3xl object-cover object-[50%_25%] shadow-soft"
        />
        <div>
          <p className="eyebrow">{sobreEyebrow}</p>
          <h2 className="mt-3 text-3xl text-wine md:text-4xl">{sobreTitulo}</h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            {sobreTexto}
          </p>
          <Button asChild variant="link" className="mt-4 px-0 text-wine hover:text-wine-hover font-medium">
            <Link to="/sobre">{sobreLinkTexto}</Link>
          </Button>
        </div>
      </section>

      <section className="mt-24 bg-secondary/60 py-20">
        <div className="container-site">
          <p className="eyebrow">{comoFuncionaEyebrow}</p>
          <h2 className="mt-3 text-3xl text-wine md:text-4xl">{comoFuncionaTitulo}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {passosLista.map((p) => (
              <div key={p.n}>
                <span className="font-display text-5xl text-gold/70">{p.n}</span>
                <h3 className="mt-2 text-xl text-wine font-medium">{p.titulo}</h3>
                <p className="mt-2 text-muted-foreground">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-site mt-24">
        <p className="eyebrow">{depoimentosEyebrow}</p>
        <h2 className="mt-3 text-3xl text-wine md:text-4xl">{depoimentosTitulo}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(depoimentos ?? []).map((d) => (
            <figure key={d.id} className="rounded-2xl border border-border/80 bg-card p-6 shadow-soft">
              <Quote className="h-6 w-6 text-gold" aria-hidden />
              <blockquote className="mt-3 leading-relaxed text-foreground">{d.texto}</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">— {d.autor}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{depoimentosAviso}</p>
      </section>

      <section className="container-site mt-24 max-w-3xl">
        <p className="eyebrow">{faqEyebrow}</p>
        <h2 className="mt-3 text-3xl text-wine md:text-4xl">{faqTitulo}</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqItens.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="text-left text-base text-foreground hover:text-wine">{f.p}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.r}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <CtaFinal />
    </SiteLayout>
  );
}
