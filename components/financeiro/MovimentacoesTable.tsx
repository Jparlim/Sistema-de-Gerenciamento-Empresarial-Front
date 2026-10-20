"use client";

import { useState } from "react";
import { Movimentacao, TipoMovimentacao } from "@/lib/financeiro";
import { formatBRL } from "@/lib/format";
import NovaMovimentacaoModal from "./NovaMovimentacaoModal";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

type MovimentacoesTableProps = {
  movimentacoes: Movimentacao[];
  onCreate: (
    descricao: string,
    valor: number,
    tipo: TipoMovimentacao,
  ) => Promise<void>;
};

export default function MovimentacoesTable({
  movimentacoes,
  onCreate,
}: MovimentacoesTableProps) {
  const [criando, setCriando] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(
    descricao: string,
    valor: number,
    tipo: TipoMovimentacao,
  ) {
    setSaving(true);
    try {
      await onCreate(descricao, valor, tipo);
      setCriando(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-0 rounded-2xl border border-[#ececf4] bg-white p-4 shadow-[0_8px_30px_rgba(31,28,78,0.04)] sm:p-6">
      <div className="mb-4 flex flex-col items-stretch gap-3">
        <h2 className="text-xl font-semibold sm:text-2xl">Movimentações do Mês</h2>
        <button
          type="button"
          onClick={() => setCriando(true)}
          className="h-11 w-full px-5 text-sm font-semibold"
        >
          + Nova movimentação
        </button>
      </div>

      {movimentacoes.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">
          Nenhuma movimentação neste mês.
        </p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3 pr-4">data</th>
              <th className="font-medium pb-3 pr-4">descrição</th>
              <th className="font-medium pb-3 pr-4">valor</th>
              <th className="font-medium pb-3">status</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((mov) => (
              <tr
                key={mov.id}
                className="border-b border-gray-50 last:border-0"
              >
                <td className="py-3 pr-4 text-gray-600">
                  {formatDate(mov.createdAt)}
                </td>
                <td className="py-3 pr-4 text-gray-800">{mov.descricao}</td>
                <td className="py-3 pr-4 text-gray-600">
                  {formatBRL(mov.valor)}
                </td>
                <td className="py-3">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{
                      background: mov.tipo === "ENTRADA" ? "#2CD932" : "#D92C2C",
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {criando && (
        <NovaMovimentacaoModal
          onClose={() => setCriando(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
