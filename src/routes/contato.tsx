import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, MessageCircle, Phone, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE, whatsappLink } from "@/data/site";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Psicóloga em Lucas do Rio Verde/MT" },
      { name: "description", content: "Endereço, telefone, WhatsApp e formulário de contato do consultório da Dra. Maria Victória." },
      { property: "og:title", content: "Contato – Dra. Maria Victória" },
      { property: "og:description", content: "Fale com o consultório." },
    ],
  }),
  component: Contato,
});

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  telefone: z.string().trim().max(30).optional(),
  mensagem: z.string().trim().min(5, "Escreva sua mensagem").max(1000),
});

function Contato() {
  const vazio = { nome: "", email: "", telefone: "", mensagem: "" };
  const [f, setF] = useState(vazio);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) return setErros(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
    setErros({});
    setEnviando(true);
    const { error } = await supabase.from("mensagens_contato").insert({ nome: r.data.nome, email: r.data.email, telefone: r.data.telefone || null, mensagem: r.data.mensagem });
    setEnviando(false);
    if (error) return toast.error("Não foi possível enviar. Tente novamente.");
    toast.success("Mensagem enviada! Retornaremos em breve.");
    setF(vazio);
  }

  const itens = [
    { icon: MapPin, t: SITE.endereco },
    { icon: Phone, t: SITE.telefone },
    { icon: Mail, t: SITE.email },
    { icon: Clock, t: SITE.horario },
  ];

  return (
    <SiteLayout>
      <PageHeader eyebrow="Contato" titulo="Vamos conversar?" texto="Tire suas dúvidas ou envie uma mensagem. Respondo em até um dia útil." />
      <section className="container-site mt-16 grid gap-12 md:grid-cols-2">
        <div className="space-y-5">
          {itens.map(({ icon: I, t }) => (
            <p key={t} className="flex gap-3"><I className="mt-0.5 h-5 w-5 shrink-0 text-gold" /> {t}</p>
          ))}
          <Button asChild className="rounded-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 shadow-sm">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Chamar no WhatsApp</a>
          </Button>
        </div>
        <form onSubmit={enviar} noValidate className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
          {(["nome", "email", "telefone"] as const).map((k) => (
            <div key={k} className="grid gap-2">
              <Label htmlFor={k}>{k === "nome" ? "Nome" : k === "email" ? "E-mail" : "Telefone (opcional)"}</Label>
              <Input id={k} type={k === "email" ? "email" : k === "telefone" ? "tel" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} maxLength={k === "email" ? 255 : 120} />
              {erros[k] && <p className="text-sm text-destructive">{erros[k]}</p>}
            </div>
          ))}
          <div className="grid gap-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea id="mensagem" rows={5} value={f.mensagem} onChange={(e) => setF({ ...f, mensagem: e.target.value })} maxLength={1000} />
            {erros["mensagem"] && <p className="text-sm text-destructive">{erros["mensagem"]}</p>}
          </div>
          <Button type="submit" className="rounded-full bg-gold text-charcoal hover:bg-gold-hover font-medium shadow-sm" disabled={enviando}>{enviando ? "Enviando…" : "Enviar mensagem"}</Button>
        </form>
      </section>
    </SiteLayout>
  );
}
