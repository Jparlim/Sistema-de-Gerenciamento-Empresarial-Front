"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Cliente } from "@/lib/clientes";

const CORES = {
  perdidas: "#0051FF",
  fechadas: "#00FFF2",
};

export default function VendasPerdidasChart({
  clientes,
}: {
  clientes: Cliente[];
}) {
  const perdidas = clientes.filter((c) => c.status === "Desistência").length;
  const fechadas = clientes.filter((c) => c.status === "Fechado").length;

  const data = [
    { name: "Vendas Perdidas", value: perdidas, color: CORES.perdidas },
    { name: "Vendas Fechadas", value: fechadas, color: CORES.fechadas },
  ];

  const semDados = perdidas === 0 && fechadas === 0;

  return (
    <div className="bg-white rounded-[20px] shadow-sm p-6">
      <h2 className="text-2xl font-medium mb-4">Análise de Vendas Perdidas</h2>

      {semDados ? (
        <p className="text-sm text-gray-400 py-6">
          Nenhum dado de cliente fechado/perdido ainda.
        </p>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: CORES.perdidas }}
          />
          <p className="text-sm text-gray-600">Vendas Perdidas</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: CORES.fechadas }}
          />
          <p className="text-sm text-gray-600">Vendas Fechadas</p>
        </div>
      </div>
    </div>
  );
}
