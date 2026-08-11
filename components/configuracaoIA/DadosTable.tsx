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
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">
          Nenhum dado cadastrado ainda.
        </p>
      ) : (
        <table className="w-full text-sm">
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
      )}

      <button
        type="button"
        onClick={onAdd}
        className="bg-none! bg-transparent! shadow-none text-gray-700! hover:text-blu! px-0! mt-4 justify-start!"
      >
        + Adicionar dado
      </button>
    </div>
  );
}
