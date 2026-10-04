import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isDemo: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRoles = useCallback(async (userId: string, userEmail?: string | null) => {
    const isOfficialAdminEmail = userEmail?.toLowerCase() === "klaw.com@gmail.com";

    try {
      // Se for o administrador oficial, garante o papel no banco
      if (isOfficialAdminEmail) {
        try {
          await (supabase.rpc as any)("claim_admin_role");
        } catch {
          // Ignora se RPC ainda não estiver criada
        }
        try {
          await supabase.from("user_roles").upsert(
            { user_id: userId, role: "admin" },
            { onConflict: "user_id,role" }
          );
        } catch {
          // Ignora se bloqueado por RLS
        }
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (!error && data) {
        const roles = data.map((r: { role: string }) => r.role);
        setIsAdmin(isOfficialAdminEmail || roles.includes("admin"));
        setIsDemo(roles.includes("demo"));
      } else {
        setIsAdmin(isOfficialAdminEmail);
        setIsDemo(false);
      }
    } catch {
      setIsAdmin(isOfficialAdminEmail);
      setIsDemo(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await checkRoles(currentUser.id, currentUser.email);
        } else {
          setIsAdmin(false);
          setIsDemo(false);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsDemo(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await checkRoles(currentUser.id, currentUser.email);
        } else {
          setIsAdmin(false);
          setIsDemo(false);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkRoles]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsDemo(false);
    } catch (err) {
      console.error("Erro ao encerrar sessão:", err);
    }
  }, []);

  return {
    user,
    session,
    isAdmin,
    isDemo,
    loading,
    signOut,
  };
}
