"use client";

import { Fragment, useState } from "react";
import { Cliente } from "@/lib/clientes";
import RowActionsMenu from "./RowActionsMenu";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

type ClientesTableProps = {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
};

export default function ClientesTable({
  clientes,
  onEdit,
  onDelete,
}: ClientesTableProps) {
  const [busca, setBusca] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const termo = busca.trim().toLowerCase();
  const filtrados = clientes
    .filter(
      (c) =>
        !termo ||
        (c.nome ?? "").toLowerCase().includes(termo) ||
        c.contato.toLowerCase().includes(termo),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-[20px] shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-medium">Clientes mais recentes</h2>
        <input
          type="text"
          placeholder="Buscar cliente..."
          className="w-64 pl-2"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">
          Nenhum cliente encontrado.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3 pr-4">Nome</th>
              <th className="font-medium pb-3 pr-4">Contato</th>
              <th className="font-medium pb-3 pr-4">Data</th>
              <th className="font-medium pb-3 pr-4">Status</th>
              <th className="font-medium pb-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((cliente) => {
              const isExpanded = expandedId === cliente.id;
              return (
                <Fragment key={cliente.id}>
                  <tr
                    className="border-b border-gray-50 last:border-0 cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : cliente.id)
                    }
                  >
                    <td className="py-3 pr-4 text-gray-800">
                      {cliente.nome ?? "Sem nome"}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {cliente.contato}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {formatDate(cliente.date)}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {cliente.status}
                    </td>
                    <td
                      className="py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActionsMenu
                        onEdit={() => onEdit(cliente)}
                        onDelete={() => onDelete(cliente)}
                      />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-gray-50 last:border-0">
                      <td colSpan={5} className="pb-4 pt-1">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Reclamação
                        </p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {cliente.resumo || "Sem resumo registrado."}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
