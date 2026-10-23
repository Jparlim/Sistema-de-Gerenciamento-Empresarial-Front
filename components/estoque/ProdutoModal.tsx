"use client";

import { FormEvent, useState } from "react";
import { Produto } from "@/lib/estoque";
import { Fornecedor, createFornecedor } from "@/lib/fornecedores";
import { ApiError } from "@/lib/api";
import NovoFornecedorModal from "./NovoFornecedorModal";

export type ProdutoFormData = {
  nome: string;
  categoria: string;
  quantidade: number;
  valor_unitario: number;
  fornecedorId: number;
};

type ProdutoModalProps = {
  produto: Produto | null;
  fornecedores: Fornecedor[];
  onClose: () => void;
  onSave: (data: ProdutoFormData) => void;
  onFornecedorCreated: (fornecedor: Fornecedor) => void;
  saving: boolean;
};

export default function ProdutoModal({
  produto,
  fornecedores,
  onClose,
  onSave,
  onFornecedorCreated,
  saving,
}: ProdutoModalProps) {
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [categoria, setCategoria] = useState(produto?.categoria ?? "");
  const [quantidade, setQuantidade] = useState(produto?.quantidade ?? 0);
  const [valorUnitario, setValorUnitario] = useState(
    produto?.valor_unitario ?? 0,
  );
  const [fornecedorId, setFornecedorId] = useState<number | "">(
    produto?.fornecedorId ?? fornecedores[0]?.id ?? "",
  );
  const [erro, setErro] = useState<string | null>(null);
  const [criandoFornecedor, setCriandoFornecedor] = useState(false);
  const [savingFornecedor, setSavingFornecedor] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!nome.trim() || !categoria.trim() || !fornecedorId) {
      setErro("Produto, categoria e fornecedor são obrigatórios!");
      return;
    }

    onSave({
      nome: nome.trim(),
      categoria: categoria.trim(),
      quantidade,
      valor_unitario: valorUnitario,
      fornecedorId: Number(fornecedorId),
    });
  }

  async function handleCreateFornecedor(payload: {
    nome: string;
    contato: string;
    CNPJ: string;
  }) {
    setSavingFornecedor(true);
    try {
      const novo = await createFornecedor(payload);
      onFornecedorCreated(novo);
      setFornecedorId(novo.id);
      setCriandoFornecedor(false);
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Não foi possível criar o fornecedor.",
      );
    } finally {
      setSavingFornecedor(false);
    }
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
          <h1 className="text-2xl font-semibold">
            {produto ? "Editar produto" : "Adicionar produto"}
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
            <p className="text-sm font-semibold text-gray-700 mb-1">Produto</p>
            <input
              type="text"
              className="w-full pl-2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Categoria
            </p>
            <input
              type="text"
              className="w-full pl-2"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Valor Unitário
              </p>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full pl-2"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(Number(e.target.value))}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Quantidade
              </p>
              <input
                type="number"
                min={0}
                step="1"
                className="w-full pl-2"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Fornecedor
            </p>
            <select
              className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none"
              value={fornecedorId}
              onChange={(e) => setFornecedorId(Number(e.target.value))}
            >
              <option value="" disabled>
                Selecione um fornecedor
              </option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCriandoFornecedor(true)}
              className="mt-3 inline-flex min-h-10! w-full justify-center! gap-2 rounded-xl! border border-[#dcd5ff]! bg-[#f5f2ff]! px-4! py-2! text-sm! font-semibold! text-[#5141d9]! shadow-none! hover:bg-[#ece7ff]! sm:w-auto sm:justify-start!"
              style={{ background: "#f5f2ff", backgroundImage: "none" }}
            >
              <span aria-hidden="true" className="text-lg leading-none">+</span>
              Novo fornecedor
            </button>
          </div>

          {erro && (
            <p className="text-red-600 font-semibold text-center">{erro}</p>
          )}

          <button type="submit" disabled={saving} className="h-14">
            {saving ? "Salvando..." : "Salvar produto"}
          </button>
        </form>
      </div>

      {criandoFornecedor && (
        <NovoFornecedorModal
          onClose={() => setCriandoFornecedor(false)}
          onCreate={handleCreateFornecedor}
          saving={savingFornecedor}
        />
      )}
    </div>
  );
}
