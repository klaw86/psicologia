import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, MessageCircle, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV, SITE, whatsappLink } from "@/data/site";
import { useSiteSettings } from "@/hooks/use-public-data";

function Header() {
  const [aberto, setAberto] = useState(false);
  const site = useSiteSettings();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between">
        <Link to="/" className="flex flex-col leading-tight" onClick={() => setAberto(false)}>
          <span className="font-display text-lg text-wine font-semibold tracking-tight">{site.nome}</span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{site.titulo}</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {site.menu.itens.filter((n) => n.visivel !== false).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-foreground/80 transition-colors hover:text-wine"
              activeProps={{ className: "text-wine font-semibold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <Button asChild size="sm" className="rounded-full px-5 bg-gold text-charcoal hover:bg-gold-hover font-medium shadow-xs">
            <Link to={site.menu.cta.to}>{site.menu.cta.label}</Link>
          </Button>
        </nav>
        <button className="md:hidden text-foreground hover:text-wine" onClick={() => setAberto(!aberto)} aria-label={aberto ? "Fechar menu" : "Abrir menu"}>
          {aberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {aberto && (
        <nav className="container-site flex flex-col gap-1 pb-5 md:hidden border-b border-border bg-background" aria-label="Menu móvel">
          {site.menu.itens.filter((n) => n.visivel !== false).map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setAberto(false)} className="rounded-lg px-2 py-3 text-base text-foreground hover:text-wine hover:bg-muted">
              {n.label}
            </Link>
          ))}
          <Button asChild className="mt-2 rounded-full bg-gold text-charcoal hover:bg-gold-hover font-medium">
            <Link to={site.menu.cta.to} onClick={() => setAberto(false)}>{site.menu.cta.label}</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const site = useSiteSettings();
  return (
    <footer className="mt-24 border-t border-[#333336] bg-charcoal text-ivory">
      <div className="container-site grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-ivory font-medium">{site.nome}</p>
          <p className="mt-1 text-sm text-[#C8C3BA]">{site.titulo} · {site.crp}</p>
          <p className="mt-4 max-w-xs text-sm text-[#C8C3BA]">{site.rodape.texto}</p>
        </div>
        <div className="space-y-2 text-sm text-[#C8C3BA]">
          <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-gold" />{site.endereco}</p>
          <p className="flex gap-2"><Phone className="h-4 w-4 text-gold" />{site.telefone}</p>
          <p className="flex gap-2"><Mail className="h-4 w-4 text-gold" />{site.email}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {site.menu.itens.filter((n) => n.visivel !== false).map((n) => <Link key={n.to} to={n.to} className="text-[#C8C3BA] transition-colors hover:text-gold">{n.label}</Link>)}
          <Link to="/privacidade" className="text-[#C8C3BA] transition-colors hover:text-gold">Política de Privacidade</Link>
          <Link to="/admin/ajustes" className="text-xs text-[#8A857B] transition-colors hover:text-gold pt-2">Painel /admin</Link>
        </div>
      </div>
      <div className="border-t border-[#333336] py-5 text-center text-xs text-[#A29C92] space-y-1">
        <p className="font-semibold text-ivory/90">{site.aviso}</p>
        <p>{site.rodape.direitos}</p>
        <p className="text-[11px] text-[#8A857B]">{site.emergencia}</p>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  const site = useSiteSettings();
  const link = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de informações sobre consultas.")}`;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" aria-label="Conversar pelo WhatsApp"
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
    <section className="bg-hero border-b border-border/50">
      <div className="container-site py-16 md:py-24 fade-up">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl text-wine md:text-5xl">{titulo}</h1>
        {texto && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{texto}</p>}
      </div>
    </section>
  );
}

export function CtaFinal() {
  const site = useSiteSettings();
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de informações sobre consultas.")}`;
  return (
    <section className="container-site mt-24">
      <div className="rounded-3xl bg-charcoal px-6 py-14 text-center text-ivory shadow-xl md:px-16 border border-[#333336]">
        <h2 className="text-3xl md:text-4xl text-ivory font-display">Dar o primeiro passo é um ato de cuidado.</h2>
        <p className="mx-auto mt-4 max-w-xl text-[#DDD7CD]">Escolha um horário livre e solicite sua primeira consulta, presencial ou online.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full px-8 bg-gold text-charcoal hover:bg-gold-hover font-medium shadow-md">
            <Link to="/agendar">Agendar consulta</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-gold/70 text-gold hover:bg-gold/10 hover:text-gold">
            <a href={wa} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
