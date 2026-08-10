"use client";

import Link from "next/link";
import homeIcon from "@/public/Home.png";
import clipboardIcon from "@/public/Clipboard.png";
import toolIcon from "@/public/Tool.png";
import usersIcon from "@/public/Users.png";
import barIcon from "@/public/Bar.png";
import calendarIcon from "@/public/Calendar.png";

type MenuItem = {
  label: string;
  icon: { src: string };
  href?: string;
};

const menuItems: MenuItem[] = [
  { label: "Tela inicial", icon: homeIcon, href: "/home" },
  { label: "Estoque", icon: clipboardIcon },
  { label: "Configuração IA", icon: toolIcon },
  { label: "Clientes", icon: usersIcon },
  { label: "Financeiro", icon: barIcon },
  { label: "Agenda", icon: calendarIcon },
];

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
};

export default function Sidebar({ open, onToggle }: SidebarProps) {
  return (
    <aside
      className={`shrink-0 bg-white border-r border-gray-100 shadow-sm flex flex-col py-6 transition-all duration-200 ${
        open ? "w-64 px-4" : "w-20 px-2 items-center"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Recolher menu" : "Expandir menu"}
        className={`bg-none! bg-transparent! shadow-none gap-3 text-gray-800! mb-8 p-2 rounded-lg! hover:bg-none! hover:bg-gray-50! ${
          open ? "w-full justify-start!" : "justify-center!"
        }`}
      >
        <span className="flex flex-col gap-[3px] w-5 shrink-0">
          <span className="h-[2px] bg-gray-800 rounded" />
          <span className="h-[2px] bg-gray-800 rounded" />
          <span className="h-[2px] bg-gray-800 rounded" />
        </span>
        {open && <p className="font-semibold text-base">Dashboard</p>}
      </button>

      <nav className="flex flex-col gap-1 w-full">
        {menuItems.map((item) => {
          const rowClasses = `flex items-center gap-3 rounded-lg py-2.5 transition-colors ${
            open ? "px-3" : "justify-center"
          } ${
            item.href
              ? "text-blu bg-blue-50 font-semibold"
              : "text-gray-400 cursor-default"
          }`;

          const inner = (
            <>
              <img
                src={item.icon.src}
                alt=""
                width={22}
                height={22}
                className={item.href ? "" : "opacity-50"}
              />
              {open && <p className="text-sm">{item.label}</p>}
              {open && !item.href && (
                <p className="ml-auto text-[10px] font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  em breve
                </p>
              )}
            </>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href} className={rowClasses}>
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
    </aside>
  );
}
