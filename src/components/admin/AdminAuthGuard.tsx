import { type ReactNode, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert, Loader2, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminAuthGuardProps {
  children: ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para o login apenas se não estiver carregando e não houver usuário nenhum
    if (!loading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#141416] text-[#E8E4DC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="font-display text-sm tracking-wide text-[#DDD7CD]">
            Verificando credenciais de acesso...
          </p>
        </div>
      </div>
    );
  }

  // 1. Visitante sem login
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#141416] text-[#E8E4DC] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-[#333338] bg-[#1E1E22] p-8 shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-wine/20 text-wine">
            <ShieldAlert className="h-6 w-6 text-wine" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-ivory">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-xs text-[#A29C92] leading-relaxed">
            Você precisa estar autenticado para acessar o painel de administração.
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="w-full bg-gold text-charcoal hover:bg-gold-hover text-xs font-semibold"
            >
              <Link to="/login">Ir para o Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Usuário logado MAS com conta diferente de klaw.com@gmail.com
  // Interrompe o loop renderizando esta tela com botão de troca de conta
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#141416] text-[#E8E4DC] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-[#1E1E22] p-8 shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-ivory">
            Conta Não Autorizada
          </h2>
          <p className="mt-3 text-xs text-[#A29C92] leading-relaxed">
            Você está conectado com <span className="font-semibold text-ivory">{user.email}</span>, porém esta área é exclusiva para o administrador <span className="text-gold font-semibold">klaw.com@gmail.com</span>.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              onClick={async () => {
                await signOut();
                navigate({ to: "/login", replace: true });
              }}
              className="w-full bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold"
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Sair desta conta e conectar com klaw.com@gmail.com
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-xs text-[#A29C92] hover:text-ivory"
            >
              <Link to="/">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Voltar ao site público
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Usuário autenticado e autorizado como administrador
  return <>{children}</>;
}
