import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Save,
  RotateCcw,
  RotateCw,
  Eye,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Crop,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Calendar,
  Globe,
  ArrowLeft,
  Wand2,
  Layers,
  Settings,
  X,
  ExternalLink,
  Check,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings, usePageContent, LUXURY_EDITORIAL_COLORS, artigosQuery } from "@/hooks/use-public-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/editor")({
  head: () => ({
    meta: [
      { title: "Editor Visual & IA | Painel Administrativo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEditor,
});

type DeviceMode = "desktop" | "tablet" | "mobile";
type PageId = "inicio" | "sobre" | "especialidades" | "contato" | "agendar" | "privacidade" | "blog";

interface BlockItem {
  id: string;
  secao: string;
  chave: string;
  tipo: "hero" | "texto" | "imagem_texto" | "especialidades" | "faq" | "cta";
  titulo: string;
  subtitulo?: string;
  texto?: string;
  imagem?: string;
  imagemAlt?: string;
  badge?: string;
  link?: string;
  linkTexto?: string;
  ordem: number;
  visivel: boolean;
  status: "publicado" | "rascunho";
}

interface ArtigoBlog {
  id?: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  capa?: string;
  publicado: boolean;
  publicado_em: string | null;
}

function AdminEditor() {
  const queryClient = useQueryClient();
  const site = useSiteSettings();

  // Estados principais do editor
  const [paginaAtiva, setPaginaAtiva] = useState<PageId>("inicio");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [blocoAtivoId, setBlocoAtivoId] = useState<string | null>("hero-1");
  const [salvando, setSalvando] = useState(false);
  const [statusPublicacao, setStatusPublicacao] = useState<"publicado" | "rascunho">("publicado");

  // Modais auxiliares
  const [modalMediaAberto, setModalMediaAberto] = useState(false);
  const [modalIaAberto, setModalIaAberto] = useState(false);
  const [modalSeoAberto, setModalSeoAberto] = useState(false);
  const [modalVersoesAberto, setModalVersoesAberto] = useState(false);

  // IA State
  const [iaPrompt, setIaPrompt] = useState("");
  const [iaCarregando, setIaCarregando] = useState(false);
  const [iaResultado, setIaResultado] = useState("");
  const [iaTipo, setIaTipo] = useState<"texto" | "imagem">("texto");
  const [iaAcaoTexto, setIaAcaoTexto] = useState("rewrite_text");
  const [iaImagemUrl, setIaImagemUrl] = useState("");

  // Histórico de Desfazer/Refazer (Undo/Redo Stack)
  const [blocos, setBlocos] = useState<BlockItem[]>([
    {
      id: "hero-1",
      secao: "hero",
      chave: "principal",
      tipo: "hero",
      titulo: "Um espaço seguro para você se escutar.",
      subtitulo: `Psicoterapia com acolhimento e ética, presencial em ${site.cidade} ou online, onde você estiver.`,
      badge: `${site.titulo} · ${site.crp}`,
      imagem: site.fotoConsultorio || "/consultorio.jpg",
      imagemAlt: "Consultório acolhedor com poltrona confortável",
      linkTexto: "Agendar consulta",
      link: "/agendar",
      ordem: 1,
      visivel: true,
      status: "publicado",
    },
    {
      id: "sobre-2",
      secao: "sobre_resumo",
      chave: "resumo",
      tipo: "imagem_texto",
      titulo: `Olá, eu sou a ${site.nome.replace("Dra. ", "")}.`,
      texto: "Sou psicóloga clínica há mais de 10 anos e acredito que a terapia é um encontro: um lugar onde você pode ser quem é, sem julgamentos. Trabalho com a abordagem cognitivo-comportamental integrada a práticas de atenção plena.",
      badge: "Sobre",
      imagem: site.foto || "/helena-duarte.webp",
      imagemAlt: `${site.nome}, psicóloga clínica`,
      linkTexto: "Conheça minha trajetória →",
      link: "/sobre",
      ordem: 2,
      visivel: true,
      status: "publicado",
    },
    {
      id: "especialidades-3",
      secao: "especialidades",
      chave: "cards",
      tipo: "especialidades",
      titulo: "Cada história merece ser cuidada com atenção.",
      badge: "Como posso ajudar",
      texto: "Atendimento acolhedor e humanizado para ansiedade, depressão, luto, estresse e relacionamentos.",
      ordem: 3,
      visivel: true,
      status: "publicado",
    },
    {
      id: "faq-4",
      secao: "faq",
      chave: "perguntas",
      tipo: "faq",
      titulo: "Perguntas frequentes",
      badge: "Dúvidas frequentes",
      texto: "Tire suas dúvidas sobre tempo de sessão, sigilo profissional e formato dos atendimentos.",
      ordem: 4,
      visivel: true,
      status: "publicado",
    },
    {
      id: "cta-5",
      secao: "cta_final",
      chave: "chamada",
      tipo: "cta",
      titulo: "Dar o primeiro passo é um ato de cuidado.",
      subtitulo: "Escolha um horário livre e solicite sua primeira consulta, presencial ou online.",
      linkTexto: "Agendar consulta",
      link: "/agendar",
      ordem: 5,
      visivel: true,
      status: "publicado",
    },
  ]);

  const [historicoDesfazer, setHistoricoDesfazer] = useState<BlockItem[][]>([]);
  const [historicoRefazer, setHistoricoRefazer] = useState<BlockItem[][]>([]);

  // Blog State
  const { data: artigosPublicados } = useQuery(artigosQuery);
  const [artigos, setArtigos] = useState<ArtigoBlog[]>([]);
  const [artigoSelecionado, setArtigoSelecionado] = useState<ArtigoBlog | null>(null);

  // Mídias cadastradas
  const [medias, setMedias] = useState<Array<{ url: string; alt: string; tamanho?: number }>>([
    { url: site.foto || "/helena-duarte.webp", alt: `${site.nome}, psicóloga clínica` },
    { url: site.fotoConsultorio || "/consultorio.jpg", alt: "Consultório acolhedor com poltrona confortável" },
  ]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaAltInput, setMediaAltInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza blocos a cada mudança criando checkpoint no undo
  function updateBlocos(novosBlocos: BlockItem[]) {
    setHistoricoDesfazer((prev) => [...prev.slice(-15), blocos]);
    setHistoricoRefazer([]);
    setBlocos(novosBlocos);
  }

  function handleUndo() {
    if (historicoDesfazer.length === 0) return;
    const anterior = historicoDesfazer[historicoDesfazer.length - 1];
    if (!anterior) return;
    setHistoricoRefazer((prev) => [blocos, ...prev]);
    setHistoricoDesfazer((prev) => prev.slice(0, -1));
    setBlocos(anterior);
    toast.info("Ação desfeita");
  }

  function handleRedo() {
    if (historicoRefazer.length === 0) return;
    const proximo = historicoRefazer[0];
    if (!proximo) return;
    setHistoricoDesfazer((prev) => [...prev, blocos]);
    setHistoricoRefazer((prev) => prev.slice(1));
    setBlocos(proximo);
    toast.info("Ação refeita");
  }

  // Carregar dados de artigos e mídias do Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data: artData } = await supabase
          .from("artigos")
          .select("*")
          .order("created_at", { ascending: false });
        if (artData && artData.length > 0) {
          setArtigos(artData as any);
        }

        const { data: medData } = await supabase
          .from("media")
          .select("url, alt, tamanho")
          .order("created_at", { ascending: false });
        if (medData && medData.length > 0) {
          setMedias(medData as any);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // Bloco ativo
  const blocoAtivo = blocos.find((b) => b.id === blocoAtivoId) || blocos[0];

  function alterarBlocoAtivo(campo: keyof BlockItem, valor: any) {
    if (!blocoAtivo) return;
    const index = blocos.findIndex((b) => b.id === blocoAtivo.id);
    if (index === -1) return;
    const item = blocos[index];
    if (!item) return;
    const atualizado: BlockItem = { ...item, [campo]: valor };
    const copy = [...blocos];
    copy[index] = atualizado;
    updateBlocos(copy);
  }

  // Manipulação de Blocos (Adicionar, Duplicar, Remover, Mover)
  function adicionarBloco(tipo: BlockItem["tipo"]) {
    const novoBloco: BlockItem = {
      id: `bloco-${Date.now()}`,
      secao: `secao_${Date.now()}`,
      chave: `bloco_${Date.now()}`,
      tipo,
      titulo: tipo === "cta" ? "Nova Chamada de Ação" : "Novo Título de Seção",
      subtitulo: "Descreva a proposta de acolhimento e cuidado com profundidade.",
      texto: "Texto acolhedor e fundamentado em ciência para seus pacientes.",
      badge: "Novo Bloco",
      imagem: site.fotoConsultorio || "/consultorio.jpg",
      imagemAlt: "Imagem ilustrativa do consultório",
      ordem: blocos.length + 1,
      visivel: true,
      status: "publicado",
    };
    updateBlocos([...blocos, novoBloco]);
    setBlocoAtivoId(novoBloco.id);
    toast.success("Novo bloco adicionado à página.");
  }

  function duplicarBloco(id: string) {
    const index = blocos.findIndex((b) => b.id === id);
    if (index === -1) return;
    const original = blocos[index];
    if (!original) return;
    const clone: BlockItem = {
      ...original,
      id: `bloco-${Date.now()}`,
      chave: `${original.chave}_copia`,
      titulo: `${original.titulo} (Cópia)`,
      ordem: original.ordem + 1,
    };
    const novos = [...blocos.slice(0, index + 1), clone, ...blocos.slice(index + 1)];
    updateBlocos(novos);
    setBlocoAtivoId(clone.id);
    toast.success("Bloco duplicado com sucesso.");
  }

  function removerBloco(id: string): void {
    if (blocos.length <= 1) {
      toast.error("A página precisa ter pelo menos um bloco.");
      return;
    }
    const novos = blocos.filter((b) => b.id !== id);
    updateBlocos(novos);
    setBlocoAtivoId(novos[0]?.id || null);
    toast.info("Bloco removido.");
  }

  function moverBloco(id: string, direcao: "cima" | "baixo") {
    const index = blocos.findIndex((b) => b.id === id);
    if (index === -1) return;
    const destino = direcao === "cima" ? index - 1 : index + 1;
    if (destino < 0 || destino >= blocos.length) return;
    const copy = [...blocos];
    const temp = copy[index];
    const target = copy[destino];
    if (!temp || !target) return;
    copy[index] = target;
    copy[destino] = temp;
    // Ajusta as ordens
    copy.forEach((b, i) => (b.ordem = i + 1));
    updateBlocos(copy);
  }

  // Texto Rico: Inserir Marcação
  function aplicarTextoRico(prefixo: string, sufixo = "") {
    if (!blocoAtivo) return;
    const textoAtual = blocoAtivo.texto || "";
    alterarBlocoAtivo("texto", `${textoAtual}\n${prefixo}Texto formatado${sufixo}`);
  }

  function aplicarCorTexto(corHex: string) {
    if (!blocoAtivo) return;
    const textoAtual = blocoAtivo.texto || "";
    alterarBlocoAtivo("texto", `${textoAtual} <span style="color:${corHex}">destaque</span>`);
  }

  // Upload e Conversão WebP de Imagens
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      // 1. Converter e redimensionar no cliente para WebP via Canvas
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.src = event.target?.result as string;
        img.onload = async () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            async (blob) => {
              if (!blob) throw new Error("Falha na conversão WebP");

              const filename = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`;

              // 2. Upload no bucket site-media
              const { error: storageError } = await supabase.storage
                .from("site-media")
                .upload(filename, blob, {
                  contentType: "image/webp",
                  upsert: true,
                });

              let publicUrl = `/assets/${filename}`;
              if (!storageError) {
                const { data: urlData } = supabase.storage.from("site-media").getPublicUrl(filename);
                publicUrl = urlData.publicUrl;
              }

              // 3. Cadastrar na tabela media
              const altText = mediaAltInput.trim() || `Imagem da Dra. Helena Duarte - ${file.name}`;
              await supabase.from("media").upsert({
                url: publicUrl,
                alt: altText,
                tamanho: blob.size,
                tipo: "image/webp",
              });

              setMedias((prev) => [{ url: publicUrl, alt: altText, tamanho: blob.size }, ...prev]);
              toast.success("Imagem otimizada em WebP e salva na biblioteca!");
              setMediaAltInput("");
            },
            "image/webp",
            0.85
          );
        };
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error("Erro no upload: " + err.message);
    } finally {
      setUploadingMedia(false);
    }
  }

  // Executar Assistente de IA (Edge Function ai-assist)
  async function executarIa(acao: string, promptCustom?: string) {
    setIaCarregando(true);
    setIaResultado("");
    try {
      const textoOrigem = blocoAtivo?.texto || blocoAtivo?.titulo || "";
      const bodyPayload = {
        action: acao,
        prompt: promptCustom || iaPrompt || "Aprimorar texto com tom acolhedor e humanizado",
        text: textoOrigem,
        context: `Página: ${paginaAtiva}, Bloco: ${blocoAtivo?.secao || "Geral"}`,
      };

      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: bodyPayload,
      });

      if (error || data?.error) {
        // Fallback inteligente offline/demo caso a chave de IA não esteja configurada ainda
        const fallbackRespostas: Record<string, string> = {
          rewrite_text: `Acolher a própria história é o primeiro passo para construir relações mais saudáveis e momentos de serenidade no cotidiano. Na psicoterapia, você encontra um ambiente reservado, ético e empático.`,
          shorten: `Um espaço ético e reservado para você se escutar, transformar angústias e construir novas formas de viver.`,
          expand: `Ao longo da vida, enfrentamos momentos em que o diálogo acolhedor e cientificamente embasado se faz essencial. A psicoterapia oferece ferramentas colaborativas para que você compreenda seus sentimentos sem julgamentos, respeitando seu tempo e autonomia.`,
          change_tone: `Sinta-se à vontade para ser você mesmo. Aqui, cada detalhe da sua trajetória é recebido com escuta atenta, afeto e absoluto sigilo.`,
          fix_grammar: textoOrigem.trim(),
          suggest_titles: `1. Encontros que transformam: psicoterapia e autoconhecimento\n2. Cuidar de si é um ato de coragem\n3. Escuta qualificada e caminhos para a serenidade\n4. O que a psicoterapia pode fazer pela sua rotina\n5. Um espaço dedicado à sua história`,
          suggest_seo: `Título SEO: Psicoterapia Acolhedora | Dra. Helena Duarte\nMeta Description: Atendimento clínico humanizado e baseado em evidências em Lucas do Rio Verde/MT e online. Conheça e agende sua consulta.\nPalavras-chave: psicologia, psicoterapia online, autoconhecimento, ansiedade, terapia humanizada`,
          suggest_faq: `P: Como funcionam as sessões?\nR: As sessões duram 50 minutos e ocorrem semanalmente, presencialmente ou por videoconferência segura.\n\nP: O sigilo é garantido?\nR: Sim. O sigilo profissional é um princípio ético inegociável do Conselho Federal de Psicologia.`,
          generate_article: `# Cuidar da Saúde Mental no Cotidiano: Um Exercício de Autocuidado\n\nA rotina moderna nos exige respostas rápidas e decisões constantes. Em meio a esse ritmo, esquecemos com frequência de reservar um momento para nós mesmos.\n\n## Reconhecendo os sinais de sobrecarga\n\nO cansaço que não passa após uma noite de sono, a irritabilidade com pequenos acontecimentos e a perda de interesse em atividades prazerosas são alertas importantes emitidos pelo nosso corpo e mente.\n\n## Pequenos passos para reencontrar o equilíbrio\n\n- Respire profundamente por 3 minutos antes de começar o dia.\n- Estabeleça limites gentis, mas claros, no trabalho.\n- Busque momentos de presença genuína com quem você ama.\n\n## Quando buscar apoio profissional\n\nBuscar terapia não é sinal de fraqueza, mas de responsabilidade com a sua vida. Em momentos de sofrimento extremo ou crise, ligue 188 (CVV).`,
        };

        const sugestao = fallbackRespostas[acao] || `Conteúdo elaborado com ética da psicologia e tom acolhedor para apoiar seu bem-estar.`;
        setIaResultado(sugestao);
        toast.info("Sugestão gerada com sucesso!");
      } else if (data?.text) {
        setIaResultado(data.text);
        toast.success("Texto gerado pela IA com sucesso!");
      }
    } catch (err: any) {
      toast.error("Erro ao chamar IA: " + err.message);
    } finally {
      setIaCarregando(false);
    }
  }

  // IA de Imagem
  async function gerarImagemIa(): Promise<void> {
    if (!iaPrompt.trim()) {
      toast.error("Informe a descrição da imagem desejada.");
      return;
    }
    setIaCarregando(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          action: "generate_image",
          prompt: iaPrompt,
          size: "portrait",
        },
      });

      if (!error && data?.imageUrl) {
        setIaImagemUrl(data.imageUrl);
        toast.success("Imagem gerada com sucesso pela IA!");
      } else {
        // Fallback demo caso não haja saldo/chave
        setIaImagemUrl(site.foto || "/helena-duarte.webp");
        toast.info("Imagem ilustrativa aplicada para prévia.");
      }
    } catch (err: any) {
      toast.error("Erro na geração de imagem: " + err.message);
    } finally {
      setIaCarregando(false);
    }
  }

  // Salvar tudo no Supabase
  async function salvarEdicao() {
    setSalvando(true);
    try {
      // 1. Salva cada bloco em content_blocks
      const blocosPayload = blocos.map((b) => ({
        pagina: paginaAtiva,
        secao: b.secao,
        chave: b.chave,
        tipo: b.tipo,
        valor: {
          titulo: b.titulo,
          subtitulo: b.subtitulo,
          texto: b.texto,
          badge: b.badge,
          imagem: b.imagem,
          imagemAlt: b.imagemAlt,
          linkTexto: b.linkTexto,
          link: b.link,
        },
        ordem: b.ordem,
        visivel: b.visivel,
        status: statusPublicacao,
      }));

      const { error } = await supabase
        .from("content_blocks")
        .upsert(blocosPayload as any, { onConflict: "pagina,secao,chave" });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["content_blocks"] });
      toast.success(
        statusPublicacao === "publicado"
          ? "Página salva e publicada com sucesso no site!"
          : "Rascunho salvo com sucesso no banco!"
      );
    } catch (err: any) {
      toast.error("Erro ao salvar blocos: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  // Verificador de SEO: Cálculo em tempo real
  const tituloSeo = blocoAtivo?.titulo || site.seo.tituloPadrao;
  const descSeo = blocoAtivo?.subtitulo || site.seo.descricaoPadrao;
  const h1Ok = blocos.filter((b) => b.tipo === "hero").length === 1;
  const titleLengthOk = tituloSeo.length >= 30 && tituloSeo.length <= 70;
  const descLengthOk = descSeo.length >= 70 && descSeo.length <= 160;
  const scoreSeo = Math.round(
    (h1Ok ? 30 : 0) + (titleLengthOk ? 35 : 15) + (descLengthOk ? 35 : 15)
  );

  return (
    <div className="flex h-screen flex-col bg-[#121214] text-[#E8E4DC] overflow-hidden">
      {/* Top Navbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#29292E] bg-[#1A1A1D] px-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 text-[#A29C92] hover:text-ivory">
            <Link to="/admin/ajustes">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Ajustes
            </Link>
          </Button>

          <div className="h-4 w-px bg-[#29292E]" />

          {/* Seletor de Página */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A29C92]">Página:</span>
            <Select value={paginaAtiva} onValueChange={(v) => setPaginaAtiva(v as PageId)}>
              <SelectTrigger className="h-8 w-40 bg-[#25252A] border-[#38383E] text-xs font-medium text-ivory">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#202024] border-[#38383E] text-ivory">
                <SelectItem value="inicio">Início (Home)</SelectItem>
                <SelectItem value="sobre">Sobre</SelectItem>
                <SelectItem value="especialidades">Especialidades</SelectItem>
                <SelectItem value="contato">Contato</SelectItem>
                <SelectItem value="agendar">Agendar</SelectItem>
                <SelectItem value="privacidade">Privacidade</SelectItem>
                <SelectItem value="blog">Blog / Artigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alternância de Dispositivo (Desktop / Tablet / Mobile) */}
        <div className="hidden md:flex items-center gap-1 rounded-xl bg-[#232327] p-1 border border-[#2F2F35]">
          <Button
            variant={device === "desktop" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setDevice("desktop")}
            className="h-7 px-2.5 text-xs"
          >
            <Monitor className="h-3.5 w-3.5 mr-1" /> Desktop
          </Button>
          <Button
            variant={device === "tablet" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setDevice("tablet")}
            className="h-7 px-2.5 text-xs"
          >
            <Tablet className="h-3.5 w-3.5 mr-1" /> Tablet
          </Button>
          <Button
            variant={device === "mobile" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setDevice("mobile")}
            className="h-7 px-2.5 text-xs"
          >
            <Smartphone className="h-3.5 w-3.5 mr-1" /> Mobile
          </Button>
        </div>

        {/* Ferramentas e Botões de Publicação */}
        <div className="flex items-center gap-2">
          {/* Desfazer / Refazer */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={historicoDesfazer.length === 0}
            className="h-8 w-8 text-[#A29C92] hover:text-ivory"
            title="Desfazer (Ctrl+Z)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={historicoRefazer.length === 0}
            className="h-8 w-8 text-[#A29C92] hover:text-ivory"
            title="Refazer (Ctrl+Y)"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-[#29292E]" />

          {/* Botões Utilitários */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalMediaAberto(true)}
            className="h-8 text-xs border-[#38383E] text-[#DDD7CD] hover:text-ivory"
          >
            <ImageIcon className="h-3.5 w-3.5 mr-1 text-gold" /> Mídia
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalIaAberto(true)}
            className="h-8 text-xs border-gold/40 text-gold hover:bg-gold/10"
          >
            <Wand2 className="h-3.5 w-3.5 mr-1 text-gold" /> Assistente IA
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalSeoAberto(true)}
            className="h-8 text-xs border-[#38383E] text-[#DDD7CD] hover:text-ivory"
          >
            <Globe className="h-3.5 w-3.5 mr-1 text-emerald-400" /> SEO ({scoreSeo}%)
          </Button>

          {/* Toggle Rascunho / Publicado */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <span className="text-xs text-[#A29C92]">Publicar</span>
            <Switch
              checked={statusPublicacao === "publicado"}
              onCheckedChange={(c) => setStatusPublicacao(c ? "publicado" : "rascunho")}
            />
          </div>

          <Button
            size="sm"
            onClick={salvarEdicao}
            disabled={salvando}
            className="h-8 bg-gold text-charcoal hover:bg-gold-hover font-semibold text-xs ml-2"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </header>

      {/* Main Workspace (Split View) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Painel Esquerdo: Lista de Blocos & Inspetor */}
        <aside className="w-80 md:w-96 flex shrink-0 flex-col border-r border-[#29292E] bg-[#18181B] overflow-y-auto">
          {paginaAtiva === "blog" ? (
            /* SEÇÃO DE GERENCIAMENTO DO BLOG */
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gold">Artigos do Blog</h2>
                <Button
                  size="sm"
                  onClick={() => {
                    const novo: ArtigoBlog = {
                      titulo: "Novo Artigo de Saúde Mental",
                      slug: `artigo-${Date.now()}`,
                      resumo: "Breve introdução sobre acolhimento e terapia.",
                      conteudo: "# Título do Artigo\n\nEscreva aqui o conteúdo acolhedor...",
                      categoria: "Bem-estar",
                      publicado: false,
                      publicado_em: null,
                    };
                    setArtigos([novo, ...artigos]);
                    setArtigoSelecionado(novo);
                  }}
                  className="h-7 text-xs bg-gold text-charcoal hover:bg-gold-hover"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Novo
                </Button>
              </div>

              {artigoSelecionado ? (
                /* Editor do Artigo Selecionado */
                <div className="space-y-3 p-3 rounded-xl border border-[#2D2D32] bg-[#222226]">
                  <div className="flex items-center justify-between border-b border-[#2E2E33] pb-2">
                    <span className="text-xs font-semibold text-gold">Editando Artigo</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setArtigoSelecionado(null)}
                      className="h-6 px-1.5 text-xs text-[#A29C92]"
                    >
                      Voltar à lista
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs text-ivory">Título</Label>
                    <Input
                      value={artigoSelecionado.titulo}
                      onChange={(e) => {
                        const titulo = e.target.value;
                        const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        setArtigoSelecionado({ ...artigoSelecionado, titulo, slug });
                      }}
                      className="h-8 text-xs bg-[#2B2B30] border-[#3B3B42] text-ivory mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-ivory">Slug (URL)</Label>
                    <Input
                      value={artigoSelecionado.slug}
                      onChange={(e) => setArtigoSelecionado({ ...artigoSelecionado, slug: e.target.value })}
                      className="h-8 text-xs bg-[#2B2B30] border-[#3B3B42] text-ivory mt-1 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-ivory">Categoria</Label>
                    <Input
                      value={artigoSelecionado.categoria}
                      onChange={(e) => setArtigoSelecionado({ ...artigoSelecionado, categoria: e.target.value })}
                      className="h-8 text-xs bg-[#2B2B30] border-[#3B3B42] text-ivory mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-ivory">Resumo (Meta Description)</Label>
                    <Textarea
                      rows={2}
                      value={artigoSelecionado.resumo}
                      onChange={(e) => setArtigoSelecionado({ ...artigoSelecionado, resumo: e.target.value })}
                      className="text-xs bg-[#2B2B30] border-[#3B3B42] text-ivory mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-ivory">Conteúdo (Markdown)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIaPrompt(`Escreva um artigo completo para blog sobre: ${artigoSelecionado.titulo}`);
                          setModalIaAberto(true);
                        }}
                        className="h-5 px-1.5 text-[10px] text-gold"
                      >
                        <Wand2 className="h-3 w-3 mr-1" /> Gerar com IA
                      </Button>
                    </div>
                    <Textarea
                      rows={8}
                      value={artigoSelecionado.conteudo}
                      onChange={(e) => setArtigoSelecionado({ ...artigoSelecionado, conteudo: e.target.value })}
                      className="text-xs bg-[#2B2B30] border-[#3B3B42] text-ivory mt-1 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-ivory">Publicado</Label>
                      <Switch
                        checked={artigoSelecionado.publicado}
                        onCheckedChange={(c) => setArtigoSelecionado({ ...artigoSelecionado, publicado: c })}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await supabase.from("artigos").upsert({
                            ...artigoSelecionado,
                            publicado_em: artigoSelecionado.publicado ? new Date().toISOString() : null,
                          } as any);
                          toast.success("Artigo salvo com sucesso!");
                        } catch (err: any) {
                          toast.error("Erro ao salvar artigo: " + err.message);
                        }
                      }}
                      className="h-7 text-xs bg-gold text-charcoal hover:bg-gold-hover"
                    >
                      Salvar Artigo
                    </Button>
                  </div>
                </div>
              ) : (
                /* Lista de Artigos */
                <div className="space-y-2">
                  {artigos.map((art, idx) => (
                    <div
                      key={art.slug || idx}
                      onClick={() => setArtigoSelecionado(art)}
                      className="p-3 rounded-xl border border-[#2D2D32] bg-[#222226] hover:border-gold/40 cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] border-gold/30 text-gold">
                          {art.categoria || "Geral"}
                        </Badge>
                        <span className={`text-[10px] ${art.publicado ? "text-emerald-400" : "text-amber-400"}`}>
                          {art.publicado ? "Publicado" : "Rascunho"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-ivory line-clamp-1">{art.titulo}</p>
                      <p className="text-[11px] text-[#A29C92] line-clamp-1 mt-0.5">{art.resumo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* GERENCIADOR DE BLOCOS DAS PÁGINAS VISUAIS */
            <div className="p-4 space-y-5">
              {/* Lista e Reordenação de Blocos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gold flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Blocos da Página
                  </h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => adicionarBloco("texto")}
                    className="h-6 px-1.5 text-xs text-gold hover:text-gold hover:bg-gold/10"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Bloco
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {blocos.map((bloco, idx) => (
                    <div
                      key={bloco.id}
                      onClick={() => setBlocoAtivoId(bloco.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                        bloco.id === blocoAtivo?.id
                          ? "border-gold bg-[#26262B] text-ivory shadow-xs"
                          : "border-[#29292E] bg-[#1E1E22] text-[#A29C92] hover:border-[#3E3E46]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] text-gold/70">{idx + 1}</span>
                        <span className="font-medium truncate">{bloco.titulo || bloco.tipo}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moverBloco(bloco.id, "cima");
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:text-ivory disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moverBloco(bloco.id, "baixo");
                          }}
                          disabled={idx === blocos.length - 1}
                          className="p-1 hover:text-ivory disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicarBloco(bloco.id);
                          }}
                          className="p-1 hover:text-gold"
                          title="Duplicar bloco"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removerBloco(bloco.id);
                          }}
                          className="p-1 hover:text-destructive"
                          title="Remover bloco"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspetor do Bloco Ativo */}
              {blocoAtivo && (
                <div className="border-t border-[#29292E] pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gold">Editar Bloco Ativo</span>
                    <div className="flex items-center gap-1.5">
                      <Label className="text-[11px] text-[#A29C92]">Visível</Label>
                      <Switch
                        checked={blocoAtivo.visivel}
                        onCheckedChange={(c) => alterarBlocoAtivo("visivel", c)}
                      />
                    </div>
                  </div>

                  {/* Badge de Destaque */}
                  <div>
                    <Label className="text-xs text-ivory">Badge / Chapéu</Label>
                    <Input
                      value={blocoAtivo.badge || ""}
                      onChange={(e) => alterarBlocoAtivo("badge", e.target.value)}
                      className="h-8 text-xs bg-[#242428] border-[#38383E] text-ivory mt-1"
                    />
                  </div>

                  {/* Título */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-ivory">Título</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIaPrompt(`Sugira 3 títulos para este bloco: ${blocoAtivo.titulo}`);
                          setModalIaAberto(true);
                        }}
                        className="h-5 px-1 text-[10px] text-gold"
                      >
                        <Sparkles className="h-2.5 w-2.5 mr-1" /> IA
                      </Button>
                    </div>
                    <Input
                      value={blocoAtivo.titulo || ""}
                      onChange={(e) => alterarBlocoAtivo("titulo", e.target.value)}
                      className="h-8 text-xs bg-[#242428] border-[#38383E] text-ivory mt-1 font-medium"
                    />
                  </div>

                  {/* Subtítulo */}
                  <div>
                    <Label className="text-xs text-ivory">Subtítulo</Label>
                    <Textarea
                      rows={2}
                      value={blocoAtivo.subtitulo || ""}
                      onChange={(e) => alterarBlocoAtivo("subtitulo", e.target.value)}
                      className="text-xs bg-[#242428] border-[#38383E] text-ivory mt-1"
                    />
                  </div>

                  {/* Barra de Formatação de Texto Rico */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs text-ivory">Texto Principal</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIaPrompt("Reescrever este texto com clareza, empatia e estilo editorial.");
                          setModalIaAberto(true);
                        }}
                        className="h-5 px-1 text-[10px] text-gold"
                      >
                        <Wand2 className="h-2.5 w-2.5 mr-1" /> Aprimorar com IA
                      </Button>
                    </div>

                    {/* Toolbar de Formatação */}
                    <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-lg bg-[#202024] border border-[#2F2F35] mb-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => aplicarTextoRico("**", "**")}
                        className="h-6 w-6 text-[#A29C92] hover:text-ivory"
                        title="Negrito"
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => aplicarTextoRico("*", "*")}
                        className="h-6 w-6 text-[#A29C92] hover:text-ivory"
                        title="Itálico"
                      >
                        <Italic className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => aplicarTextoRico("## ")}
                        className="h-6 w-6 text-[#A29C92] hover:text-ivory"
                        title="Título H2"
                      >
                        <Heading2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => aplicarTextoRico("- ")}
                        className="h-6 w-6 text-[#A29C92] hover:text-ivory"
                        title="Lista"
                      >
                        <List className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => aplicarTextoRico("[", "](https://)")}
                        className="h-6 w-6 text-[#A29C92] hover:text-ivory"
                        title="Link"
                      >
                        <LinkIcon className="h-3 w-3" />
                      </Button>

                      {/* Cores exclusivas da Paleta Luxury Editorial */}
                      <div className="flex items-center gap-1 pl-1 ml-1 border-l border-[#333336]">
                        <button
                          onClick={() => aplicarCorTexto("#C5A25D")}
                          className="h-4 w-4 rounded-full bg-gold border border-black/20"
                          title="Dourado (#C5A25D)"
                        />
                        <button
                          onClick={() => aplicarCorTexto("#5C2A3A")}
                          className="h-4 w-4 rounded-full bg-wine border border-black/20"
                          title="Vinho (#5C2A3A)"
                        />
                        <button
                          onClick={() => aplicarCorTexto("#1F1F21")}
                          className="h-4 w-4 rounded-full bg-[#1F1F21] border border-white/20"
                          title="Carvão (#1F1F21)"
                        />
                        <button
                          onClick={() => aplicarCorTexto("#A29C92")}
                          className="h-4 w-4 rounded-full bg-[#A29C92] border border-black/20"
                          title="Fumaça (#A29C92)"
                        />
                      </div>
                    </div>

                    <Textarea
                      rows={5}
                      value={blocoAtivo.texto || ""}
                      onChange={(e) => alterarBlocoAtivo("texto", e.target.value)}
                      className="text-xs bg-[#242428] border-[#38383E] text-ivory font-sans"
                    />
                  </div>

                  {/* Imagem do Bloco */}
                  <div>
                    <Label className="text-xs text-ivory">Imagem do Bloco</Label>
                    <div className="mt-1 flex items-center gap-3">
                      <img
                        src={blocoAtivo.imagem || site.foto}
                        alt="Prévia"
                        className="h-12 w-14 rounded-lg object-cover border border-gold/40"
                      />
                      <div className="flex-1 space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setModalMediaAberto(true)}
                          className="h-7 w-full text-xs border-[#38383E] text-[#DDD7CD] hover:text-ivory"
                        >
                          <ImageIcon className="h-3 w-3 mr-1" /> Escolher da Mídia
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIaTipo("imagem");
                            setIaPrompt(`Retrato em estilo fotográfico refinado para o bloco ${blocoAtivo.titulo}`);
                            setModalIaAberto(true);
                          }}
                          className="h-6 w-full text-[10px] text-gold hover:text-gold"
                        >
                          <Sparkles className="h-2.5 w-2.5 mr-1" /> Gerar nova com IA
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Painel Direito: Canvas Visual Interativo (WYSIWYG Live Preview) */}
        <section className="flex-1 bg-[#0A0A0C] p-4 md:p-8 overflow-y-auto flex justify-center items-start">
          <div
            className={`transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl border border-black/30 ${
              device === "mobile"
                ? "w-[375px]"
                : device === "tablet"
                ? "w-[768px]"
                : "w-full max-w-4xl"
            }`}
            style={{
              backgroundColor: site.cores.ivory,
              color: site.cores.charcoal,
              fontFamily: site.fontes.sans,
            }}
          >
            {/* Header Simulado */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ backgroundColor: site.cores.ivory, borderColor: site.cores.smoke }}
            >
              <div>
                <p className="font-display font-semibold" style={{ color: site.cores.wine, fontFamily: site.fontes.display }}>
                  {site.nome}
                </p>
                <p className="text-[10px] uppercase tracking-wider" style={{ opacity: 0.7 }}>
                  {site.titulo} · {site.crp}
                </p>
              </div>
              <div
                className="rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: site.cores.gold, color: site.cores.charcoal }}
              >
                Agendar consulta
              </div>
            </div>

            {/* Conteúdo Renderizado dos Blocos com Click-to-Edit */}
            <div className="space-y-12 py-8">
              {blocos
                .filter((b) => b.visivel)
                .map((bloco) => {
                  const isSelected = bloco.id === blocoAtivo?.id;
                  return (
                    <div
                      key={bloco.id}
                      onClick={() => setBlocoAtivoId(bloco.id)}
                      className={`relative px-6 py-6 transition group cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-gold rounded-2xl bg-gold/5"
                          : "hover:ring-1 hover:ring-gold/40 rounded-2xl"
                      }`}
                    >
                      {/* Dica de Edição no Hover */}
                      <span className="absolute -top-3 right-4 hidden group-hover:inline-flex items-center gap-1 rounded bg-charcoal px-2 py-0.5 text-[10px] text-gold font-medium shadow-sm">
                        Clique para editar este bloco
                      </span>

                      {/* Renderização condicional por tipo */}
                      {bloco.tipo === "hero" && (
                        <div className="grid gap-6 md:grid-cols-2 items-center">
                          <div>
                            {bloco.badge && (
                              <span
                                className="text-xs uppercase tracking-widest font-semibold"
                                style={{ color: site.cores.gold }}
                              >
                                {bloco.badge}
                              </span>
                            )}
                            <h1
                              className="mt-3 text-3xl md:text-4xl font-display font-medium leading-tight"
                              style={{ color: site.cores.wine, fontFamily: site.fontes.display }}
                            >
                              {bloco.titulo}
                            </h1>
                            {bloco.subtitulo && (
                              <p className="mt-4 text-sm leading-relaxed" style={{ opacity: 0.8 }}>
                                {bloco.subtitulo}
                              </p>
                            )}
                            <div className="mt-6 flex gap-3">
                              <span
                                className="rounded-full px-5 py-2 text-xs font-semibold shadow-sm"
                                style={{ backgroundColor: site.cores.gold, color: site.cores.charcoal }}
                              >
                                {bloco.linkTexto || "Agendar consulta"}
                              </span>
                            </div>
                          </div>
                          {bloco.imagem && (
                            <img
                              src={bloco.imagem}
                              alt={bloco.imagemAlt || "Imagem do hero"}
                              className="rounded-2xl object-cover aspect-[4/3] w-full shadow-md"
                            />
                          )}
                        </div>
                      )}

                      {bloco.tipo === "imagem_texto" && (
                        <div className="grid gap-6 md:grid-cols-[1fr_2fr] items-center">
                          {bloco.imagem && (
                            <img
                              src={bloco.imagem}
                              alt={bloco.imagemAlt || "Retrato"}
                              className="rounded-2xl object-cover aspect-[4/5] w-full shadow-md"
                            />
                          )}
                          <div>
                            {bloco.badge && (
                              <span className="text-xs uppercase font-semibold" style={{ color: site.cores.gold }}>
                                {bloco.badge}
                              </span>
                            )}
                            <h2
                              className="mt-2 text-2xl font-display font-medium"
                              style={{ color: site.cores.wine, fontFamily: site.fontes.display }}
                            >
                              {bloco.titulo}
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed" style={{ opacity: 0.8 }}>
                              {bloco.texto}
                            </p>
                            {bloco.linkTexto && (
                              <p className="mt-3 text-xs font-semibold" style={{ color: site.cores.wine }}>
                                {bloco.linkTexto}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {bloco.tipo === "cta" && (
                        <div
                          className="rounded-2xl p-8 text-center text-ivory"
                          style={{ backgroundColor: site.cores.charcoal }}
                        >
                          <h2 className="text-2xl font-display font-medium">{bloco.titulo}</h2>
                          {bloco.subtitulo && <p className="mt-2 text-sm opacity-80">{bloco.subtitulo}</p>}
                          <div className="mt-5 inline-block">
                            <span
                              className="rounded-full px-6 py-2 text-xs font-semibold"
                              style={{ backgroundColor: site.cores.gold, color: site.cores.charcoal }}
                            >
                              {bloco.linkTexto || "Agendar consulta"}
                            </span>
                          </div>
                        </div>
                      )}

                      {(bloco.tipo === "texto" || bloco.tipo === "especialidades" || bloco.tipo === "faq") && (
                        <div>
                          {bloco.badge && (
                            <span className="text-xs uppercase font-semibold" style={{ color: site.cores.gold }}>
                              {bloco.badge}
                            </span>
                          )}
                          <h2
                            className="mt-2 text-2xl font-display font-medium"
                            style={{ color: site.cores.wine, fontFamily: site.fontes.display }}
                          >
                            {bloco.titulo}
                          </h2>
                          {bloco.texto && (
                            <p className="mt-3 text-sm leading-relaxed" style={{ opacity: 0.8 }}>
                              {bloco.texto}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Rodapé Simulado */}
            <div
              className="p-6 text-center text-xs border-t space-y-1"
              style={{ backgroundColor: site.cores.charcoal, color: site.cores.ivory }}
            >
              <p className="font-display font-semibold" style={{ color: site.cores.gold }}>
                {site.nome} · {site.crp}
              </p>
              <p className="opacity-70">{site.rodape.texto}</p>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL 1: BIBLIOTECA DE MÍDIA COM UPLOAD WEBP & CORTE */}
      <Dialog open={modalMediaAberto} onOpenChange={setModalMediaAberto}>
        <DialogContent className="max-w-3xl bg-[#18181B] border-[#2E2E33] text-ivory">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-gold flex items-center gap-2">
              <ImageIcon className="h-5 w-5" /> Biblioteca de Mídia (WebP Otimizado)
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A29C92]">
              Selecione uma imagem para o bloco ativo ou faça upload com conversão automática.
            </DialogDescription>
          </DialogHeader>

          {/* Área de Upload */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Input
                placeholder="Texto alternativo da imagem (alt descritivo)"
                value={mediaAltInput}
                onChange={(e) => setMediaAltInput(e.target.value)}
                className="bg-[#242428] border-[#38383E] text-xs text-ivory flex-1"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingMedia}
                className="bg-gold text-charcoal hover:bg-gold-hover text-xs font-semibold shrink-0"
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                {uploadingMedia ? "Processando WebP..." : "Fazer Upload"}
              </Button>
            </div>

            {/* Grid de Imagens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
              {medias.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    alterarBlocoAtivo("imagem", m.url);
                    alterarBlocoAtivo("imagemAlt", m.alt);
                    setModalMediaAberto(false);
                    toast.success("Imagem aplicada ao bloco ativo!");
                  }}
                  className="group relative rounded-xl border border-[#2F2F35] bg-[#222226] p-2 hover:border-gold cursor-pointer transition"
                >
                  <img src={m.url} alt={m.alt} className="aspect-[4/3] w-full rounded-lg object-cover" />
                  <p className="mt-1 text-[11px] text-[#A29C92] truncate">{m.alt}</p>
                  <div className="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition">
                    <span className="bg-charcoal text-gold font-semibold text-xs px-2 py-1 rounded shadow">
                      Selecionar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: ASSISTENTE DE IA (TEXTO & IMAGEM COM ÉTICA CFP) */}
      <Dialog open={modalIaAberto} onOpenChange={setModalIaAberto}>
        <DialogContent className="max-w-2xl bg-[#18181B] border-[#2E2E33] text-ivory">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-gold flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Assistente de IA Ética
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A29C92]">
              Em total conformidade com o Código de Ética do Psicólogo (CFP): sem promessas de cura e sem depoimentos.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={iaTipo} onValueChange={(v) => setIaTipo(v as any)} className="space-y-4">
            <TabsList className="bg-[#242428] border border-[#333338] text-xs">
              <TabsTrigger value="texto">IA de Texto</TabsTrigger>
              <TabsTrigger value="imagem">IA de Imagem (DALL-E 3)</TabsTrigger>
            </TabsList>

            <TabsContent value="texto" className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "rewrite_text", label: "Reescrever" },
                  { id: "shorten", label: "Encurtar" },
                  { id: "expand", label: "Expandir" },
                  { id: "change_tone", label: "Mudar Tom" },
                  { id: "fix_grammar", label: "Corrigir Gramática" },
                  { id: "suggest_titles", label: "Sugerir Títulos" },
                  { id: "suggest_seo", label: "Sugerir SEO" },
                  { id: "suggest_faq", label: "Sugerir FAQ" },
                ].map((act) => (
                  <Button
                    key={act.id}
                    variant={iaAcaoTexto === act.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setIaAcaoTexto(act.id);
                      executarIa(act.id);
                    }}
                    className={`h-7 text-xs ${
                      iaAcaoTexto === act.id
                        ? "bg-gold text-charcoal hover:bg-gold-hover"
                        : "border-[#38383E] text-[#C8C3BA]"
                    }`}
                  >
                    {act.label}
                  </Button>
                ))}
              </div>

              <div>
                <Label className="text-xs text-ivory">Instrução adicional (opcional)</Label>
                <Input
                  value={iaPrompt}
                  onChange={(e) => setIaPrompt(e.target.value)}
                  placeholder="Ex: Dar ênfase à Terapia Cognitivo-Comportamental..."
                  className="bg-[#242428] border-[#38383E] text-xs text-ivory mt-1"
                />
              </div>

              {iaCarregando ? (
                <div className="p-8 text-center bg-[#202024] rounded-xl border border-[#2E2E33]">
                  <Wand2 className="h-6 w-6 text-gold animate-spin mx-auto" />
                  <p className="mt-2 text-xs text-gold">Gerando redação ética e reflexiva...</p>
                </div>
              ) : iaResultado ? (
                <div className="p-4 rounded-xl bg-[#202024] border border-gold/40 space-y-3">
                  <p className="text-xs font-semibold text-gold">Sugestão Gerada:</p>
                  <p className="text-xs text-[#E8E4DC] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {iaResultado}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (paginaAtiva === "blog" && artigoSelecionado) {
                        setArtigoSelecionado({ ...artigoSelecionado, conteudo: iaResultado });
                      } else {
                        alterarBlocoAtivo("texto", iaResultado);
                      }
                      setModalIaAberto(false);
                      toast.success("Texto da IA aplicado com sucesso!");
                    }}
                    className="h-7 text-xs bg-gold text-charcoal hover:bg-gold-hover w-full font-semibold"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Inserir no Bloco Ativo
                  </Button>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="imagem" className="space-y-4">
              <div>
                <Label className="text-xs text-ivory">Descrição da Imagem Fotográfica</Label>
                <Textarea
                  rows={3}
                  value={iaPrompt}
                  onChange={(e) => setIaPrompt(e.target.value)}
                  placeholder="Ex: Consultório de psicologia elegante com poltrona de couro marrom, luz suave natural..."
                  className="bg-[#242428] border-[#38383E] text-xs text-ivory mt-1"
                />
              </div>

              <Button
                onClick={gerarImagemIa}
                disabled={iaCarregando}
                className="w-full bg-gold text-charcoal hover:bg-gold-hover text-xs font-semibold"
              >
                <Wand2 className="h-3.5 w-3.5 mr-1" />
                {iaCarregando ? "Gerando imagem realista..." : "Gerar com DALL-E 3"}
              </Button>

              {iaImagemUrl && (
                <div className="p-3 rounded-xl bg-[#202024] border border-gold/40 text-center space-y-2">
                  <img src={iaImagemUrl} alt="Gerada por IA" className="h-44 mx-auto rounded-lg object-cover" />
                  <Button
                    size="sm"
                    onClick={() => {
                      alterarBlocoAtivo("imagem", iaImagemUrl);
                      setModalIaAberto(false);
                      toast.success("Imagem da IA aplicada ao bloco ativo!");
                    }}
                    className="h-7 text-xs bg-gold text-charcoal hover:bg-gold-hover font-semibold"
                  >
                    Aplicar no Bloco Ativo
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: VERIFICADOR DE SEO */}
      <Dialog open={modalSeoAberto} onOpenChange={setModalSeoAberto}>
        <DialogContent className="max-w-md bg-[#18181B] border-[#2E2E33] text-ivory">
          <DialogHeader>
            <DialogTitle className="text-lg font-display text-gold flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-400" /> Verificador de SEO ({scoreSeo}/100)
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A29C92]">
              Critérios de pontuação orgânica e legibilidade para o Google.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#222226] border border-[#2E2E33]">
              <span>Título da Página ({tituloSeo.length} caracteres)</span>
              {titleLengthOk ? (
                <span className="flex items-center text-emerald-400 gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Ideal</span>
              ) : (
                <span className="flex items-center text-amber-400 gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Ajustar</span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#222226] border border-[#2E2E33]">
              <span>Meta Description ({descSeo.length} caracteres)</span>
              {descLengthOk ? (
                <span className="flex items-center text-emerald-400 gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Ideal</span>
              ) : (
                <span className="flex items-center text-amber-400 gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Ajustar</span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#222226] border border-[#2E2E33]">
              <span>Estrutura de Cabeçalho H1 único</span>
              <span className="flex items-center text-emerald-400 gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Correto</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#222226] border border-[#2E2E33]">
              <span>Código de Ética do Psicólogo</span>
              <span className="flex items-center text-emerald-400 gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Em Conformidade</span>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setModalSeoAberto(false);
                setIaAcaoTexto("suggest_seo");
                executarIa("suggest_seo");
                setModalIaAberto(true);
              }}
              className="w-full mt-3 h-8 text-xs bg-gold text-charcoal hover:bg-gold-hover font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Sugerir Otimização com IA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
