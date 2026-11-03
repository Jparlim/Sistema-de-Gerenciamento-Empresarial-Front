"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAdmin } from "./AdminSession";
import { adminErrorMessage } from "./AdminUI";
import homeIcon from "@/public/Home.png";
import companiesIcon from "@/public/Clipboard.png";
import usersIcon from "@/public/Users.png";
import invitesIcon from "@/public/Calendar.png";
import historyIcon from "@/public/Bar.png";

const menu = [
  { label: "Visão Geral", href: "/admin", icon: homeIcon },
  { label: "Empresas", href: "/admin/empresas", icon: companiesIcon },
  { label: "Administradores", href: "/admin/administradores", icon: usersIcon },
  { label: "Convites", href: "/admin/convites", icon: invitesIcon },
  { label: "Histórico de Atividades", href: "/admin/historico", icon: historyIcon },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const { admin } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError(null);
    try {
      await apiFetch("/logout", { method: "POST" });
      router.replace("/login/admin");
      router.refresh();
    } catch (cause) { setError(adminErrorMessage(cause, "Não foi possível sair. Tente novamente.")); setLoggingOut(false); }
  }

  return <div className="min-h-dvh w-full bg-[#f7f8fc] lg:flex lg:items-start">
    <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-xl focus:bg-white focus:p-4 focus:text-[#5141d9]">Ir para o conteúdo</a>
    {open && <button type="button" aria-label="Fechar menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 rounded-none! lg:hidden!" style={{ background: "rgb(32 35 56 / 25%)", transform: "none", boxShadow: "none" }} />}
    <aside aria-label="Menu administrativo" className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] shrink-0 flex-col overflow-y-auto border-r border-[#e9eaf2] bg-white px-4 py-5 shadow-xl transition-[width,transform] lg:visible lg:sticky lg:top-0 lg:z-20 lg:max-w-none lg:translate-x-0 lg:shadow-sm ${open ? "visible translate-x-0" : "invisible -translate-x-full"} ${collapsed ? "lg:w-20 lg:px-2" : "lg:w-64"}`}>
      <button type="button" className="admin-secondary mb-2 w-full justify-start! border-0! px-3!" aria-label={collapsed ? "Expandir menu" : "Recolher menu"} onClick={() => { if (window.matchMedia("(max-width: 1023px)").matches) setOpen(false); else setCollapsed((value) => !value); }}>
        <span aria-hidden="true" className="text-xl">☰</span><span className={`ml-5 bg-[linear-gradient(110deg,#2d7cff,#5141d9,#7a1eff)] bg-clip-text text-3xl font-bold tracking-tight text-transparent ${collapsed ? "lg:hidden" : ""}`}>Quantyum</span>
      </button>
      <p className={`mb-7 px-3 text-xs font-medium tracking-widest text-[#73758a] ${collapsed ? "lg:hidden" : ""}`}>ADMINISTRAÇÃO</p>
      <nav className="flex flex-col gap-1.5">{menu.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} title={item.label} onClick={() => setOpen(false)} className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${collapsed ? "lg:justify-center" : ""} ${pathname === item.href ? "bg-[#f1eeff] font-semibold text-[#5141d9] before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-linear-to-b before:from-[#2d7cff] before:to-[#7a1eff]" : "text-gray-500 hover:bg-[#f7f6fc] hover:text-gray-900"}`}><Image src={item.icon} alt="" width={20} height={20} className="shrink-0" /><span className={collapsed ? "lg:hidden" : ""}>{item.label}</span></Link>)}</nav>
      <div className="mt-auto pt-6"><div className={`mb-4 rounded-xl bg-[#f7f6fc] p-3 ${collapsed ? "lg:hidden" : ""}`}><p className="mb-1 truncate text-sm font-semibold" title={admin.name}>{admin.name}</p><p className="mb-2 truncate text-xs text-gray-500" title={admin.email}>{admin.email}</p><span className="rounded-full bg-[#e9e3ff] px-2 py-1 text-[10px] font-bold text-[#5141d9]">{admin.role}</span></div>{error && <p role="alert" className="mb-3 text-xs text-red-600">{error}</p>}<button type="button" className="admin-secondary w-full" title="Sair da conta" onClick={logout} disabled={loggingOut}><span aria-hidden="true">↪</span><span className={`ml-3 ${collapsed ? "lg:hidden" : ""}`}>{loggingOut ? "Saindo..." : "Sair da conta"}</span></button></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e9eaf2] bg-white/90 px-4 backdrop-blur lg:hidden"><button type="button" className="admin-link h-10 w-10 p-0!" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><span className="font-bold text-[#5141d9]">Quantyum · Admin</span></header><main id="admin-content" className="min-w-0 p-4 sm:p-6 lg:p-8"><div className="mx-auto w-full max-w-[1600px]">{children}</div></main></div>
  </div>;
}
