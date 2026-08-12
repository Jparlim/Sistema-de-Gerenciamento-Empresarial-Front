import { apiFetch } from "@/lib/api";

export type ResumoFinanceiro = {
  saldoAtual: number;
  entradaMes: number;
  saidaMes: number;
  lucroLiquido: number;
};

export type PerformancePonto = {
  mes: string;
  real: number;
  previsto: number;
};

export type PrevisaoNegociacao = {
  total: number;
  clientes: { id: number; nome: string | null; valorPotencial: number | null }[];
};

export type TipoMovimentacao = "ENTRADA" | "SAIDA";

export type Movimentacao = {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoMovimentacao;
  createdAt: string;
};

export type NovaMovimentacaoPayload = {
  descricao: string;
  valor: number;
  tipo: TipoMovimentacao;
};

export async function getResumoFinanceiro() {
  return apiFetch<ResumoFinanceiro>("/financeiro/resumo");
}

export async function getPerformance(meses = 6) {
  return apiFetch<PerformancePonto[]>(`/financeiro/performance?meses=${meses}`);
}

export async function getPrevisaoNegociacao() {
  return apiFetch<PrevisaoNegociacao>("/financeiro/previsao-negociacao");
}

export async function getMovimentacoes(ano: number, mes: number) {
  return apiFetch<Movimentacao[]>(
    `/financeiro/movimentacoes?ano=${ano}&mes=${mes}`,
  );
}

export async function createMovimentacao(payload: NovaMovimentacaoPayload) {
  return apiFetch<Movimentacao>("/financeiro/movimentacao", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
