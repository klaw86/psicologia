import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { disponibilidadeQuery } from "@/hooks/use-public-data";
import { addDias, diaLocal, diaSemana, fmtData, slotISO } from "@/lib/datas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  telefone: z.string().trim().min(8, "Telefone inválido").max(30),
  modalidade: z.enum(["presencial", "online"]),
  inicio: z.string().min(1, "Escolha um horário"),
  mensagem: z.string().trim().max(1000).optional(),
});

const DIAS_A_FRENTE = 21;

export function BookingForm() {
  const { data: disp } = useQuery(disponibilidadeQuery);
  const [hoje, setHoje] = useState<string | null>(null);
  useEffect(() => setHoje(diaLocal(new Date())), []);

  const dias = useMemo(() => {
    if (!hoje || !disp) return [];
    const out: string[] = [];
    for (let i = 1; i <= DIAS_A_FRENTE; i++) {
      const d = addDias(hoje, i);
      if (disp.some((x) => x.dia_semana === diaSemana(d))) out.push(d);
    }
    return out;
  }, [hoje, disp]);

  const [dia, setDia] = useState<string>("");
  useEffect(() => { if (!dia && dias[0]) setDia(dias[0]); }, [dias, dia]);

  const ocupados = useQuery({
    queryKey: ["ocupados", dias[0], dias[dias.length - 1]],
    enabled: dias.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("horarios_ocupados", { _de: dias[0]!, _ate: dias[dias.length - 1]! });
      if (error) throw error;
      return new Set((data as string[]).map((t) => new Date(t).toISOString()));
    },
  });

  const horarios = useMemo(() => {
    if (!dia || !disp) return [];
    const regra = disp.filter((x) => x.dia_semana === diaSemana(dia));
    const hs: string[] = [];
    regra.forEach((r) => {
      const ini = Number(r.hora_inicio.slice(0, 2));
      const fim = Number(r.hora_fim.slice(0, 2));
      for (let h = ini; h < fim; h++) if (h !== 12) hs.push(slotISO(dia, h));
    });
    return hs.filter((iso) => !ocupados.data?.has(iso));
  }, [dia, disp, ocupados.data]);

  const [form, setForm] = useState({ nome: "", email: "", telefone: "", modalidade: "presencial" as "presencial" | "online", inicio: "", mensagem: "" });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      setErros(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErros({});
    setEnviando(true);
    const { error } = await supabase.from("agendamentos").insert({
      nome: r.data.nome, email: r.data.email, telefone: r.data.telefone,
      modalidade: r.data.modalidade, inicio: r.data.inicio, mensagem: r.data.mensagem || null,
    });
    setEnviando(false);
    if (error) {
      toast.error(error.code === "23505" ? "Esse horário acabou de ser reservado. Escolha outro." : "Não foi possível enviar. Tente novamente.");
      ocupados.refetch();
      set("inicio", "");
      return;
    }
    setEnviado(r.data.inicio);
    ocupados.refetch();
  }

  if (enviado)
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h2 className="mt-4 text-2xl text-wine font-medium">Solicitação enviada!</h2>
        <p className="mt-3 text-muted-foreground">
          Recebemos seu pedido para {fmtData(enviado, { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}. Você receberá a confirmação em breve.
        </p>
        <Button className="mt-6 rounded-full border-border text-foreground hover:bg-secondary hover:text-wine font-medium" variant="outline" onClick={() => { setEnviado(null); setForm({ ...form, inicio: "", mensagem: "" }); }}>
          Fazer nova solicitação
        </Button>
      </div>
    );

  return (
    <form onSubmit={enviar} className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-10" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <Campo id="nome" label="Nome completo" erro={erros["nome"]}>
          <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} maxLength={120} autoComplete="name" />
        </Campo>
        <Campo id="email" label="E-mail" erro={erros["email"]}>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} autoComplete="email" />
        </Campo>
        <Campo id="telefone" label="Telefone / WhatsApp" erro={erros["telefone"]}>
          <Input id="telefone" type="tel" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} maxLength={30} autoComplete="tel" placeholder="(65) 90000-0000" />
        </Campo>
        <div className="grid gap-2">
          <Label>Modalidade</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["presencial", "online"] as const).map((m) => (
              <button type="button" key={m} onClick={() => set("modalidade", m)}
                className={cn("rounded-xl border px-4 py-2.5 text-sm capitalize transition cursor-pointer", form.modalidade === m ? "border-gold bg-accent text-wine font-semibold shadow-xs" : "border-input hover:bg-muted text-foreground")}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <Label>Data</Label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dias.map((d) => (
            <button type="button" key={d} onClick={() => { setDia(d); set("inicio", ""); }}
              className={cn("flex min-w-16 flex-col items-center rounded-xl border px-3 py-2 text-sm transition cursor-pointer", d === dia ? "border-gold bg-gold text-charcoal font-semibold shadow-xs" : "border-input hover:bg-muted text-foreground")}>
              <span className="text-[11px] uppercase">{fmtData(d + "T12:00:00-04:00", { weekday: "short" })}</span>
              <span className="text-lg font-semibold">{d.slice(8)}</span>
              <span className="text-[11px]">{fmtData(d + "T12:00:00-04:00", { month: "short" })}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <Label>Horários livres</Label>
        {ocupados.isLoading ? <p className="text-sm text-muted-foreground">Carregando horários…</p> : horarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem horários livres neste dia. Escolha outra data.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {horarios.map((iso) => (
              <button type="button" key={iso} onClick={() => set("inicio", iso)}
                className={cn("rounded-lg border py-2 text-sm transition cursor-pointer", form.inicio === iso ? "border-gold bg-gold text-charcoal font-semibold shadow-xs" : "border-input hover:bg-muted text-foreground")}>
                {fmtData(iso, { hour: "2-digit", minute: "2-digit" })}
              </button>
            ))}
          </div>
        )}
        {erros["inicio"] && <p className="text-sm text-destructive">{erros["inicio"]}</p>}
      </div>

      <Campo id="mensagem" label="Mensagem (opcional)">
        <Textarea id="mensagem" rows={4} value={form.mensagem} onChange={(e) => set("mensagem", e.target.value)} maxLength={1000} placeholder="Conte brevemente o que te traz, se quiser." />
      </Campo>

      <p className="text-xs text-muted-foreground">Seus dados são usados apenas para o contato sobre a consulta, conforme a Política de Privacidade.</p>
      <Button type="submit" size="lg" className="rounded-full bg-gold text-charcoal hover:bg-gold-hover font-medium shadow-sm" disabled={enviando}>{enviando ? "Enviando…" : "Solicitar agendamento"}</Button>
    </form>
  );
}

function Campo({ id, label, erro, children }: { id: string; label: string; erro?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </div>
  );
}
