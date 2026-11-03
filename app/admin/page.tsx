"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminApi } from "@/lib/admin";
import { EmptyState, LoadingState, Notice, PageHeader, StatusBadge, formatAdminDate, useAdminQuery } from "@/components/admin/AdminUI";

function monthLabel(value: string) {
  const parsed = /^\d{4}-\d{2}$/.test(value) ? new Date(`${value}-01T12:00:00Z`) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit", timeZone: "America/Sao_Paulo" }).format(parsed);
}

export default function AdminDashboard() {
  const load = useCallback((signal: AbortSignal) => adminApi.dashboard(signal), []);
  const { data, error, loading, reload } = useAdminQuery(load);
  const cards = data ? [
    { label: "Empresas cadastradas", value: data.totalCompanies, color: "text-[#5141d9]", hint: "Total de empresas" },
    { label: "Empresas ativas", value: data.activeCompanies, color: "text-emerald-600", hint: "Acesso habilitado" },
    { label: "Empresas desativadas", value: data.inactiveCompanies, color: "text-red-600", hint: "Acesso desabilitado" },
    { label: "Novos cadastros no mês", value: data.newCompaniesThisMonth, color: "text-[#7048e8]", hint: "Mês atual" },
  ] : [];

  return <>
    <PageHeader title="Visão Geral" description="Acompanhe os cadastros e a situação das empresas na plataforma."><button type="button" className="admin-secondary" onClick={reload} disabled={loading}>Atualizar dados</button></PageHeader>
    {error && <Notice kind="error">{error} <button type="button" className="admin-link ml-2" onClick={reload}>Tentar novamente</button></Notice>}
    {loading ? <div className="admin-panel"><LoadingState label="Carregando visão geral..." /></div> : data && <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <section key={card.label} className="admin-panel"><h2 className="mb-4 text-sm font-medium text-gray-500">{card.label}</h2><p className={`mb-2 text-4xl font-bold tracking-tight ${card.color}`}>{card.value.toLocaleString("pt-BR")}</p><p className="mb-0 text-xs text-gray-400">{card.hint}</p></section>)}</div>
      {data.pendingCompanies != null && data.pendingCompanies > 0 && <Notice kind="info"><strong>{data.pendingCompanies.toLocaleString("pt-BR")}</strong> {data.pendingCompanies === 1 ? "cadastro aguardando confirmação." : "cadastros aguardando confirmação."}</Notice>}
      <section className="admin-panel mb-6"><div className="mb-6"><h2 className="mb-1 text-xl font-semibold">Crescimento de empresas</h2><p className="mb-0 text-sm text-gray-500">Novos cadastros por mês</p></div>{data.growth.length ? <><div className="h-72 min-w-0 w-full" role="img" aria-label="Gráfico de novos cadastros por mês. Os valores também estão disponíveis na tabela acessível."><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.growth} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} accessibilityLayer><defs><linearGradient id="admin-company-growth" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7048e8" stopOpacity={0.22} /><stop offset="100%" stopColor="#7048e8" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="#efedf8" vertical={false} /><XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fill: "#73758a", fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={25} /><YAxis allowDecimals={false} tick={{ fill: "#73758a", fontSize: 12 }} axisLine={false} tickLine={false} width={45} /><Tooltip labelFormatter={(value) => monthLabel(String(value))} formatter={(value) => [Number(value).toLocaleString("pt-BR"), "Novos cadastros"]} contentStyle={{ borderRadius: 12, border: "1px solid #e9eaf2" }} /><Area type="monotone" dataKey="count" name="Novos cadastros" stroke="#7048e8" strokeWidth={3} fill="url(#admin-company-growth)" isAnimationActive={false} /></AreaChart></ResponsiveContainer></div><table className="sr-only"><caption>Novos cadastros de empresas por mês</caption><thead><tr><th>Mês</th><th>Quantidade</th></tr></thead><tbody>{data.growth.map((point) => <tr key={point.month}><td>{monthLabel(point.month)}</td><td>{point.count}</td></tr>)}</tbody></table></> : <EmptyState>Ainda não há dados de crescimento para exibir.</EmptyState>}</section>
      <section className="admin-panel"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="mb-0 text-xl font-semibold">Empresas cadastradas recentemente</h2><Link href="/admin/empresas" className="text-sm font-semibold text-[#5141d9]">Ver todas as empresas →</Link></div>{data.recentCompanies.length ? <div className="overflow-x-auto"><table className="admin-table min-w-[650px]"><caption className="sr-only">Empresas cadastradas recentemente</caption><thead><tr><th>Empresa</th><th>E-mail</th><th>Status</th><th>Cadastro</th></tr></thead><tbody>{data.recentCompanies.map((company) => <tr key={company.id}><td className="font-medium">{company.name}</td><td className="text-gray-500">{company.email}</td><td><StatusBadge status={company.status} /></td><td className="whitespace-nowrap text-gray-500">{formatAdminDate(company.createdAt)}</td></tr>)}</tbody></table></div> : <EmptyState>Nenhuma empresa cadastrada ainda.</EmptyState>}</section>
    </>}
  </>;
}
