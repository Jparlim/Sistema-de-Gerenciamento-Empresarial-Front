"use client";

import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi, type Admin } from "@/lib/admin";
import { LoadingState, Notice, useAdminQuery } from "./AdminUI";

const AdminContext = createContext<{ admin: Admin; refreshSession: () => void } | null>(null);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("Sessão administrativa indisponível.");
  return context;
}

export default function AdminSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const loader = useCallback((signal: AbortSignal) => adminApi.me(signal), []);
  const { data, error, loading, reload } = useAdminQuery(loader);
  const allowed = data?.admin.status === "ACTIVE" && ["OWNER", "ADMIN"].includes(data.admin.role);

  useEffect(() => {
    if (data && !allowed) router.replace("/login/admin");
  }, [data, allowed, router]);

  if (loading) return <main className="min-h-dvh p-6"><LoadingState label="Verificando acesso administrativo..." /></main>;
  if (error) return <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5"><h1 className="mb-5 text-3xl font-semibold">Acesso administrativo</h1><Notice kind="error">{error}</Notice><div className="flex flex-wrap items-center gap-4"><button type="button" className="px-4" onClick={reload}>Tentar novamente</button><Link href="/login/admin" className="text-sm font-medium text-[#5141d9]">Entrar como administrador</Link></div></main>;
  if (!data || !allowed) return <LoadingState label="Redirecionando para entrar..." />;
  return <AdminContext.Provider value={{ admin: data.admin, refreshSession: reload }}>{children}</AdminContext.Provider>;
}
