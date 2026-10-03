import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, MessageCircle, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV, SITE, whatsappLink } from "@/data/site";

function Header() {
  const [aberto, setAberto] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between">
        <Link to="/" className="flex flex-col leading-tight" onClick={() => setAberto(false)}>
          <span className="font-display text-lg text-sage-deep">{SITE.nome}</span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{SITE.titulo}</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground font-semibold" }} activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
          <Button asChild size="sm" className="rounded-full px-5">
            <Link to="/agendar">Agendar consulta</Link>
          </Button>
        </nav>
        <button className="md:hidden" onClick={() => setAberto(!aberto)} aria-label={aberto ? "Fechar menu" : "Abrir menu"}>
          {aberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {aberto && (
        <nav className="container-site flex flex-col gap-1 pb-5 md:hidden" aria-label="Menu móvel">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setAberto(false)} className="rounded-lg px-2 py-3 text-base hover:bg-muted">
              {n.label}
            </Link>
          ))}
          <Button asChild className="mt-2 rounded-full">
            <Link to="/agendar" onClick={() => setAberto(false)}>Agendar consulta</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="container-site grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-sage-deep">{SITE.nome}</p>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.titulo} · {SITE.crp}</p>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Atendimento presencial em {SITE.cidade} e online para todo o Brasil.</p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" />{SITE.endereco}</p>
          <p className="flex gap-2"><Phone className="h-4 w-4 text-primary" />{SITE.telefone}</p>
          <p className="flex gap-2"><Mail className="h-4 w-4 text-primary" />{SITE.email}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {NAV.map((n) => <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-foreground">{n.label}</Link>)}
          <Link to="/privacidade" className="text-muted-foreground hover:text-foreground">Política de Privacidade</Link>
          <Link to="/admin" className="text-muted-foreground hover:text-foreground">Área administrativa</Link>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        <p className="font-semibold">{SITE.aviso}</p>
        <p className="mt-1">Em caso de crise, ligue 188 (CVV) ou 192 (SAMU).</p>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Conversar pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-soft transition-transform hover:scale-105">
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export function PageHeader({ eyebrow, titulo, texto }: { eyebrow: string; titulo: string; texto?: string }) {
  return (
    <section className="bg-hero">
      <div className="container-site py-16 md:py-24 fade-up">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl text-sage-deep md:text-5xl">{titulo}</h1>
        {texto && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{texto}</p>}
      </div>
    </section>
  );
}

export function CtaFinal() {
  return (
    <section className="container-site mt-24">
      <div className="rounded-3xl bg-sage-deep px-6 py-14 text-center text-primary-foreground md:px-16">
        <h2 className="text-3xl md:text-4xl">Dar o primeiro passo é um ato de cuidado.</h2>
        <p className="mx-auto mt-4 max-w-xl opacity-85">Escolha um horário livre e solicite sua primeira consulta, presencial ou online.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="rounded-full px-8"><Link to="/agendar">Agendar consulta</Link></Button>
          <Button asChild size="lg" variant="ghost" className="rounded-full px-8 hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
