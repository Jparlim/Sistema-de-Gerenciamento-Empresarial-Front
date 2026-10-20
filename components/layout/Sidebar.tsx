"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import homeIcon from "@/public/Home.png";
import clipboardIcon from "@/public/Clipboard.png";
import toolIcon from "@/public/Tool.png";
import usersIcon from "@/public/Users.png";
import barIcon from "@/public/Bar.png";
import calendarIcon from "@/public/Calendar.png";
import Image from "next/image";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

type MenuItem = {
  label: string;
  icon: { src: string };
  href?: string;
};

const menuItems: MenuItem[] = [
  { label: "Tela inicial", icon: homeIcon, href: "/home" },
  { label: "Estoque", icon: clipboardIcon, href: "/estoque" },
  { label: "Configuração IA", icon: toolIcon, href: "/configuracao-ia" },
  { label: "Clientes", icon: usersIcon, href: "/clientes" },
  { label: "Financeiro", icon: barIcon, href: "/financeiro" },
  { label: "Agenda", icon: calendarIcon },
];

type SidebarProps = {
  open: boolean;
  mobileOpen: boolean;
  transitionsEnabled: boolean;
  onToggle: () => void;
};

export default function Sidebar({
  open,
  mobileOpen,
  transitionsEnabled,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await apiFetch<{ success: true }>("/logout", { method: "POST" });
      localStorage.removeItem("sidebarOpen");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível encerrar a sessão. Tente novamente.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-dvh -translate-x-full flex-none flex-col border-r border-[#e9eaf2] bg-white py-5 shadow-xl lg:sticky lg:top-0 lg:z-20 lg:translate-x-0 lg:shadow-sm ${
        transitionsEnabled
          ? "transition-[width,transform] duration-200"
          : "transition-none"
      } ${
        open
          ? "w-72 max-w-[80vw] px-4 lg:w-64 lg:max-w-none"
          : "w-72 max-w-[80vw] px-4 lg:w-20 lg:max-w-none lg:px-2 lg:items-center"
      } ${mobileOpen ? "max-lg:translate-x-0" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Recolher menu" : "Expandir menu"}
        className={`mb-8 h-11 rounded-xl! bg-transparent! p-2 text-gray-800! shadow-none! hover:bg-gray-50! ${
          open
            ? "h-11 w-full justify-start!"
            : "h-11 w-full justify-center! lg:w-12"
        }`}
        style={{ background: "transparent", backgroundImage: "none" }}
      >
        <span className="flex flex-col gap-0.75 w-5 shrink-0">
          <span className="h-0.5 bg-gray-800 rounded" />
          <span className="h-0.5 bg-gray-800 rounded" />
          <span className="h-0.5 bg-gray-800 rounded" />
        </span>
        {open && (
          <p className="bg-[linear-gradient(110deg,#2d7cff,#5141d9,#7a1eff)] bg-clip-text ml-7 text-3xl font-bold tracking-tight text-transparent">
            Quantyum
          </p>
        )}
      </button>

      <nav className="flex w-full flex-col gap-1.5">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          const rowClasses = `flex items-center gap-3 rounded-xl py-3 transition-colors ${
            open ? "px-3" : "justify-center"
          } ${
            item.href
              ? active
                ? "relative bg-[#f1eeff] font-semibold text-[#5141d9] before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-linear-to-b before:from-[#2d7cff] before:to-[#7a1eff]"
                : "text-gray-500 hover:bg-[#f7f6fc] hover:text-gray-900"
              : "cursor-default text-gray-400"
          }`;

          const inner = (
            <>
              <Image
                src={item.icon.src}
                alt=""
                width={20}
                height={20}
                className={item.href ? "" : "opacity-50"}
              />
              {open && <p className="min-w-0 flex-1 text-sm">{item.label}</p>}
              {open && !item.href && (
                <p className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-normal text-gray-400">
                  em breve
                </p>
              )}
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={rowClasses}
                onClick={() => {
                  if (window.matchMedia("(max-width: 1023px)").matches) {
                    onToggle();
                  }
                }}
              >
                {inner}
              </Link>
            );
          }

          return (
            <div key={item.label} className={rowClasses} title="Em breve">
              {inner}
            </div>
          );
        })}
      </nav>
      <div className="mt-auto w-full pt-4">
        {logoutError && (
          <p role="alert" className="mb-2 text-center text-xs text-red-600">
            {logoutError}
          </p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sair da conta"
          aria-label="Sair da conta"
          className={`w-full rounded-xl! border border-[#ececf4]! bg-white! px-3! py-2.5! text-sm! font-semibold! text-gray-600! shadow-none! hover:bg-[#f7f6fc]! hover:text-[#5141d9]! ${open ? "justify-start!" : "justify-center! lg:px-2!"}`}
          style={{ background: "white", backgroundImage: "none" }}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ↪
          </span>
          {open && (
            <span className="ml-6">
              {loggingOut ? "Saindo..." : "Sair da conta"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
