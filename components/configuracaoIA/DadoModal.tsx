"use client";

import { useState, FormEvent } from "react";

const TIPOS = ["Texto", "Número", "Data", "Booleano"] as const;

type DadoModalProps = {
  initialNome?: string;
  initialTipo?: string;
  onClose: () => void;
  onSave: (nome: string, tipo: string) => void;
};

export default function DadoModal({
  initialNome = "",
  initialTipo = TIPOS[0],
  onClose,
  onSave,
}: DadoModalProps) {
  const [nome, setNome] = useState(initialNome);
  const [tipo, setTipo] = useState(initialTipo);
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("O nome do dado é obrigatório!");
      return;
    }

    onSave(nome.trim(), tipo);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-sm w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">
            {initialNome ? "Editar dado" : "Adicionar dado"}
          </h1>
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
              Nome do dado
            </p>
            <input
              type="text"
              className="w-full pl-2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Tipo</p>
            <select
              className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {erro && (
            <p className="text-red-600 font-semibold text-center">{erro}</p>
          )}

          <button type="submit" className="h-14">
            Salvar dado
          </button>
        </form>
      </div>
    </div>
  );
}
