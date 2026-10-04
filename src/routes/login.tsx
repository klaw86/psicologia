import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSiteSettings } from "@/hooks/use-public-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Área Restrita | Login do Administrador" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.24C.45 8.18 0 9.99 0 12s.45 3.82 1.24 5.39l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.61l4.03 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const site = useSiteSettings();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const [carregandoMagicLink, setCarregandoMagicLink] = useState(false);
  const [magicLinkEnviado, setMagicLinkEnviado] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Modo de recuperação de senha
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [recuperacaoSucesso, setRecuperacaoSucesso] = useState(false);
  const [carregandoRecuperacao, setCarregandoRecuperacao] = useState(false);

  // Redireciona para o painel se já for administrador autenticado
  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) {
        navigate({ to: "/admin/ajustes", replace: true });
      } else {
        setErroMsg(
          `Acesso negado: A conta conectada (${user.email}) não possui privilégios de administrador. Utilize a conta klaw.com@gmail.com.`
        );
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Login com a Conta Google (OAuth)
  async function handleGoogleLogin() {
    setErroMsg(null);
    setCarregandoGoogle(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/ajustes`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        if (
          error.message.includes("provider is not enabled") ||
          error.message.includes("Unsupported provider")
        ) {
          setErroMsg(
            "O provedor Google precisa ser ativado no painel do Supabase (Authentication > Providers > Google). Como alternativa imediata, use o botão 'Receber Link de Acesso no E-mail (Sem Senha)' abaixo."
          );
        } else {
          setErroMsg("Erro ao iniciar login com Google: " + error.message);
        }
      }
    } catch (err: any) {
      setErroMsg("Falha ao comunicar com o serviço do Google: " + err.message);
    } finally {
      setCarregandoGoogle(false);
    }
  }

  // Login sem senha via Link Mágico (Magic Link no e-mail)
  async function handleMagicLink(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErroMsg(null);
    const emailAlvo = email.trim() || "klaw.com@gmail.com";
    setCarregandoMagicLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailAlvo,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/ajustes`,
        },
      });

      if (error) {
        setErroMsg("Erro ao enviar link de acesso: " + error.message);
        return;
      }

      setMagicLinkEnviado(true);
      toast.success("Link mágico enviado para seu e-mail!");
    } catch (err: any) {
      setErroMsg("Falha ao solicitar link de acesso: " + err.message);
    } finally {
      setCarregandoMagicLink(false);
    }
  }

  // Login com e-mail e senha
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErroMsg(null);

    const emailLimpo = email.trim();
    if (!emailLimpo || !senha) {
      setErroMsg("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setCarregando(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailLimpo,
        password: senha,
      });

      if (error) {
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid_grant")
        ) {
          setErroMsg("E-mail ou senha incorretos. Você pode entrar com o Google ou solicitar o Link Mágico abaixo.");
        } else if (error.message.includes("Email not confirmed")) {
          setErroMsg("Este e-mail ainda não foi confirmado no Supabase.");
        } else if (error.message.includes("Too many requests")) {
          setErroMsg("Muitas tentativas sem sucesso. Aguarde alguns minutos e tente novamente.");
        } else {
          setErroMsg("Erro ao autenticar: " + error.message);
        }
        return;
      }

      if (!data.user) {
        setErroMsg("Não foi possível obter dados do usuário.");
        return;
      }

      // Validação do papel no banco (tabela user_roles)
      try {
        await (supabase.rpc as any)("claim_admin_role");
      } catch {}

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      if (rolesError || !roles || !roles.some((r: { role: string }) => r.role === "admin")) {
        await supabase.auth.signOut();
        setErroMsg(
          "Acesso restrito: Esta conta não possui privilégios de administrador do sistema."
        );
        return;
      }

      toast.success("Acesso autorizado! Bem-vindo(a) ao painel.");
      navigate({ to: "/admin" });
    } catch (err: any) {
      setErroMsg("Ocorreu um erro inesperado ao conectar. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  }

  // Enviar link de recuperação de senha
  async function handleRecuperarSenha(e: React.FormEvent) {
    e.preventDefault();
    setErroMsg(null);

    const emailLimpo = emailRecuperacao.trim();
    if (!emailLimpo) {
      setErroMsg("Informe o e-mail para receber as instruções.");
      return;
    }

    setCarregandoRecuperacao(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
        redirectTo: `${window.location.origin}/login?redefinir=true`,
      });

      if (error) {
        setErroMsg("Não foi possível enviar o e-mail de recuperação: " + error.message);
        return;
      }

      setRecuperacaoSucesso(true);
      toast.success("Instruções de redefinição enviadas!");
    } catch (err: any) {
      setErroMsg("Erro ao solicitar redefinição: " + err.message);
    } finally {
      setCarregandoRecuperacao(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 selection:bg-gold/20"
      style={{
        backgroundColor: site.cores.ivory,
        color: site.cores.charcoal,
        fontFamily: site.fontes.sans,
      }}
    >
      {/* Botão Superior para Retornar ao Site */}
      <div className="absolute top-6 left-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-charcoal/70 hover:text-charcoal hover:bg-black/5"
        >
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Voltar ao site público
          </Link>
        </Button>
      </div>

      {/* Card Central de Login */}
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[#303034] bg-charcoal p-8 md:p-10 shadow-2xl text-ivory">
          {/* Cabeçalho do Card */}
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1
              className="text-2xl font-semibold tracking-tight text-ivory"
              style={{ fontFamily: site.fontes.display }}
            >
              Área Restrita
            </h1>
            <p className="text-xs text-[#A29C92] max-w-xs mx-auto">
              Acesso exclusivo para o administrador da clínica: <span className="text-gold font-medium">klaw.com@gmail.com</span>
            </p>
          </div>

          {/* Mensagem de Erro Clara */}
          {erroMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{erroMsg}</p>
            </div>
          )}

          {/* Notificação de Magic Link Enviado */}
          {magicLinkEnviado && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <p className="leading-relaxed">
                Link de acesso enviado para <strong>klaw.com@gmail.com</strong>! Abra seu e-mail e clique no link para entrar instantaneamente no painel, sem precisar de senha.
              </p>
            </div>
          )}

          {!modoRecuperacao ? (
            <div className="space-y-5">
              {/* BOTÃO 1: ENTRAR COM A CONTA GOOGLE */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={carregandoGoogle || carregando}
                className="w-full h-11 rounded-xl bg-white text-[#202124] hover:bg-[#F1F3F4] font-medium text-xs flex items-center justify-center gap-3 transition shadow-sm border border-white/20"
              >
                {carregandoGoogle ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#202124]" />
                    Conectando com o Google...
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span className="font-semibold text-xs tracking-wide">
                      Entrar com a Conta Google
                    </span>
                  </>
                )}
              </Button>

              {/* BOTÃO 2: ENTRAR SEM SENHA VIA LINK MÁGICO */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleMagicLink()}
                disabled={carregandoMagicLink || carregandoGoogle}
                className="w-full h-9 rounded-xl border-[#3E3E44] bg-[#242428] text-[#DDD7CD] hover:text-ivory hover:bg-[#2A2A30] text-xs flex items-center justify-center gap-2 transition"
              >
                {carregandoMagicLink ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                )}
                <span>Acessar via Link no E-mail (Sem Senha)</span>
              </Button>

              {/* DIVISOR DE OPÇÕES */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#333338]" />
                </div>
                <span className="relative bg-charcoal px-3 text-[11px] uppercase tracking-wider text-[#8A857B]">
                  ou com e-mail e senha
                </span>
              </div>

              {/* FORMULÁRIO DE LOGIN COM SENHA */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#DDD7CD]">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8A857B]" />
                    <Input
                      type="email"
                      placeholder="klaw.com@gmail.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 pl-9 bg-[#29292D] border-[#3E3E44] text-xs text-ivory placeholder:text-[#7A756D] focus-visible:ring-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-[#DDD7CD]">Senha</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setModoRecuperacao(true);
                        setErroMsg(null);
                        setEmailRecuperacao(email || "klaw.com@gmail.com");
                      }}
                      className="text-[11px] text-gold hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#8A857B]" />
                    <Input
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="Sua senha de acesso"
                      autoComplete="current-password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      className="h-10 pl-9 pr-10 bg-[#29292D] border-[#3E3E44] text-xs text-ivory placeholder:text-[#7A756D] focus-visible:ring-gold"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-2.5 text-[#8A857B] hover:text-ivory"
                      aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                    >
                      {mostrarSenha ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={carregando || carregandoGoogle}
                  className="w-full h-10 rounded-xl bg-gold text-charcoal hover:bg-gold-hover font-semibold text-xs transition shadow-md mt-2"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validando credenciais...
                    </>
                  ) : (
                    "Entrar com Senha"
                  )}
                </Button>
              </form>
            </div>
          ) : (
            /* FORMULÁRIO DE RECUPERAÇÃO DE SENHA */
            <div className="space-y-5">
              {recuperacaoSucesso ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center space-y-3">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                  <p className="text-xs font-semibold text-emerald-300">
                    Instruções enviadas com sucesso!
                  </p>
                  <p className="text-[11px] text-[#A29C92] leading-relaxed">
                    Verifique sua caixa de entrada e spam no endereço <strong>{emailRecuperacao}</strong>. O link para redefinição de senha foi enviado.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setModoRecuperacao(false);
                      setRecuperacaoSucesso(false);
                    }}
                    className="w-full text-xs border-[#3E3E44] text-ivory hover:bg-white/5"
                  >
                    Voltar à tela de login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRecuperarSenha} className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-gold">
                    <KeyRound className="h-4 w-4" />
                    <span className="font-semibold">Redefinir Senha de Acesso</span>
                  </div>
                  <p className="text-xs text-[#A29C92]">
                    Digite seu e-mail cadastrado. Enviaremos um link seguro para você definir uma nova senha imediatamente.
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#DDD7CD]">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8A857B]" />
                      <Input
                        type="email"
                        placeholder="klaw.com@gmail.com"
                        value={emailRecuperacao}
                        onChange={(e) => setEmailRecuperacao(e.target.value)}
                        required
                        className="h-10 pl-9 bg-[#29292D] border-[#3E3E44] text-xs text-ivory focus-visible:ring-gold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={carregandoRecuperacao}
                      className="w-full h-10 rounded-xl bg-gold text-charcoal hover:bg-gold-hover font-semibold text-xs shadow-md"
                    >
                      {carregandoRecuperacao ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar Link de Redefinição"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setModoRecuperacao(false);
                        setErroMsg(null);
                      }}
                      className="text-xs text-[#A29C92] hover:text-ivory"
                    >
                      Cancelar e voltar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Rodapé do Card */}
          <div className="mt-8 border-t border-[#2B2B30] pt-4 text-center">
            <p className="text-[11px] text-[#7A756D]">
              Sem senha? Use <strong>Entrar com a Conta Google</strong> ou <strong>Link no E-mail</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
