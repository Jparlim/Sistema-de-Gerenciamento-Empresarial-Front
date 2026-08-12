"use client";

import { PrevisaoNegociacao as PrevisaoNegociacaoType } from "@/lib/financeiro";
import { formatBRL } from "@/lib/format";

export default function PrevisaoNegociacao({
  previsao,
}: {
  previsao: PrevisaoNegociacaoType;
}) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm p-6">
      <h2 className="text-lg font-medium mb-1">
        Previsão de Faturamento (em negociação)
      </h2>
      <p className="text-3xl font-semibold mb-3">{formatBRL(previsao.total)}</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-2 flex-1 rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-blu" style={{ width: "100%" }} />
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
              <p className="text-sm text-gray-700">
                {cliente.nome ?? "Sem nome"}
              </p>
              <p className="text-sm font-medium text-gray-800">
                {formatBRL(cliente.valorPotencial ?? 0)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
