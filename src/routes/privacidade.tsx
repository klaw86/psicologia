import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: `Política de Privacidade | ${SITE.nome}` },
      { name: "description", content: "Como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a LGPD." },
      { property: "og:title", content: `Política de Privacidade | ${SITE.nome}` },
      { property: "og:description", content: "Tratamento de dados pessoais conforme a LGPD." },
      { property: "og:image", content: "/helena-duarte.webp" },
      { name: "twitter:image", content: "/helena-duarte.webp" },
    ],
  }),
  component: Privacidade,
});

const SECOES = [
  ["Dados coletados", "Coletamos nome, e-mail, telefone, modalidade, data desejada e a mensagem opcional enviada nos formulários de agendamento e contato."],
  ["Finalidade", "Os dados são utilizados exclusivamente para contato, agendamento e organização dos atendimentos. Não são vendidos nem compartilhados com terceiros para fins comerciais."],
  ["Sigilo profissional", "Informações clínicas seguem o Código de Ética Profissional do Psicólogo e são mantidas sob sigilo."],
  ["Armazenamento e segurança", "Os dados ficam em ambiente protegido, com acesso restrito à profissional responsável."],
  ["Seus direitos (LGPD)", "Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail de contato."],
  ["Contato", `Dúvidas sobre esta política: ${SITE.email}.`],
];

function Privacidade() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Transparência" titulo="Política de Privacidade" texto={`Última atualização: outubro de 2026. ${SITE.aviso}.`} />
      <section className="container-site mt-16 max-w-3xl space-y-8">
        {SECOES.map(([t, x]) => (
          <div key={t}>
            <h2 className="text-2xl text-wine font-medium">{t}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{x}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
