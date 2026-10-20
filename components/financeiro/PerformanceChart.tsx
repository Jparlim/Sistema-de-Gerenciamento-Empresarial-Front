"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PerformancePonto } from "@/lib/financeiro";
import { formatBRL } from "@/lib/format";

type PerformanceChartProps = {
  data: PerformancePonto[];
  periodo: string;
  onPeriodoChange: (periodo: string) => void;
};

export default function PerformanceChart({
  data,
  periodo,
  onPeriodoChange,
}: PerformanceChartProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#ececf4] bg-white p-4 shadow-[0_8px_30px_rgba(31,28,78,0.04)] sm:p-6">
      <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-semibold sm:text-2xl">Gráfico de Performance</h2>
        <select
          className="w-full py-2 pl-3 text-sm sm:w-auto"
          value={periodo}
          onChange={(e) => onPeriodoChange(e.target.value)}
        >
          <option value="6">Atual</option>
          <option value="12">Últimos 12 meses</option>
        </select>
      </div>

      <div className="h-56 min-w-0 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20 }}>
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatBRL(Number(value))} />
            <Line
              type="monotone"
              dataKey="real"
              stroke="#5141D9"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="previsto"
              stroke="#28a887"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded-full bg-[#5141d9]" />
          <p className="text-sm text-gray-600">Faturamento real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded-full bg-[#28a887]" />
          <p className="text-sm text-gray-600">Faturamento Previsto</p>
        </div>
      </div>
    </div>
  );
}
