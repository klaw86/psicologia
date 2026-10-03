// Todas as datas são exibidas no fuso do consultório (Cuiabá, UTC-4).
export const TZ = "America/Cuiaba";
export const OFFSET = "-04:00";

export function slotISO(dia: string, hora: number) {
  return new Date(`${dia}T${String(hora).padStart(2, "0")}:00:00${OFFSET}`).toISOString();
}

export function diaLocal(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function horaLocal(d: Date) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(d));
}

export function fmtData(d: string | Date, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, ...opts }).format(new Date(d));
}

export function fmtDataHora(d: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

/** dd/mm a partir de YYYY-MM-DD */
export function addDias(dia: string, n: number) {
  const d = new Date(`${dia}T12:00:00${OFFSET}`);
  d.setUTCDate(d.getUTCDate() + n);
  return diaLocal(d);
}

export function diaSemana(dia: string) {
  return new Date(`${dia}T12:00:00${OFFSET}`).getUTCDay();
}

export function inicioDaSemana(dia: string) {
  const dow = diaSemana(dia);
  return addDias(dia, dow === 0 ? -6 : 1 - dow);
}

export const STATUS = {
  solicitado: { label: "Solicitado", cls: "bg-warning/15 text-secondary-foreground border-warning/40" },
  confirmado: { label: "Confirmado", cls: "bg-primary/15 text-sage-deep border-primary/40" },
  realizado: { label: "Realizado", cls: "bg-info/15 text-foreground border-info/40" },
  cancelado: { label: "Cancelado", cls: "bg-muted text-muted-foreground border-border line-through" },
  faltou: { label: "Faltou", cls: "bg-destructive/15 text-destructive border-destructive/40" },
} as const;
export type Status = keyof typeof STATUS;
