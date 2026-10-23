"use client";

import { Visit, VisitStatus } from "@/lib/visits";

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}`;
}

const STATUS_LABELS: Record<VisitStatus, string> = {
  pendente: "Pendente",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_STYLES: Record<VisitStatus, string> = {
  pendente: "bg-amber-50 text-amber-600",
  concluido: "bg-green-50 text-green-600",
  cancelado: "bg-red-50 text-red-600",
};

type VisitsTableProps = {
  visits: Visit[];
  onDelete: (visit: Visit) => void;
  deletingId: number | null;
};

export default function VisitsTable({
  visits,
  onDelete,
  deletingId,
}: VisitsTableProps) {
  if (visits.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full flex items-center justify-center text-gray-400 text-sm min-h-[200px]">
        Nenhuma visita agendada.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-[#ececf4] bg-white p-4 shadow-[0_8px_30px_rgba(31,28,78,0.04)] sm:p-6">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-100">
            <th className="font-medium pb-3 pr-4">Nome</th>
            <th className="font-medium pb-3 pr-4">Data</th>
            <th className="font-medium pb-3 pr-4">Horário</th>
            <th className="font-medium pb-3 pr-4">Status</th>
            <th className="font-medium pb-3 text-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr
              key={visit.id}
              className="border-b border-gray-50 last:border-0"
            >
              <td className="py-3 pr-4 text-gray-800">{visit.nome}</td>
              <td className="py-3 pr-4 text-gray-600">
                {formatDate(visit.data)}
              </td>
              <td className="py-3 pr-4 text-gray-600">{visit.hora}</td>
              <td className="py-3 pr-4">
                <p
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[visit.status]}`}
                >
                  {STATUS_LABELS[visit.status]}
                </p>
              </td>
              <td className="py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(visit)}
                  disabled={deletingId === visit.id}
                  aria-label={`Excluir visita de ${visit.nome}`}
                  className="bg-none! bg-transparent! shadow-none text-gray-400! hover:text-red-500! px-2 disabled:opacity-40"
                >
                  {deletingId === visit.id ? "..." : "🗑"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
