"use client";

import { useState, FormEvent } from "react";
import { Cliente, ClienteStatus } from "@/lib/clientes";

const STATUS_OPTIONS: ClienteStatus[] = ["Fechado", "Desistência", "Em Negociação"];

type ClienteModalProps = {
  cliente: Cliente;
  onClose: () => void;
  onSave: (nome: string, contato: string, status: ClienteStatus, resumo: string) => void;
  saving: boolean;
};

export default function ClienteModal({
  cliente,
  onClose,
  onSave,
  saving,
}: ClienteModalProps) {
  const [nome, setNome] = useState(cliente.nome ?? "");
  const [contato, setContato] = useState(cliente.contato);
  const [status, setStatus] = useState<ClienteStatus>(cliente.status);
  const [resumo, setResumo] = useState(cliente.resumo);
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!nome.trim() || !contato.trim()) {
      setErro("Nome e contato são obrigatórios!");
      return;
    }

    onSave(nome.trim(), contato.trim(), status, resumo);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-sm w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Editar cliente</h1>
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
            <p className="text-sm font-semibold text-gray-700 mb-1">Status</p>
            <select
              className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value as ClienteStatus)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Reclamação
            </p>
            <textarea
              className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none resize-none"
              rows={4}
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
            />
          </div>

          {erro && (
            <p className="text-red-600 font-semibold text-center">{erro}</p>
          )}

          <button type="submit" disabled={saving} className="h-14">
            {saving ? "Salvando..." : "Salvar cliente"}
          </button>
        </form>
      </div>
    </div>
  );
}
