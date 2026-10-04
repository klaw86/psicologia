import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/admin/ajustes" });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal text-ivory">
      <p className="animate-pulse font-display text-lg text-gold">Redirecionando para o painel de ajustes...</p>
    </div>
  );
}
