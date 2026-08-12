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
    { label: "Saldo atual", value: resumo.saldoAtual, barColor: "#C5CAFF" },
    { label: "Entrada do Mês", value: resumo.entradaMes, barColor: "#C5FFD0" },
    { label: "Saída do Mês", value: resumo.saidaMes, barColor: "#FFEBC5" },
    { label: "Lucro Líquido", value: resumo.lucroLiquido, barColor: "#F7C5FF" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-[20px] shadow-sm p-6">
          <p className="text-lg font-medium mb-2">{card.label}</p>
          <p className="text-3xl font-semibold mb-3">{formatBRL(card.value)}</p>
          <span
            className="block h-[10px] w-full rounded-full"
            style={{ background: card.barColor }}
          />
        </div>
      ))}
    </div>
  );
}
