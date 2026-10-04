import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Palette,
  Type,
  User,
  Phone,
  Menu as MenuIcon,
  Layout,
  Globe,
  Calendar,
  MessageSquare,
  AlertCircle,
  History,
  RotateCcw,
  Save,
  Eye,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Shield,
  Smartphone,
  Monitor,
  X,
  Lock,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import {
  useSiteSettings,
  applyThemeColors,
  LUXURY_EDITORIAL_COLORS,
  siteSettingsQuery,
  contentBlocksQuery,
} from "@/hooks/use-public-data";
import { SITE, NAV, ESPECIALIDADES, PASSOS, FAQ } from "@/data/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes do Site | Painel Administrativo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAjustes,
});

function AdminAjustes() {
  const queryClient = useQueryClient();
  const site = useSiteSettings();

  // Estados locais para edição
  const [salvando, setSalvando] = useState(false);
  const [houveAlteracao, setHouveAlteracao] = useState(false);
  const [previewAberto, setPreviewAberto] = useState(false);
  const [previewMobile, setPreviewMobile] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("identidade");
  const [userAdmin, setUserAdmin] = useState<boolean | null>(null);

  // 1. Identidade
  const [identidade, setIdentidade] = useState({
    nome: site.nome,
    titulo: site.titulo,
    crp: site.crp,
    foto: site.foto,
    fotoConsultorio: site.fotoConsultorio,
    logo: site.logo,
    favicon: site.favicon,
    cidade: site.cidade,
  });

  // 2. Cores
  const [cores, setCores] = useState(site.cores);

  // 3. Tipografia
  const [fontes, setFontes] = useState({
    display: site.fontes.display,
    sans: site.fontes.sans,
    tamanhoBase: "16px",
    tamanhoH1: "3.5rem",
  });

  // 4. Contato e Redes
  const [contato, setContato] = useState({
    telefone: site.telefone,
    whatsapp: site.whatsapp,
    email: site.email,
    endereco: site.endereco,
    cidade: site.cidade,
    horario: site.horario,
    mapa: site.mapa,
    instagram: site.redes.instagram,
    linkedin: site.redes.linkedin,
  });

  // 5. Menu e Rodapé
  const [menuItens, setMenuItens] = useState(site.menu.itens);
  const [menuCta, setMenuCta] = useState(site.menu.cta);
  const [rodape, setRodape] = useState(site.rodape);

  // 6. SEO
  const [seo, setSeo] = useState(site.seo);

  // 7. Agendamento
  const [agendamento, setAgendamento] = useState(site.agendamento);

  // 8. Depoimentos
  const [depoimentosConfig, setDepoimentosConfig] = useState(site.depoimentosConfig);

  // 9. Avisos
  const [avisos, setAvisos] = useState({
    demonstrativo: site.aviso,
    emergencia: site.emergencia,
  });

  // 10. Seções de Páginas (content_blocks)
  const [secoes, setSecoes] = useState({
    hero_badge: `${site.titulo} · ${site.crp}`,
    hero_titulo: "Um espaço seguro para você se escutar.",
    hero_subtitulo: `Psicoterapia com acolhimento e ética, presencial em ${site.cidade} ou online, onde você estiver.`,
    sobre_eyebrow: "Sobre",
    sobre_titulo: "Olá, eu sou a Helena Duarte.",
    sobre_texto: "Sou psicóloga clínica há mais de 10 anos e acredito que a terapia é um encontro: um lugar onde você pode ser quem é, sem julgamentos. Trabalho com a abordagem cognitivo-comportamental integrada a práticas de atenção plena.",
    sobre_link: "Conheça minha trajetória →",
    como_funciona_titulo: "Três passos simples",
    cta_final_titulo: "Dar o primeiro passo é um ato de cuidado.",
    cta_final_subtitulo: "Escolha um horário livre e solicite sua primeira consulta, presencial ou online.",
  });

  // Histórico de versões
  const [versoes, setVersoes] = useState<Array<{ id: string; created_at: string; status: string; valor: any }>>([]);
  const [carregandoVersoes, setCarregandoVersoes] = useState(false);

  // Verificar sessão do admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserAdmin(false);
          return;
        }
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        setUserAdmin(!!roleData);
      } catch {
        setUserAdmin(true); // Modo tolerante em preview/dev
      }
    }
    checkAuth();
  }, []);

  // Sincronizar dados quando site_settings carregar
  useEffect(() => {
    if (site.raw && Object.keys(site.raw).length > 0) {
      setIdentidade({
        nome: site.nome,
        titulo: site.titulo,
        crp: site.crp,
        foto: site.foto,
        fotoConsultorio: site.fotoConsultorio,
        logo: site.logo,
        favicon: site.favicon,
        cidade: site.cidade,
      });
      setCores(site.cores);
      setFontes({
        display: site.fontes.display,
        sans: site.fontes.sans,
        tamanhoBase: "16px",
        tamanhoH1: "3.5rem",
      });
      setContato({
        telefone: site.telefone,
        whatsapp: site.whatsapp,
        email: site.email,
        endereco: site.endereco,
        cidade: site.cidade,
        horario: site.horario,
        mapa: site.mapa,
        instagram: site.redes.instagram,
        linkedin: site.redes.linkedin,
      });
      setMenuItens(site.menu.itens);
      setMenuCta(site.menu.cta);
      setRodape(site.rodape);
      setSeo(site.seo);
      setAgendamento(site.agendamento);
      setDepoimentosConfig(site.depoimentosConfig);
      setAvisos({
        demonstrativo: site.aviso,
        emergencia: site.emergencia,
      });
    }
  }, [site.raw]);

  // Aplicar cores ao vivo ao alterar qualquer seletor
  function handleColorChange(key: keyof typeof cores, value: string) {
    const novasCores = { ...cores, [key]: value };
    setCores(novasCores);
    applyThemeColors(novasCores);
    setHouveAlteracao(true);
  }

  // Restaurar paleta Luxury Editorial
  function restaurarLuxuryEditorial() {
    setCores(LUXURY_EDITORIAL_COLORS);
    applyThemeColors(LUXURY_EDITORIAL_COLORS);
    setHouveAlteracao(true);
    toast.success("Paleta Luxury Editorial restaurada na interface.");
  }

  // Desfazer alterações
  function desfazerAlteracoes() {
    if (site.raw) {
      setCores(site.cores);
      applyThemeColors(site.cores);
      setIdentidade({
        nome: site.nome,
        titulo: site.titulo,
        crp: site.crp,
        foto: site.foto,
        fotoConsultorio: site.fotoConsultorio,
        logo: site.logo,
        favicon: site.favicon,
        cidade: site.cidade,
      });
      setContato({
        telefone: site.telefone,
        whatsapp: site.whatsapp,
        email: site.email,
        endereco: site.endereco,
        cidade: site.cidade,
        horario: site.horario,
        mapa: site.mapa,
        instagram: site.redes.instagram,
        linkedin: site.redes.linkedin,
      });
      setMenuItens(site.menu.itens);
      setMenuCta(site.menu.cta);
      setRodape(site.rodape);
      setSeo(site.seo);
      setAgendamento(site.agendamento);
      setDepoimentosConfig(site.depoimentosConfig);
      setAvisos({
        demonstrativo: site.aviso,
        emergencia: site.emergencia,
      });
    }
    setHouveAlteracao(false);
    toast.info("Alterações descartadas. Dados recarregados do banco.");
  }

  // Carregar histórico de versões
  async function carregarVersoes() {
    setCarregandoVersoes(true);
    try {
      const { data, error } = await supabase
        .from("content_versions")
        .select("id, created_at, status, valor")
        .order("created_at", { ascending: false })
        .limit(15);

      if (!error && data) {
        setVersoes(data as any);
      }
    } catch {
      // Ignora erro se tabela não existir
    } finally {
      setCarregandoVersoes(false);
    }
  }

  // Salvar no Supabase
  async function salvarTudo() {
    setSalvando(true);
    try {
      const settingsPayload = [
        {
          secao: "identidade",
          chave: "geral",
          valor: {
            nome: identidade.nome,
            titulo: identidade.titulo,
            crp: identidade.crp,
            foto: identidade.foto,
            foto_consultorio: identidade.fotoConsultorio,
            logo: identidade.logo,
            favicon: identidade.favicon,
            cidade: identidade.cidade,
          },
        },
        {
          secao: "cores",
          chave: "paleta",
          valor: cores,
        },
        {
          secao: "fontes",
          chave: "tipografia",
          valor: fontes,
        },
        {
          secao: "contato",
          chave: "dados",
          valor: contato,
        },
        {
          secao: "redes",
          chave: "links",
          valor: {
            instagram: contato.instagram,
            whatsapp: `https://wa.me/${contato.whatsapp}`,
            linkedin: contato.linkedin,
          },
        },
        {
          secao: "seo",
          chave: "metadados",
          valor: {
            titulo_padrao: seo.tituloPadrao,
            descricao_padrao: seo.descricaoPadrao,
            og_image: seo.ogImage,
            keywords: seo.keywords,
            paginas: seo.paginas,
          },
        },
        {
          secao: "menu",
          chave: "navegacao",
          valor: {
            itens: menuItens,
            cta: menuCta,
          },
        },
        {
          secao: "rodape",
          chave: "configuracoes",
          valor: {
            texto_sobre: rodape.texto,
            crp: rodape.crp,
            direitos: rodape.direitos,
          },
        },
        {
          secao: "agendamento",
          chave: "regras",
          valor: {
            duracao_min: agendamento.duracaoMin,
            intervalo_min: agendamento.intervaloMin,
            antecedencia_min: agendamento.antecedenciaMin,
            cancelamento_horas: agendamento.cancelamentoHoras,
            modalidades: agendamento.modalidades,
            email_notificacao: agendamento.emailNotificacao,
            reembolso_plano: agendamento.reembolsoPlano,
          },
        },
        {
          secao: "depoimentos",
          chave: "config",
          valor: {
            visivel: depoimentosConfig.visivel,
            aviso_sigilo: depoimentosConfig.aviso,
          },
        },
        {
          secao: "avisos",
          chave: "notas",
          valor: avisos,
        },
      ];

      // Salva site_settings
      const { error: settingsError } = await supabase
        .from("site_settings")
        .upsert(settingsPayload as any, { onConflict: "secao,chave" });

      if (settingsError) throw settingsError;

      // Salva blocos de conteúdo da página de início
      const blocksPayload = [
        {
          pagina: "inicio",
          secao: "hero",
          chave: "badge",
          tipo: "text",
          valor: { texto: secoes.hero_badge },
          ordem: 1,
          visivel: true,
          status: "publicado",
        },
        {
          pagina: "inicio",
          secao: "hero",
          chave: "titulo",
          tipo: "text",
          valor: { texto: secoes.hero_titulo },
          ordem: 2,
          visivel: true,
          status: "publicado",
        },
        {
          pagina: "inicio",
          secao: "hero",
          chave: "subtitulo",
          tipo: "text",
          valor: { texto: secoes.hero_subtitulo },
          ordem: 3,
          visivel: true,
          status: "publicado",
        },
        {
          pagina: "inicio",
          secao: "sobre_resumo",
          chave: "titulo",
          tipo: "text",
          valor: { texto: secoes.sobre_titulo },
          ordem: 11,
          visivel: true,
          status: "publicado",
        },
        {
          pagina: "inicio",
          secao: "sobre_resumo",
          chave: "texto",
          tipo: "text",
          valor: { texto: secoes.sobre_texto },
          ordem: 12,
          visivel: true,
          status: "publicado",
        },
        {
          pagina: "inicio",
          secao: "cta_final",
          chave: "titulo",
          tipo: "text",
          valor: { texto: secoes.cta_final_titulo },
          ordem: 50,
          visivel: true,
          status: "publicado",
        },
        {
          pagina: "inicio",
          secao: "cta_final",
          chave: "subtitulo",
          tipo: "text",
          valor: { texto: secoes.cta_final_subtitulo },
          ordem: 51,
          visivel: true,
          status: "publicado",
        },
      ];

      const { error: blocksError } = await supabase
        .from("content_blocks")
        .upsert(blocksPayload as any, { onConflict: "pagina,secao,chave" });

      if (blocksError) throw blocksError;

      // Invalida cache do React Query para atualização instantânea
      await queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      await queryClient.invalidateQueries({ queryKey: ["content_blocks"] });

      setHouveAlteracao(false);
      toast.success("Todos os ajustes foram salvos no banco com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao salvar: ${err.message || "Verifique se a migration foi aplicada no Supabase."}`);
    } finally {
      setSalvando(false);
    }
  }

  // Restaurar dados fictícios padrão (Modo Demonstração)
  async function restaurarDadosFicticios() {
    if (!confirm("Tem certeza que deseja restaurar todos os dados fictícios originais da Dra. Helena Duarte?")) {
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase.from("site_settings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      await queryClient.invalidateQueries();
      toast.success("Dados padrão restaurados com sucesso!");
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast.error("Não foi possível restaurar: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#141416] text-[#E8E4DC]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#2C2C30] bg-[#1A1A1D]/90 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-display text-xl font-bold tracking-tight text-gold">Dra. Helena Duarte</span>
              <span className="rounded bg-wine/80 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-ivory">
                CMS /admin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {houveAlteracao && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Alterações não salvas
              </span>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewAberto(true)}
              className="border-gold/50 text-gold hover:bg-gold/10 hover:text-gold"
            >
              <Eye className="mr-1.5 h-4 w-4" />
              Pré-visualizar ao vivo
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={desfazerAlteracoes}
              disabled={!houveAlteracao || salvando}
              className="text-[#DDD7CD] hover:bg-white/10"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Desfazer
            </Button>

            <Button
              size="sm"
              onClick={salvarTudo}
              disabled={salvando}
              className="bg-gold text-charcoal hover:bg-gold-hover font-semibold shadow-md"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {salvando ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-medium text-ivory">Ajustes Gerais do Site</h1>
            <p className="mt-1 text-sm text-[#A29C92]">
              Gerencie cores, fontes, textos, imagens, contatos e seções do site com gravação direta no banco.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="border-[#333336] text-[#C8C3BA] hover:text-ivory">
              <Link to="/" target="_blank">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Abrir site público
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs de Configuração */}
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-[#1F1F23] border border-[#2D2D32] p-1.5 text-[#A29C92] h-auto flex flex-wrap gap-1 rounded-2xl">
              <TabsTrigger value="identidade" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <User className="h-4 w-4" /> Identidade
              </TabsTrigger>
              <TabsTrigger value="cores" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <Palette className="h-4 w-4" /> Cores
              </TabsTrigger>
              <TabsTrigger value="tipografia" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <Type className="h-4 w-4" /> Tipografia
              </TabsTrigger>
              <TabsTrigger value="contato" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <Phone className="h-4 w-4" /> Contato e Redes
              </TabsTrigger>
              <TabsTrigger value="menu_rodape" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <MenuIcon className="h-4 w-4" /> Menu e Rodapé
              </TabsTrigger>
              <TabsTrigger value="secoes" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <Layout className="h-4 w-4" /> Páginas e Seções
              </TabsTrigger>
              <TabsTrigger value="seo" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <Globe className="h-4 w-4" /> SEO
              </TabsTrigger>
              <TabsTrigger value="agendamento" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <Calendar className="h-4 w-4" /> Agendamento
              </TabsTrigger>
              <TabsTrigger value="depoimentos" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4" /> Depoimentos
              </TabsTrigger>
              <TabsTrigger value="avisos" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <AlertCircle className="h-4 w-4" /> Avisos
              </TabsTrigger>
              <TabsTrigger value="versoes" onClick={carregarVersoes} className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <History className="h-4 w-4" /> Versões
              </TabsTrigger>
              <TabsTrigger value="demo" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex gap-1.5 py-2 px-3 text-xs sm:text-sm">
                <RefreshCw className="h-4 w-4" /> Modo Demo
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 1. ABA IDENTIDADE */}
          <TabsContent value="identidade" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Identidade Profissional</h2>
              <p className="mt-1 text-xs text-[#A29C92]">Nome, titulação, registro profissional e imagens principais.</p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="nome" className="text-ivory">Nome do Profissional</Label>
                  <Input
                    id="nome"
                    value={identidade.nome}
                    onChange={(e) => {
                      setIdentidade({ ...identidade, nome: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="titulo" className="text-ivory">Título / Especialidade</Label>
                  <Input
                    id="titulo"
                    value={identidade.titulo}
                    onChange={(e) => {
                      setIdentidade({ ...identidade, titulo: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="crp" className="text-ivory">Registro no Conselho (CRP)</Label>
                  <Input
                    id="crp"
                    value={identidade.crp}
                    onChange={(e) => {
                      setIdentidade({ ...identidade, crp: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="cidade" className="text-ivory">Cidade / Estado Principal</Label>
                  <Input
                    id="cidade"
                    value={identidade.cidade}
                    onChange={(e) => {
                      setIdentidade({ ...identidade, cidade: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="foto" className="text-ivory">Foto de Perfil (URL ou arquivo)</Label>
                  <div className="mt-2 flex gap-4 items-center">
                    <Input
                      id="foto"
                      value={identidade.foto}
                      onChange={(e) => {
                        setIdentidade({ ...identidade, foto: e.target.value });
                        setHouveAlteracao(true);
                      }}
                      className="bg-[#26262B] border-[#38383E] text-ivory"
                    />
                    <img
                      src={identidade.foto}
                      alt="Prévia de perfil"
                      className="h-12 w-12 rounded-full object-cover border border-gold/40 shrink-0"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="fotoConsultorio" className="text-ivory">Foto do Consultório (URL ou arquivo)</Label>
                  <div className="mt-2 flex gap-4 items-center">
                    <Input
                      id="fotoConsultorio"
                      value={identidade.fotoConsultorio}
                      onChange={(e) => {
                        setIdentidade({ ...identidade, fotoConsultorio: e.target.value });
                        setHouveAlteracao(true);
                      }}
                      className="bg-[#26262B] border-[#38383E] text-ivory"
                    />
                    <img
                      src={identidade.fotoConsultorio}
                      alt="Prévia consultório"
                      className="h-12 w-16 rounded-md object-cover border border-gold/40 shrink-0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logo" className="text-ivory">Texto ou URL do Logo</Label>
                  <Input
                    id="logo"
                    placeholder="Deixe em branco para usar o nome textual"
                    value={identidade.logo}
                    onChange={(e) => {
                      setIdentidade({ ...identidade, logo: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="favicon" className="text-ivory">URL do Favicon</Label>
                  <Input
                    id="favicon"
                    value={identidade.favicon}
                    onChange={(e) => {
                      setIdentidade({ ...identidade, favicon: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 2. ABA CORES */}
          <TabsContent value="cores" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display font-medium text-ivory">Paleta de Cores</h2>
                  <p className="mt-1 text-xs text-[#A29C92]">
                    Seletor interativo com aplicação ao vivo em todo o site.
                  </p>
                </div>
                <Button
                  onClick={restaurarLuxuryEditorial}
                  variant="outline"
                  size="sm"
                  className="border-gold text-gold hover:bg-gold/10 hover:text-gold"
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Restaurar Luxury Editorial
                </Button>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Charcoal */}
                <div className="p-4 rounded-xl border border-[#2D2D32] bg-[#232327]">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#A29C92]">Charcoal (Texto & Fundos Escuros)</Label>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={cores.charcoal}
                      onChange={(e) => handleColorChange("charcoal", e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <Input
                      value={cores.charcoal}
                      onChange={(e) => handleColorChange("charcoal", e.target.value)}
                      className="bg-[#2B2B30] border-[#3B3B42] text-ivory font-mono uppercase"
                    />
                  </div>
                  <div className="mt-3 h-8 rounded-lg" style={{ backgroundColor: cores.charcoal }} />
                </div>

                {/* Ivory */}
                <div className="p-4 rounded-xl border border-[#2D2D32] bg-[#232327]">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#A29C92]">Ivory (Fundo Principal Claro)</Label>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={cores.ivory}
                      onChange={(e) => handleColorChange("ivory", e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <Input
                      value={cores.ivory}
                      onChange={(e) => handleColorChange("ivory", e.target.value)}
                      className="bg-[#2B2B30] border-[#3B3B42] text-ivory font-mono uppercase"
                    />
                  </div>
                  <div className="mt-3 h-8 rounded-lg border border-black/10" style={{ backgroundColor: cores.ivory }} />
                </div>

                {/* Gold */}
                <div className="p-4 rounded-xl border border-[#2D2D32] bg-[#232327]">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#A29C92]">Gold (Destaques, Botões e Ícones)</Label>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={cores.gold}
                      onChange={(e) => handleColorChange("gold", e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <Input
                      value={cores.gold}
                      onChange={(e) => handleColorChange("gold", e.target.value)}
                      className="bg-[#2B2B30] border-[#3B3B42] text-ivory font-mono uppercase"
                    />
                  </div>
                  <div className="mt-3 h-8 rounded-lg" style={{ backgroundColor: cores.gold }} />
                </div>

                {/* Wine */}
                <div className="p-4 rounded-xl border border-[#2D2D32] bg-[#232327]">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#A29C92]">Wine (Títulos de Destaque e Links)</Label>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={cores.wine}
                      onChange={(e) => handleColorChange("wine", e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <Input
                      value={cores.wine}
                      onChange={(e) => handleColorChange("wine", e.target.value)}
                      className="bg-[#2B2B30] border-[#3B3B42] text-ivory font-mono uppercase"
                    />
                  </div>
                  <div className="mt-3 h-8 rounded-lg" style={{ backgroundColor: cores.wine }} />
                </div>

                {/* Smoke */}
                <div className="p-4 rounded-xl border border-[#2D2D32] bg-[#232327]">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-[#A29C92]">Smoke (Bordas e Textos Neutros)</Label>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={cores.smoke}
                      onChange={(e) => handleColorChange("smoke", e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <Input
                      value={cores.smoke}
                      onChange={(e) => handleColorChange("smoke", e.target.value)}
                      className="bg-[#2B2B30] border-[#3B3B42] text-ivory font-mono uppercase"
                    />
                  </div>
                  <div className="mt-3 h-8 rounded-lg" style={{ backgroundColor: cores.smoke }} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 3. ABA TIPOGRAFIA */}
          <TabsContent value="tipografia" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Tipografia e Escala</h2>
              <p className="mt-1 text-xs text-[#A29C92]">Fontes Google Fonts para títulos e corpo.</p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="font-display" className="text-ivory">Fonte de Títulos (Display / Serif)</Label>
                  <Input
                    id="font-display"
                    value={fontes.display}
                    onChange={(e) => {
                      setFontes({ ...fontes, display: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                  <p className="mt-1 text-xs text-[#A29C92]">Ex: "Fraunces", "Cinzel", "Playfair Display", "Cormorant Garamond"</p>
                </div>

                <div>
                  <Label htmlFor="font-sans" className="text-ivory">Fonte de Leitura (Sans-serif)</Label>
                  <Input
                    id="font-sans"
                    value={fontes.sans}
                    onChange={(e) => {
                      setFontes({ ...fontes, sans: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                  <p className="mt-1 text-xs text-[#A29C92]">Ex: "Nunito Sans", "Plus Jakarta Sans", "Inter", "Outfit"</p>
                </div>

                <div>
                  <Label htmlFor="tam-base" className="text-ivory">Tamanho Base de Texto</Label>
                  <Input
                    id="tam-base"
                    value={fontes.tamanhoBase}
                    onChange={(e) => {
                      setFontes({ ...fontes, tamanhoBase: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="tam-h1" className="text-ivory">Tamanho de Títulos H1</Label>
                  <Input
                    id="tam-h1"
                    value={fontes.tamanhoH1}
                    onChange={(e) => {
                      setFontes({ ...fontes, tamanhoH1: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>
              </div>

              {/* Prévia de Tipografia */}
              <div className="mt-8 rounded-xl border border-[#2D2D32] bg-[#232327] p-6">
                <p className="text-xs uppercase tracking-wider text-gold font-semibold">Pré-visualização Tipográfica</p>
                <h3 className="mt-3 text-3xl font-display text-ivory" style={{ fontFamily: fontes.display }}>
                  Um espaço seguro para você se escutar.
                </h3>
                <p className="mt-2 text-base text-[#DDD7CD]" style={{ fontFamily: fontes.sans }}>
                  Psicoterapia com acolhimento, ética profissional e rigor científico para apoiar você em momentos de transformação.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* 4. ABA CONTATO E REDES */}
          <TabsContent value="contato" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Canais de Contato e Redes</h2>
              <p className="mt-1 text-xs text-[#A29C92]">WhatsApp, telefone, e-mail, endereço físico e horários de funcionamento.</p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="whatsapp" className="text-ivory">WhatsApp (com DDI e DDD, ex: 5565900000000)</Label>
                  <Input
                    id="whatsapp"
                    value={contato.whatsapp}
                    onChange={(e) => {
                      setContato({ ...contato, whatsapp: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="telefone" className="text-ivory">Telefone Formatado (ex: (65) 90000-0000)</Label>
                  <Input
                    id="telefone"
                    value={contato.telefone}
                    onChange={(e) => {
                      setContato({ ...contato, telefone: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-ivory">E-mail Profissional</Label>
                  <Input
                    id="email"
                    value={contato.email}
                    onChange={(e) => {
                      setContato({ ...contato, email: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="horario" className="text-ivory">Horários de Atendimento</Label>
                  <Input
                    id="horario"
                    value={contato.horario}
                    onChange={(e) => {
                      setContato({ ...contato, horario: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="endereco" className="text-ivory">Endereço Completo do Consultório</Label>
                  <Input
                    id="endereco"
                    value={contato.endereco}
                    onChange={(e) => {
                      setContato({ ...contato, endereco: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram" className="text-ivory">Instagram (URL ou @)</Label>
                  <Input
                    id="instagram"
                    value={contato.instagram}
                    onChange={(e) => {
                      setContato({ ...contato, instagram: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin" className="text-ivory">LinkedIn (URL)</Label>
                  <Input
                    id="linkedin"
                    value={contato.linkedin}
                    onChange={(e) => {
                      setContato({ ...contato, linkedin: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 5. ABA MENU E RODAPÉ */}
          <TabsContent value="menu_rodape" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Menu de Navegação</h2>
              <p className="mt-1 text-xs text-[#A29C92]">Itens exibidos no cabeçalho e visibilidade.</p>

              <div className="mt-6 space-y-3">
                {menuItens.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-[#2D2D32] bg-[#232327]">
                    <Input
                      value={item.label}
                      onChange={(e) => {
                        const copy = [...menuItens];
                        const prev = copy[idx];
                        if (prev) {
                          copy[idx] = { to: prev.to, label: e.target.value, visivel: prev.visivel !== false };
                          setMenuItens(copy);
                          setHouveAlteracao(true);
                        }
                      }}
                      className="bg-[#2B2B30] border-[#3B3B42] text-ivory max-w-[180px]"
                    />
                    <Input
                      value={item.to}
                      onChange={(e) => {
                        const copy = [...menuItens];
                        const prev = copy[idx];
                        if (prev) {
                          copy[idx] = { to: e.target.value, label: prev.label, visivel: prev.visivel !== false };
                          setMenuItens(copy);
                          setHouveAlteracao(true);
                        }
                      }}
                      className="bg-[#2B2B30] border-[#3B3B42] text-ivory flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-[#A29C92]">Visível</Label>
                      <Switch
                        checked={item.visivel !== false}
                        onCheckedChange={(checked) => {
                          const copy = [...menuItens];
                          const prev = copy[idx];
                          if (prev) {
                            copy[idx] = { to: prev.to, label: prev.label, visivel: checked };
                            setMenuItens(copy);
                            setHouveAlteracao(true);
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-[#2D2D32] pt-6">
                <h3 className="text-lg font-display font-medium text-ivory">Botão de Ação do Cabeçalho (CTA)</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-ivory">Texto do Botão</Label>
                    <Input
                      value={menuCta.label}
                      onChange={(e) => {
                        setMenuCta({ ...menuCta, label: e.target.value });
                        setHouveAlteracao(true);
                      }}
                      className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                    />
                  </div>
                  <div>
                    <Label className="text-ivory">Destino (Link)</Label>
                    <Input
                      value={menuCta.to}
                      onChange={(e) => {
                        setMenuCta({ ...menuCta, to: e.target.value });
                        setHouveAlteracao(true);
                      }}
                      className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-[#2D2D32] pt-6">
                <h3 className="text-lg font-display font-medium text-ivory">Textos do Rodapé</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-ivory">Texto Institucional do Rodapé</Label>
                    <Textarea
                      rows={2}
                      value={rodape.texto}
                      onChange={(e) => {
                        setRodape({ ...rodape, texto: e.target.value });
                        setHouveAlteracao(true);
                      }}
                      className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                    />
                  </div>
                  <div>
                    <Label className="text-ivory">Texto de Direitos Autorais</Label>
                    <Input
                      value={rodape.direitos}
                      onChange={(e) => {
                        setRodape({ ...rodape, direitos: e.target.value });
                        setHouveAlteracao(true);
                      }}
                      className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 6. ABA PÁGINAS E SEÇÕES */}
          <TabsContent value="secoes" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Conteúdo das Seções (Página Inicial)</h2>
              <p className="mt-1 text-xs text-[#A29C92]">Edite títulos e textos centrais que aparecem na home.</p>

              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-xl border border-[#2D2D32] bg-[#232327]">
                  <h3 className="text-base font-semibold text-gold">Seção Hero (Topo)</h3>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <Label className="text-ivory">Badge do Topo</Label>
                      <Input
                        value={secoes.hero_badge}
                        onChange={(e) => {
                          setSecoes({ ...secoes, hero_badge: e.target.value });
                          setHouveAlteracao(true);
                        }}
                        className="mt-1.5 bg-[#2B2B30] border-[#3B3B42] text-ivory"
                      />
                    </div>
                    <div>
                      <Label className="text-ivory">Título Principal (H1)</Label>
                      <Input
                        value={secoes.hero_titulo}
                        onChange={(e) => {
                          setSecoes({ ...secoes, hero_titulo: e.target.value });
                          setHouveAlteracao(true);
                        }}
                        className="mt-1.5 bg-[#2B2B30] border-[#3B3B42] text-ivory"
                      />
                    </div>
                    <div>
                      <Label className="text-ivory">Subtítulo do Hero</Label>
                      <Textarea
                        rows={2}
                        value={secoes.hero_subtitulo}
                        onChange={(e) => {
                          setSecoes({ ...secoes, hero_subtitulo: e.target.value });
                          setHouveAlteracao(true);
                        }}
                        className="mt-1.5 bg-[#2B2B30] border-[#3B3B42] text-ivory"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#2D2D32] bg-[#232327]">
                  <h3 className="text-base font-semibold text-gold">Seção Sobre (Resumo na Home)</h3>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <Label className="text-ivory">Título da Seção Sobre</Label>
                      <Input
                        value={secoes.sobre_titulo}
                        onChange={(e) => {
                          setSecoes({ ...secoes, sobre_titulo: e.target.value });
                          setHouveAlteracao(true);
                        }}
                        className="mt-1.5 bg-[#2B2B30] border-[#3B3B42] text-ivory"
                      />
                    </div>
                    <div>
                      <Label className="text-ivory">Texto Biográfico Resumido</Label>
                      <Textarea
                        rows={3}
                        value={secoes.sobre_texto}
                        onChange={(e) => {
                          setSecoes({ ...secoes, sobre_texto: e.target.value });
                          setHouveAlteracao(true);
                        }}
                        className="mt-1.5 bg-[#2B2B30] border-[#3B3B42] text-ivory"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#2D2D32] bg-[#232327]">
                  <h3 className="text-base font-semibold text-gold">Chamada Final para Agendamento (CTA)</h3>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <Label className="text-ivory">Título do CTA</Label>
                      <Input
                        value={secoes.cta_final_titulo}
                        onChange={(e) => {
                          setSecoes({ ...secoes, cta_final_titulo: e.target.value });
                          setHouveAlteracao(true);
                        }}
                        className="mt-1.5 bg-[#2B2B30] border-[#3B3B42] text-ivory"
                      />
                    </div>
                    <div>
                      <Label className="text-ivory">Texto de Apoio</Label>
                      <Textarea
                        rows={2}
                        value={secoes.cta_final_subtitulo}
                        onChange={(e) => {
                          setSecoes({ ...secoes, cta_final_subtitulo: e.target.value });
                          setHouveAlteracao(true);
                        }}
                        className="mt-1.5 bg-[#2B2B30] border-[#3B3B42] text-ivory"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 7. ABA SEO */}
          <TabsContent value="seo" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Otimização para Buscas (SEO & OpenGraph)</h2>
              <p className="mt-1 text-xs text-[#A29C92]">Meta tags para Google, WhatsApp e redes sociais.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <Label className="text-ivory">Título Padrão (Title Tag)</Label>
                  <Input
                    value={seo.tituloPadrao}
                    onChange={(e) => {
                      setSeo({ ...seo, tituloPadrao: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label className="text-ivory">Meta Descrição Padrão</Label>
                  <Textarea
                    rows={3}
                    value={seo.descricaoPadrao}
                    onChange={(e) => {
                      setSeo({ ...seo, descricaoPadrao: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label className="text-ivory">Imagem de Compartilhamento (og:image / Twitter card)</Label>
                  <Input
                    value={seo.ogImage}
                    onChange={(e) => {
                      setSeo({ ...seo, ogImage: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label className="text-ivory">Palavras-chave (separadas por vírgula)</Label>
                  <Input
                    value={Array.isArray(seo.keywords) ? seo.keywords.join(", ") : seo.keywords}
                    onChange={(e) => {
                      setSeo({
                        ...seo,
                        keywords: e.target.value.split(",").map((s) => s.trim()),
                      });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 8. ABA AGENDAMENTO */}
          <TabsContent value="agendamento" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Regras de Agendamento</h2>
              <p className="mt-1 text-xs text-[#A29C92]">Duração das sessões, intervalo e políticas de remarcação.</p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <Label className="text-ivory">Duração da Sessão (minutos)</Label>
                  <Input
                    type="number"
                    value={agendamento.duracaoMin}
                    onChange={(e) => {
                      setAgendamento({ ...agendamento, duracaoMin: Number(e.target.value) });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label className="text-ivory">Intervalo entre Sessões (minutos)</Label>
                  <Input
                    type="number"
                    value={agendamento.intervaloMin}
                    onChange={(e) => {
                      setAgendamento({ ...agendamento, intervaloMin: Number(e.target.value) });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label className="text-ivory">Antecedência Mínima para Cancelamento (horas)</Label>
                  <Input
                    type="number"
                    value={agendamento.cancelamentoHoras}
                    onChange={(e) => {
                      setAgendamento({ ...agendamento, cancelamentoHoras: Number(e.target.value) });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label className="text-ivory">E-mail para Recebimento de Notificações</Label>
                  <Input
                    type="email"
                    value={agendamento.emailNotificacao}
                    onChange={(e) => {
                      setAgendamento({ ...agendamento, emailNotificacao: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-ivory">Informações de Reembolso e Convênios</Label>
                  <Textarea
                    rows={2}
                    value={agendamento.reembolsoPlano}
                    onChange={(e) => {
                      setAgendamento({ ...agendamento, reembolsoPlano: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 9. ABA DEPOIMENTOS */}
          <TabsContent value="depoimentos" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Exibição de Depoimentos</h2>
              <p className="mt-1 text-xs text-[#A29C92]">Ativar ou ocultar a seção de depoimentos no site público.</p>

              <div className="mt-6 flex items-center justify-between p-4 rounded-xl border border-[#2D2D32] bg-[#232327]">
                <div>
                  <p className="font-medium text-ivory">Exibir Seção de Depoimentos no Site</p>
                  <p className="text-xs text-[#A29C92]">Se desativado, o bloco de avaliações não será renderizado na página inicial.</p>
                </div>
                <Switch
                  checked={depoimentosConfig.visivel}
                  onCheckedChange={(checked) => {
                    setDepoimentosConfig({ ...depoimentosConfig, visivel: checked });
                    setHouveAlteracao(true);
                  }}
                />
              </div>

              <div className="mt-6">
                <Label className="text-ivory">Aviso de Sigilo e Anonimização</Label>
                <Input
                  value={depoimentosConfig.aviso}
                  onChange={(e) => {
                    setDepoimentosConfig({ ...depoimentosConfig, aviso: e.target.value });
                    setHouveAlteracao(true);
                  }}
                  className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                />
              </div>
            </div>
          </TabsContent>

          {/* 10. ABA AVISOS E TEXTOS LEGAIS */}
          <TabsContent value="avisos" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Avisos e Textos Legais</h2>
              <p className="mt-1 text-xs text-[#A29C92]">Mensagens obrigatórias de emergência, sigilo e projeto demonstrativo.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <Label className="text-ivory">Aviso de Projeto Demonstrativo</Label>
                  <Input
                    value={avisos.demonstrativo}
                    onChange={(e) => {
                      setAvisos({ ...avisos, demonstrativo: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>

                <div>
                  <Label className="text-ivory">Aviso de Emergência em Saúde Mental</Label>
                  <Input
                    value={avisos.emergencia}
                    onChange={(e) => {
                      setAvisos({ ...avisos, emergencia: e.target.value });
                      setHouveAlteracao(true);
                    }}
                    className="mt-2 bg-[#26262B] border-[#38383E] text-ivory"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 11. ABA HISTÓRICO DE VERSÕES */}
          <TabsContent value="versoes" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-medium text-ivory">Histórico de Versões</h2>
                  <p className="mt-1 text-xs text-[#A29C92]">Consultas automáticas registradas na tabela content_versions.</p>
                </div>
                <Button
                  onClick={carregarVersoes}
                  variant="outline"
                  size="sm"
                  className="border-[#38383E] text-[#DDD7CD] hover:text-ivory"
                >
                  <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${carregandoVersoes ? "animate-spin" : ""}`} />
                  Recarregar
                </Button>
              </div>

              <div className="mt-6">
                {carregandoVersoes ? (
                  <p className="text-sm text-[#A29C92] animate-pulse">Carregando histórico...</p>
                ) : versoes.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-[#2D2D32]">
                    <History className="mx-auto h-8 w-8 text-[#A29C92]/60" />
                    <p className="mt-2 text-sm text-[#A29C92]">Nenhuma versão registrada ainda.</p>
                    <p className="text-xs text-[#8A857B] mt-1">Ao salvar alterações de blocos, novas versões serão arquivadas automaticamente.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#2D2D32] rounded-xl border border-[#2D2D32] bg-[#232327]">
                    {versoes.map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="text-sm font-medium text-ivory">Versão ID: {v.id.slice(0, 8)}...</p>
                          <p className="text-xs text-[#A29C92] mt-0.5">
                            {new Date(v.created_at).toLocaleString("pt-BR")} · Status: {v.status}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast.info(`Versão arquivada com sucesso em ${new Date(v.created_at).toLocaleString("pt-BR")}`);
                          }}
                          className="text-gold hover:text-gold hover:bg-gold/10 text-xs"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 12. ABA MODO DEMONSTRAÇÃO */}
          <TabsContent value="demo" className="space-y-6">
            <div className="rounded-2xl border border-[#2D2D32] bg-[#1C1C20] p-6 shadow-sm">
              <h2 className="text-xl font-display font-medium text-ivory">Modo Demonstração</h2>
              <p className="mt-1 text-xs text-[#A29C92]">Ferramentas para reset e restauração rápida do portfólio.</p>

              <div className="mt-6 p-6 rounded-xl border border-amber-900/40 bg-amber-950/20">
                <h3 className="text-base font-semibold text-amber-300">Restaurar Conteúdo Original</h3>
                <p className="mt-2 text-sm text-amber-200/80">
                  Esta ação redefine os textos, fotos e a paleta Luxury Editorial para os valores padrão da Dra. Helena Duarte.
                </p>
                <div className="mt-5">
                  <Button
                    onClick={restaurarDadosFicticios}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
                  >
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Restaurar Dados Fictícios
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Pré-visualização ao Vivo */}
      <Dialog open={previewAberto} onOpenChange={setPreviewAberto}>
        <DialogContent className="max-w-5xl bg-[#141416] border-[#2D2D32] text-ivory p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="p-4 border-b border-[#2D2D32] flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-display text-gold">Pré-visualização ao Vivo</DialogTitle>
              <DialogDescription className="text-xs text-[#A29C92]">
                Visualizando alterações com cores, fontes e textos em tempo real.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 pr-6">
              <Button
                variant={previewMobile ? "ghost" : "secondary"}
                size="sm"
                onClick={() => setPreviewMobile(false)}
                className="h-8 px-2.5 text-xs"
              >
                <Monitor className="h-3.5 w-3.5 mr-1" /> Desktop
              </Button>
              <Button
                variant={previewMobile ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMobile(true)}
                className="h-8 px-2.5 text-xs"
              >
                <Smartphone className="h-3.5 w-3.5 mr-1" /> Mobile
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-[#0E0E10] flex justify-center">
            <div
              className={`transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl border border-black/20 ${
                previewMobile ? "w-[375px]" : "w-full max-w-4xl"
              }`}
              style={{ backgroundColor: cores.ivory, color: cores.charcoal }}
            >
              {/* Mini Header Preview */}
              <div
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{ backgroundColor: cores.ivory, borderColor: cores.smoke }}
              >
                <div>
                  <p className="font-display font-semibold" style={{ color: cores.wine, fontFamily: fontes.display }}>
                    {identidade.nome}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: cores.charcoal, opacity: 0.7 }}>
                    {identidade.titulo}
                  </p>
                </div>
                <div
                  className="rounded-full px-4 py-1 text-xs font-medium"
                  style={{ backgroundColor: cores.gold, color: cores.charcoal }}
                >
                  {menuCta.label}
                </div>
              </div>

              {/* Mini Hero Preview */}
              <div className="p-8" style={{ backgroundColor: cores.ivory }}>
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: cores.gold }}
                >
                  {secoes.hero_badge}
                </span>
                <h2
                  className="mt-3 text-3xl sm:text-4xl font-display font-medium leading-tight"
                  style={{ color: cores.wine, fontFamily: fontes.display }}
                >
                  {secoes.hero_titulo}
                </h2>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: cores.charcoal, opacity: 0.8, fontFamily: fontes.sans }}>
                  {secoes.hero_subtitulo}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div
                    className="rounded-full px-6 py-2 text-xs font-semibold shadow-sm"
                    style={{ backgroundColor: cores.gold, color: cores.charcoal }}
                  >
                    Agendar consulta
                  </div>
                  <div
                    className="rounded-full px-6 py-2 text-xs font-semibold border"
                    style={{ borderColor: cores.smoke, color: cores.wine }}
                  >
                    Conhecer especialidades
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <img
                    src={identidade.foto}
                    alt="Retrato da profissional"
                    className="h-16 w-16 rounded-full object-cover border-2 shadow-sm"
                    style={{ borderColor: cores.gold }}
                  />
                  <div>
                    <p className="font-display font-medium text-sm" style={{ color: cores.wine }}>
                      {identidade.nome}
                    </p>
                    <p className="text-xs" style={{ color: cores.charcoal, opacity: 0.7 }}>
                      {contato.cidade} · {identidade.crp}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mini Footer Preview */}
              <div
                className="p-6 text-xs text-center border-t space-y-1"
                style={{ backgroundColor: cores.charcoal, color: cores.ivory, borderColor: cores.charcoal }}
              >
                <p className="font-display font-medium text-sm" style={{ color: cores.gold }}>
                  {identidade.nome}
                </p>
                <p style={{ opacity: 0.8 }}>{rodape.texto}</p>
                <p className="pt-2 text-[10px]" style={{ opacity: 0.6 }}>{avisos.demonstrativo}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
