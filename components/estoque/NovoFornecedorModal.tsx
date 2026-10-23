"use client";

import { FormEvent, useState } from "react";
import { CreateFornecedorPayload } from "@/lib/fornecedores";

type NovoFornecedorModalProps = {
  onClose: () => void;
  onCreate: (payload: CreateFornecedorPayload) => Promise<void>;
  saving: boolean;
};

export default function NovoFornecedorModal({
  onClose,
  onCreate,
  saving,
}: NovoFornecedorModalProps) {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!nome.trim() || !contato.trim() || !cnpj.trim()) {
      setErro("Nome, contato e CNPJ são obrigatórios!");
      return;
    }

    await onCreate({
      nome: nome.trim(),
      contato: contato.trim(),
      CNPJ: cnpj.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-white bg-white p-4 shadow-[0_24px_80px_rgba(25,22,65,0.2)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Novo fornecedor</h1>
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
            <p className="text-sm font-semibold text-gray-700 mb-1">Nome</p>
            <input
              type="text"
              className="w-full pl-2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Contato</p>
            <input
              type="text"
              className="w-full pl-2"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">CNPJ</p>
            <input
              type="text"
              className="w-full pl-2"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          </div>

          {erro && (
            <p className="text-red-600 font-semibold text-center">{erro}</p>
          )}

          <button type="submit" disabled={saving} className="h-14">
            {saving ? "Salvando..." : "Salvar fornecedor"}
          </button>
        </form>
      </div>
    </div>
  );
}
