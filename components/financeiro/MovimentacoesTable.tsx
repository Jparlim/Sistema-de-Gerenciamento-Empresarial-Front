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
    <div className="bg-white rounded-[20px] shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-medium">Movimentações do Mês</h2>
        <button
          type="button"
          onClick={() => setCriando(true)}
          className="px-4 h-10 text-sm"
        >
          + Nova movimentação
        </button>
      </div>

      {movimentacoes.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">
          Nenhuma movimentação neste mês.
        </p>
      ) : (
        <table className="w-full text-sm">
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
