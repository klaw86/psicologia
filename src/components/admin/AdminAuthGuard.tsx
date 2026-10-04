import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert, Loader2 } from "lucide-react";

interface AdminAuthGuardProps {
  children: ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        navigate({ to: "/login" });
      }
    }
  }, [user, isAdmin, loading, navigate]);

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

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#141416] text-[#E8E4DC] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-[#333338] bg-[#1E1E22] p-8 shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-wine/20 text-wine">
            <ShieldAlert className="h-6 w-6 text-wine" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-ivory">
            Acesso Restrito ao Administrador
          </h2>
          <p className="mt-2 text-xs text-[#A29C92] leading-relaxed">
            Esta área é restrita e requer autenticação com o e-mail oficial de administração.
            Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
