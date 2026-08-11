"use client";

import { Cliente, ClienteStatus } from "@/lib/clientes";
import RowActionsMenu from "./RowActionsMenu";

const STATUS_OPTIONS: ClienteStatus[] = ["Fechado", "Desistência", "Em Negociação"];

type FiltroNegociosProps = {
  clientes: Cliente[];
  status: ClienteStatus;
  onStatusChange: (status: ClienteStatus) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
};

export default function FiltroNegocios({
  clientes,
  status,
  onStatusChange,
  onEdit,
  onDelete,
}: FiltroNegociosProps) {
  const filtrados = clientes.filter((c) => c.status === status);

  return (
    <div className="bg-white rounded-[20px] shadow-sm p-6">
      <h2 className="text-2xl font-medium mb-4">Filtro de negócios</h2>

      <select
        className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none mb-4"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ClienteStatus)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <p className="text-sm font-semibold text-gray-400 border-b border-gray-100 pb-2 mb-2">
        Nome
      </p>

      {filtrados.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">
          Nenhum cliente com esse status.
        </p>
      ) : (
        <div className="flex flex-col">
          {filtrados.map((cliente) => (
            <div
              key={cliente.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <p className="text-gray-800">{cliente.nome ?? "Sem nome"}</p>
              <RowActionsMenu
                onEdit={() => onEdit(cliente)}
                onDelete={() => onDelete(cliente)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
