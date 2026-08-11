"use client";

import { Cliente } from "@/lib/clientes";

type StatCard = {
  label: string;
  value: number;
  barClass: string;
  subtitle: string;
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function StatsGrid({ clientes }: { clientes: Cliente[] }) {
  const now = new Date();
  const hoje = clientes.filter((c) => isSameDay(new Date(c.date), now)).length;
  const semana = clientes.filter((c) => new Date(c.date) >= daysAgo(7)).length;
  const mes = clientes.filter((c) => new Date(c.date) >= daysAgo(30)).length;
  const semestre = clientes.filter(
    (c) => new Date(c.date) >= daysAgo(182),
  ).length;
  const fechados = clientes.filter((c) => c.status === "Fechado").length;
  const semNegocio = clientes.filter(
    (c) => c.status === "Desistência",
  ).length;

  const cards: StatCard[] = [
    {
      label: "Hoje",
      value: hoje,
      barClass: "bg-indigo-200",
      subtitle: "Clientes que entraram em contato",
    },
    {
      label: "Ultima semana",
      value: semana,
      barClass: "bg-green-200",
      subtitle: "Clientes que entraram em contato",
    },
    {
      label: "Ultimo mês",
      value: mes,
      barClass: "bg-rose-200",
      subtitle: "Clientes que entraram em contato",
    },
    {
      label: "Ultimo semestre",
      value: semestre,
      barClass: "bg-pink-200",
      subtitle: "Clientes que entraram em contato",
    },
    {
      label: "Negocios fechados",
      value: fechados,
      barClass: "bg-blu",
      subtitle: "Clientes que fecharam negócio",
    },
    {
      label: "Sem negócio",
      value: semNegocio,
      barClass: "bg-red-500",
      subtitle: "Clientes que não fecharam negócio",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-[20px] shadow-sm p-6"
        >
          <p className="text-2xl font-medium mb-2">{card.label}</p>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-4xl font-semibold">
              {card.value.toLocaleString("pt-BR")}
            </p>
            <span
              className={`h-[10px] flex-1 max-w-[110px] rounded-full ${card.barClass}`}
            />
          </div>
          <p className="text-sm text-gray-500">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
