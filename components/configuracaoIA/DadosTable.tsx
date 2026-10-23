"use client";

type DadosTableProps = {
  dados: Record<string, string>;
  onAdd: () => void;
  onEdit: (nome: string) => void;
  onDelete: (nome: string) => void;
};

export default function DadosTable({
  dados,
  onAdd,
  onEdit,
  onDelete,
}: DadosTableProps) {
  const entries = Object.entries(dados);

  return (
    <div className="w-full min-w-0 rounded-2xl border border-[#ececf4] bg-white p-4 shadow-[0_8px_30px_rgba(31,28,78,0.04)] sm:p-6">
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">
          Nenhum dado cadastrado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3 pr-4">Nome do dado</th>
              <th className="font-medium pb-3 pr-4">Tipo</th>
              <th className="font-medium pb-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([nome, tipo]) => (
              <tr key={nome} className="border-b border-gray-50 last:border-0">
                <td className="py-3 pr-4 text-gray-800">{nome}</td>
                <td className="py-3 pr-4 text-gray-600">{tipo}</td>
                <td className="py-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(nome)}
                      aria-label={`Editar ${nome}`}
                      className="bg-none! bg-transparent! shadow-none text-gray-400! hover:text-blu! px-2"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(nome)}
                      aria-label={`Excluir ${nome}`}
                      className="bg-none! bg-transparent! shadow-none text-gray-400! hover:text-red-500! px-2"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex min-h-11! w-full items-center justify-center gap-2 rounded-xl! bg-[linear-gradient(110deg,#2d7cff_0%,#5141d9_56%,#7a1eff_100%)] px-4! py-2.5! text-sm! font-semibold! text-white! shadow-[0_8px_20px_rgba(81,65,217,0.16)] transition hover:brightness-105 sm:w-auto"
      >
        <span aria-hidden="true" className="text-lg leading-none">+</span>
        Adicionar dado
      </button>
    </div>
  );
}
