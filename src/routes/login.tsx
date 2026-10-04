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

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const site = useSiteSettings();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Modo de recuperação de senha
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [recuperacaoSucesso, setRecuperacaoSucesso] = useState(false);
  const [carregandoRecuperacao, setCarregandoRecuperacao] = useState(false);

  // Se já estiver logado como administrador, redireciona direto
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [user, isAdmin, authLoading, navigate]);

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
          setErroMsg("E-mail ou senha incorretos. Por favor, verifique seus dados.");
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
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      if (rolesError || !roles || !roles.some((r: { role: string }) => r.role === "admin")) {
        // Usuário sem papel de admin (ex: demo ou regular)
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
          <div className="text-center space-y-2 mb-8">
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
              Acesso exclusivo para gerenciamento da clínica e conteúdo editorial.
            </p>
          </div>

          {/* Mensagem de Erro Clara */}
          {erroMsg && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{erroMsg}</p>
            </div>
          )}

          {!modoRecuperacao ? (
            /* FORMULÁRIO DE LOGIN */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#DDD7CD]">E-mail do Administrador</Label>
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
                      setEmailRecuperacao(email);
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
                disabled={carregando}
                className="w-full h-10 rounded-xl bg-gold text-charcoal hover:bg-gold-hover font-semibold text-xs transition shadow-md"
              >
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando acesso...
                  </>
                ) : (
                  "Entrar no Painel"
                )}
              </Button>
            </form>
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
                    Verifique sua caixa de entrada e spam. O link para redefinição de senha
                    foi enviado para o e-mail informado.
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
                    Voltar ao login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRecuperarSenha} className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-gold">
                    <KeyRound className="h-4 w-4" />
                    <span>Recuperação de Acesso</span>
                  </div>
                  <p className="text-xs text-[#A29C92]">
                    Digite seu e-mail cadastrado. Enviaremos um link seguro para você definir
                    uma nova senha.
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
                        "Enviar Link de Recuperação"
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
                      Cancelar e voltar ao login
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Rodapé do Card: Sem cadastro público */}
          <div className="mt-8 border-t border-[#2B2B30] pt-4 text-center">
            <p className="text-[11px] text-[#7A756D]">
              Acesso seguro com criptografia de ponta a ponta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
