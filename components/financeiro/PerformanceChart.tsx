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
    <div className="bg-white rounded-[20px] shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-medium">Gráfico de Performance</h2>
        <select
          className="pl-2 py-2 border-2 border-gra rounded-[10px] outline-none text-sm"
          value={periodo}
          onChange={(e) => onPeriodoChange(e.target.value)}
        >
          <option value="6">Atual</option>
          <option value="12">Últimos 12 meses</option>
        </select>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20 }}>
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatBRL(Number(value))} />
            <Line
              type="monotone"
              dataKey="real"
              stroke="#0051FF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="previsto"
              stroke="#22C55E"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded-full bg-[#0051FF]" />
          <p className="text-sm text-gray-600">Faturamento real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded-full bg-[#22C55E]" />
          <p className="text-sm text-gray-600">Faturamento Previsto</p>
        </div>
      </div>
    </div>
  );
}
