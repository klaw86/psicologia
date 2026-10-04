import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo | Dra. Helena Duarte" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminIndexWrapper,
});

function AdminIndexWrapper() {
  return (
    <AdminAuthGuard>
      <AdminIndex />
    </AdminAuthGuard>
  );
}

function AdminIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/admin/ajustes" });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141416] text-[#E8E4DC]">
      <p className="animate-pulse font-display text-base text-gold">
        Redirecionando para o painel de ajustes...
      </p>
    </div>
  );
}
