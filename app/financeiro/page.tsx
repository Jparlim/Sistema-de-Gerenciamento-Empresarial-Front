"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import ResumoCards from "@/components/financeiro/ResumoCards";
import PerformanceChart from "@/components/financeiro/PerformanceChart";
import VendasPerdidasChart from "@/components/financeiro/VendasPerdidasChart";
import PrevisaoNegociacao from "@/components/financeiro/PrevisaoNegociacao";
import MovimentacoesTable from "@/components/financeiro/MovimentacoesTable";
import {
  getResumoFinanceiro,
  getPerformance,
  getPrevisaoNegociacao,
  getMovimentacoes,
  createMovimentacao,
  ResumoFinanceiro,
  PerformancePonto,
  PrevisaoNegociacao as PrevisaoNegociacaoType,
  Movimentacao,
  TipoMovimentacao,
} from "@/lib/financeiro";
import { listClientes } from "@/lib/clientes";
import { Cliente } from "@/lib/clientes";
import { ApiError } from "@/lib/api";

export default function Financeiro() {
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [performance, setPerformance] = useState<PerformancePonto[]>([]);
  const [previsao, setPrevisao] = useState<PrevisaoNegociacaoType | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [periodo, setPeriodo] = useState("6");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const fetchDados = useCallback(async (meses: number) => {
    setLoading(true);
    setErro(null);
    try {
      const now = new Date();
      const [
        resumoData,
        performanceData,
        previsaoData,
        movimentacoesData,
        clientesData,
      ] = await Promise.all([
        getResumoFinanceiro(),
        getPerformance(meses),
        getPrevisaoNegociacao(),
        getMovimentacoes(now.getFullYear(), now.getMonth() + 1),
        listClientes(),
      ]);
      setResumo(resumoData);
      setPerformance(performanceData);
      setPrevisao(previsaoData);
      setMovimentacoes(movimentacoesData);
      setClientes(clientesData);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os dados financeiros.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDados(Number(periodo));
  }, [fetchDados, periodo]);

  async function handleCreateMovimentacao(
    descricao: string,
    valor: number,
    tipo: TipoMovimentacao,
  ) {
    try {
      await createMovimentacao({ descricao, valor, tipo });
      await fetchDados(Number(periodo));
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar a movimentação.",
      );
      throw err;
    }
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-semibold sm:mb-8 sm:text-4xl">Resumo Financeiro</h1>

      {erro && <p className="text-red-600 font-semibold mb-4">{erro}</p>}

      {loading || !resumo || !previsao ? (
        <p className="text-gray-400 text-sm">Carregando dados financeiros...</p>
      ) : (
        <div className="flex flex-col gap-6">
          <ResumoCards resumo={resumo} />

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
            <div className="flex flex-col gap-6">
              <PerformanceChart
                data={performance}
                periodo={periodo}
                onPeriodoChange={setPeriodo}
              />
              <VendasPerdidasChart clientes={clientes} />
            </div>

            <div className="flex flex-col gap-6">
              <PrevisaoNegociacao previsao={previsao} />
              <MovimentacoesTable
                movimentacoes={movimentacoes}
                onCreate={handleCreateMovimentacao}
              />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
