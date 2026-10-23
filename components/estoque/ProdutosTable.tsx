"use client";

import { useState } from "react";
import { Produto } from "@/lib/estoque";
import { formatBRL } from "@/lib/format";
import RowActionsMenu from "@/components/clientes/RowActionsMenu";

type ProdutosTableProps = {
  produtos: Produto[];
  fornecedorNome: (id: number) => string;
  onEdit: (produto: Produto) => void;
  onDelete: (produto: Produto) => void;
};

export default function ProdutosTable({
  produtos,
  fornecedorNome,
  onEdit,
  onDelete,
}: ProdutosTableProps) {
  const [busca, setBusca] = useState("");

  const termo = busca.trim().toLowerCase();
  const filtrados = produtos.filter(
    (p) =>
      !termo ||
      p.nome.toLowerCase().includes(termo) ||
      p.categoria.toLowerCase().includes(termo),
  );

  return (
    <div className="min-w-0 rounded-2xl border border-[#ececf4] bg-white p-4 shadow-[0_8px_30px_rgba(31,28,78,0.04)] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar produto..."
          className="w-full pl-3 sm:w-64"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3 pr-4">Produto</th>
              <th className="font-medium pb-3 pr-4">Categoria</th>
              <th className="font-medium pb-3 pr-4">Valor Unitário</th>
              <th className="font-medium pb-3 pr-4">Quantidade</th>
              <th className="font-medium pb-3 pr-4">Fornecedor</th>
              <th className="font-medium pb-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((produto) => (
              <tr
                key={produto.id}
                className="border-b border-gray-50 last:border-0"
              >
                <td className="py-3 pr-4 text-gray-800">{produto.nome}</td>
                <td className="py-3 pr-4 text-gray-600">{produto.categoria}</td>
                <td className="py-3 pr-4 text-gray-600">
                  {formatBRL(produto.valor_unitario)}
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {produto.quantidade}
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {fornecedorNome(produto.fornecedorId)}
                </td>
                <td className="py-3 text-right">
                  <RowActionsMenu
                    onEdit={() => onEdit(produto)}
                    onDelete={() => onDelete(produto)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
