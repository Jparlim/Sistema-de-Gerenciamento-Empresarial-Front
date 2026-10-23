"use client";

import { PrevisaoNegociacao as PrevisaoNegociacaoType } from "@/lib/financeiro";
import { formatBRL } from "@/lib/format";

export default function PrevisaoNegociacao({
  previsao,
}: {
  previsao: PrevisaoNegociacaoType;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#ececf4] bg-white p-4 shadow-[0_8px_30px_rgba(31,28,78,0.04)] sm:p-6">
      <h2 className="mb-1 text-lg font-semibold sm:text-xl">
        Previsão de Faturamento (em negociação)
      </h2>
      <p className="mb-3 break-words text-2xl font-bold tracking-tight sm:text-3xl">{formatBRL(previsao.total)}</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-2 flex-1 rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-gradient-to-r from-[#2d7cff] via-[#5141d9] to-[#7a1eff]" style={{ width: "100%" }} />
        </div>
        <p className="text-sm text-gray-500 shrink-0">100%</p>
      </div>

      {previsao.clientes.length === 0 ? (
        <p className="text-sm text-gray-400">
          Nenhum cliente em negociação no momento.
        </p>
      ) : (
        <div className="flex flex-col">
          {previsao.clientes.map((cliente) => (
            <div
              key={cliente.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <p className="min-w-0 break-words text-sm text-gray-700">
                {cliente.nome ?? "Sem nome"}
              </p>
              <p className="shrink-0 text-sm font-medium text-gray-800">
                {formatBRL(cliente.valorPotencial ?? 0)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
