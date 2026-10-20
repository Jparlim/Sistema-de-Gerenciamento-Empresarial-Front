"use client";

import { FormEvent, useState } from "react";
import { TipoMovimentacao } from "@/lib/financeiro";

type NovaMovimentacaoModalProps = {
  onClose: () => void;
  onSave: (descricao: string, valor: number, tipo: TipoMovimentacao) => void;
  saving: boolean;
};

export default function NovaMovimentacaoModal({
  onClose,
  onSave,
  saving,
}: NovaMovimentacaoModalProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(0);
  const [tipo, setTipo] = useState<TipoMovimentacao>("ENTRADA");
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!descricao.trim() || valor <= 0) {
      setErro("Descrição e valor (maior que 0) são obrigatórios!");
      return;
    }

    onSave(descricao.trim(), valor, tipo);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white bg-white p-4 shadow-[0_24px_80px_rgba(25,22,65,0.2)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Nova movimentação</h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="bg-none! bg-transparent! shadow-none text-gray-400! hover:text-gray-700! px-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Descrição
            </p>
            <input
              type="text"
              className="w-full pl-2"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Valor (R$)
            </p>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full pl-2"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Tipo</p>
            <select
              className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoMovimentacao)}
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>

          {erro && (
            <p className="text-red-600 font-semibold text-center">{erro}</p>
          )}

          <button type="submit" disabled={saving} className="h-14">
            {saving ? "Salvando..." : "Salvar movimentação"}
          </button>
        </form>
      </div>
    </div>
  );
}
