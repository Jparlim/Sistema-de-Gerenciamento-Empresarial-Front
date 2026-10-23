"use client";

import { ResumoFinanceiro } from "@/lib/financeiro";
import { formatBRL } from "@/lib/format";

type Card = {
  label: string;
  value: number;
  barColor: string;
};

export default function ResumoCards({ resumo }: { resumo: ResumoFinanceiro }) {
  const cards: Card[] = [
    {
      label: "Saldo atual",
      value: resumo.saldoAtual,
      barColor: "linear-gradient(90deg, #2d7cff 0%, #5141d9 56%, #7a1eff 100%)",
    },
    { label: "Entrada do Mês", value: resumo.entradaMes, barColor: "#b9ead1" },
    { label: "Saída do Mês", value: resumo.saidaMes, barColor: "#f6d49d" },
    {
      label: "Lucro Líquido",
      value: resumo.lucroLiquido,
      barColor: "linear-gradient(90deg, #2d7cff 0%, #5141d9 56%, #7a1eff 100%)",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-[#ececf4] bg-white p-4 shadow-[0_8px_30px_rgba(31,28,78,0.04)] sm:p-5">
          <p className="mb-2 text-base font-semibold text-gray-600">{card.label}</p>
          <p className="mb-3 break-words text-2xl font-bold tracking-tight sm:text-3xl">{formatBRL(card.value)}</p>
          <span
            className="block h-[10px] w-full rounded-full"
            style={{ background: card.barColor }}
          />
        </div>
      ))}
    </div>
  );
}
