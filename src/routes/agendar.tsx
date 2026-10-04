import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { BookingForm } from "@/components/site/BookingForm";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: `Agendar consulta | ${SITE.nome}` },
      { name: "description", content: "Escolha um horário livre e solicite sua consulta de psicoterapia, presencial ou online." },
      { property: "og:title", content: `Agendar consulta | ${SITE.nome}` },
      { property: "og:description", content: "Veja horários livres e solicite sua consulta." },
      { property: "og:image", content: "/helena-duarte.webp" },
      { name: "twitter:image", content: "/helena-duarte.webp" },
    ],
  }),
  component: Agendar,
});

import { usePageContent } from "@/hooks/use-public-data";

function Agendar() {
  const { getBlock } = usePageContent("agendar");
  const eyebrow = getBlock("header", "eyebrow", "Agendamento");
  const titulo = getBlock("header", "titulo", "Agende sua consulta");
  const texto = getBlock("header", "texto", "Escolha a modalidade, a data e um horário livre. A confirmação é feita por WhatsApp ou e-mail.");

  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} titulo={titulo} texto={texto} />
      <section className="container-site mt-12 max-w-3xl">
        <ClientOnly fallback={<p className="text-muted-foreground">Carregando formulário…</p>}>
          <BookingForm />
        </ClientOnly>
      </section>
    </SiteLayout>
  );
}
