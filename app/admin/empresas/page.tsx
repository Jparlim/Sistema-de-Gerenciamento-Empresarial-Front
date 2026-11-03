"use client";

import { useCallback, useState, type FormEvent } from "react";
import { adminApi, type Company, type CompanyFilters, type EntityId } from "@/lib/admin";
import { formatBRL } from "@/lib/format";
import { EmptyState, LoadingState, Modal, Notice, PageHeader, Pagination, StatusBadge, adminErrorMessage, formatAdminDate, useAdminQuery } from "@/components/admin/AdminUI";

const PAGE_SIZE = 10;
type Filters = { search: string; status: CompanyFilters["status"]; from: string; to: string };
const INITIAL_FILTERS: Filters = { search: "", status: "", from: "", to: "" };

function GeneralInformation({ company }: { company: Company }) {
  return <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><dt className="text-gray-500">Nome</dt><dd className="mt-1 break-words font-medium">{company.name}</dd></div><div><dt className="text-gray-500">E-mail</dt><dd className="mt-1 break-all">{company.email}</dd></div><div><dt className="text-gray-500">CNPJ</dt><dd className="mt-1">{company.cnpj || "Não informado"}</dd></div><div><dt className="text-gray-500">Telefone</dt><dd className="mt-1">{company.phone || "Não informado"}</dd></div><div><dt className="text-gray-500">Cadastro</dt><dd className="mt-1">{formatAdminDate(company.createdAt)}</dd></div><div><dt className="text-gray-500">Último acesso</dt><dd className="mt-1">{formatAdminDate(company.lastAccessAt)}</dd></div><div><dt className="mb-1 text-gray-500">Status</dt><dd><StatusBadge status={company.status} /></dd></div></dl>;
}

function CompanyDetails({ id, onClose }: { id: EntityId; onClose: () => void }) {
  const load = useCallback((signal: AbortSignal) => adminApi.company(id, signal), [id]);
  const { data, error, loading, reload } = useAdminQuery(load);
  return <Modal title="Detalhes da empresa" onClose={onClose}>{loading ? <LoadingState label="Carregando empresa..." /> : error ? <Notice kind="error">{error} <button type="button" className="admin-link" onClick={reload}>Tentar novamente</button></Notice> : data && <>
    <GeneralInformation company={data} />
    {data.statusReason && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4"><h3 className="text-sm font-semibold text-red-800">Justificativa registrada</h3><p className="mb-0 whitespace-pre-wrap break-words text-sm text-red-700">{data.statusReason}</p></div>}
    <section className="mt-6 border-t border-[#e9eaf2] pt-5"><h3 className="text-base font-semibold">Saldo</h3><p className="mb-0 text-2xl font-semibold text-[#5141d9]">{data.balance == null ? "Não informado" : formatBRL(data.balance)}</p></section>
    <section className="mt-6 border-t border-[#e9eaf2] pt-5">
      <h3 className="text-base font-semibold">Configuração da IA</h3>
      {data.aiConfiguration ? <dl className="space-y-3 text-sm">
        <div><dt className="text-gray-500">Nome da empresa na IA</dt><dd className="mt-1 break-words">{data.aiConfiguration.companyName || "Não informado"}</dd></div>
        <div><dt className="text-gray-500">Nome da IA</dt><dd className="mt-1 break-words">{data.aiConfiguration.name || "Não informado"}</dd></div>
        <div><dt className="text-gray-500">Instruções</dt><dd className="mt-1 whitespace-pre-wrap break-words rounded-xl bg-[#f7f8fc] p-3">{data.aiConfiguration.instructions || "Nenhuma instrução cadastrada."}</dd></div>
      </dl> : <p className="text-sm text-gray-500">Nenhuma configuração de IA cadastrada.</p>}
    </section>
    <div className="mt-6 flex justify-end"><button type="button" className="admin-secondary" onClick={onClose}>Fechar</button></div>
  </>}</Modal>;
}

function ChangeCompanyStatus({ company, onClose, onSuccess }: { company: Company; onClose: () => void; onSuccess: (message: string) => void }) {
  const deactivating = company.status === "ACTIVE";
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving || !confirmed) return;
    if (deactivating && !reason.trim()) { setError("Informe a justificativa da desativação."); return; }
    setSaving(true);
    setError(null);
    try {
      await adminApi.setCompanyStatus(company.id, deactivating ? "INACTIVE" : "ACTIVE", deactivating ? reason.trim() : undefined);
      onSuccess(`Empresa ${deactivating ? "desativada" : "reativada"} com sucesso.`);
    } catch (cause) { setError(adminErrorMessage(cause)); setSaving(false); }
  }

  return <Modal title={deactivating ? "Desativar empresa" : "Reativar empresa"} onClose={onClose} busy={saving}><form onSubmit={submit}><div className="mb-5 rounded-xl bg-[#f7f8fc] p-4"><p className="mb-1 font-semibold">{company.name}</p><p className="mb-1 break-all text-sm text-gray-500">{company.email}</p><p className="mb-0 text-sm text-gray-500">CNPJ: {company.cnpj || "Não informado"}</p></div><p className="text-sm text-gray-600">{deactivating ? "A empresa perderá o acesso à plataforma. A justificativa será salva e a operação será registrada no histórico administrativo." : "A empresa voltará a ter acesso à plataforma. A operação será registrada no histórico administrativo."}</p>{deactivating && <div className="mb-5"><label htmlFor="company-status-reason" className="mb-2 block text-sm font-medium">Justificativa da desativação <span className="text-red-600">*</span></label><textarea id="company-status-reason" className="admin-field min-h-28 resize-y" value={reason} disabled={saving} required maxLength={2000} onChange={(event) => setReason(event.target.value)} placeholder="Descreva o motivo da desativação" /><p className="mb-0 mt-1 text-xs text-gray-400">{reason.length}/2000 caracteres</p></div>}<label className="mb-5 flex items-start gap-3 text-sm text-gray-600"><input type="checkbox" className="mt-0.5 h-4 min-h-0! w-4 shrink-0 accent-[#5141d9]" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={saving} required />Confirmo a {deactivating ? "desativação" : "reativação"} da empresa indicada acima.</label>{error && <Notice kind="error">{error}</Notice>}<div className="flex flex-wrap justify-end gap-3"><button type="button" className="admin-secondary" disabled={saving} onClick={onClose}>Cancelar</button><button type="submit" className={deactivating ? "admin-danger" : "px-4 font-semibold"} disabled={saving || !confirmed || (deactivating && !reason.trim())}>{saving ? "Salvando..." : `Confirmar ${deactivating ? "desativação" : "reativação"}`}</button></div></form></Modal>;
}

export default function CompaniesPage() {
  const [draft, setDraft] = useState<Filters>(INITIAL_FILTERS);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [details, setDetails] = useState<EntityId | null>(null);
  const [target, setTarget] = useState<Company | null>(null);
  const load = useCallback((signal: AbortSignal) => adminApi.companies({ ...filters, page, pageSize: PAGE_SIZE }, signal), [filters, page]);
  const { data, error, loading, reload } = useAdminQuery(load);

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    if (draft.from && draft.to && draft.from > draft.to) { setFilterError("A data inicial deve ser anterior ou igual à data final."); return; }
    setFilterError(null);
    setFilters({ ...draft, search: draft.search.trim() });
    setPage(1);
  }

  return <>
    <PageHeader title="Empresas" description="Consulte as empresas cadastradas e controle o acesso à plataforma." />
    {success && <Notice kind="success">{success}</Notice>}
    <section className="admin-panel"><form onSubmit={applyFilters} className="mb-6"><div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(200px,2fr)_minmax(130px,1fr)_minmax(145px,1fr)_minmax(145px,1fr)]"><div><label htmlFor="company-search" className="mb-2 block text-sm font-medium">Pesquisar empresas</label><input id="company-search" type="search" maxLength={200} className="admin-field" placeholder="Nome, e-mail ou CNPJ" value={draft.search} onChange={(event) => setDraft({ ...draft, search: event.target.value })} /></div><div><label htmlFor="company-status" className="mb-2 block text-sm font-medium">Status</label><select id="company-status" className="admin-field" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Filters["status"] })}><option value="">Todos os status</option><option value="ACTIVE">Ativas</option><option value="INACTIVE">Desativadas</option></select></div><div><label htmlFor="company-from" className="mb-2 block text-sm font-medium">Cadastro a partir de</label><input id="company-from" type="date" className="admin-field" value={draft.from} max={draft.to || undefined} onChange={(event) => setDraft({ ...draft, from: event.target.value })} /></div><div><label htmlFor="company-to" className="mb-2 block text-sm font-medium">Cadastro até</label><input id="company-to" type="date" className="admin-field" value={draft.to} min={draft.from || undefined} onChange={(event) => setDraft({ ...draft, to: event.target.value })} /></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="submit" className="px-5 font-semibold" disabled={loading}>Aplicar filtros</button><button type="button" className="admin-secondary" onClick={() => { setDraft(INITIAL_FILTERS); setFilters(INITIAL_FILTERS); setFilterError(null); setPage(1); }}>Limpar filtros</button><button type="button" className="admin-secondary" onClick={reload} disabled={loading}>Atualizar</button></div></form>
      {filterError && <Notice kind="error">{filterError}</Notice>}
      {error ? <Notice kind="error">{error} <button type="button" className="admin-link" onClick={reload}>Tentar novamente</button></Notice> : loading ? <LoadingState label="Carregando empresas..." /> : data && <>
        {data.items.length ? <div className="overflow-x-auto"><table className="admin-table min-w-[1100px]"><caption className="sr-only">Empresas cadastradas</caption><thead><tr><th>Nome</th><th>E-mail</th><th>CNPJ</th><th>Telefone</th><th>Status</th><th>Cadastro</th><th>Último acesso</th><th>Ações</th></tr></thead><tbody>{data.items.map((company) => <tr key={company.id}><td className="font-medium">{company.name}</td><td className="text-gray-500">{company.email}</td><td className="whitespace-nowrap text-gray-500">{company.cnpj || "Não informado"}</td><td className="whitespace-nowrap text-gray-500">{company.phone || "Não informado"}</td><td><StatusBadge status={company.status} /></td><td className="whitespace-nowrap text-gray-500">{formatAdminDate(company.createdAt)}</td><td className="whitespace-nowrap text-gray-500">{formatAdminDate(company.lastAccessAt)}</td><td><div className="admin-actions flex-nowrap!"><button type="button" className="admin-link whitespace-nowrap" onClick={() => setDetails(company.id)}>Ver detalhes</button><button type="button" className={company.status === "ACTIVE" ? "admin-danger" : "admin-secondary"} onClick={() => setTarget(company)}>{company.status === "ACTIVE" ? "Desativar" : "Reativar"}</button></div></td></tr>)}</tbody></table></div> : <EmptyState>Nenhuma empresa encontrada para os filtros selecionados.</EmptyState>}
        <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
      </>}
    </section>
    {details != null && <CompanyDetails id={details} onClose={() => setDetails(null)} />}
    {target && <ChangeCompanyStatus company={target} onClose={() => setTarget(null)} onSuccess={(message) => { setSuccess(message); setTarget(null); setPage(1); reload(); }} />}
  </>;
}
