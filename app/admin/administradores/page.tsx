"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { adminApi, type Admin } from "@/lib/admin";
import { useAdmin } from "@/components/admin/AdminSession";
import { EmptyState, LoadingState, Modal, Notice, PageHeader, Pagination, StatusBadge, formatAdminDate, useAdminQuery } from "@/components/admin/AdminUI";

const PAGE_SIZE = 10;

export default function AdministradoresPage() {
  const { admin, refreshSession } = useAdmin();
  const owner = admin.role === "OWNER";
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const load = useCallback((signal: AbortSignal) => adminApi.administrators({ search: query, page, pageSize: PAGE_SIZE }, signal), [query, page]);
  const { data, loading, error, reload } = useAdminQuery(load);
  const [target, setTarget] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function lastOwner(item: Admin) {
    return item.role === "OWNER" && item.status === "ACTIVE" && (!data || data.activeOwnerCount <= 1);
  }

  function applySearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  async function changeStatus() {
    if (!owner || !target || saving || lastOwner(target)) return;
    setSaving(true);
    setMutationError(null);
    try {
      await adminApi.setAdminStatus(target.id, target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
      setSuccess(`Administrador ${target.status === "ACTIVE" ? "desativado" : "reativado"} com sucesso.`);
      const changedSelf = String(target.id) === String(admin.id);
      setTarget(null);
      reload();
      if (changedSelf) refreshSession();
    } catch (err) {
      setMutationError(err instanceof ApiError ? err.message : "Não foi possível alterar o administrador. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Administradores" description="Consulte a equipe administrativa e gerencie os acessos ao painel.">
        {owner && <Link href="/admin/convites" className="rounded-xl bg-[linear-gradient(110deg,#2d7cff,#5141d9,#7a1eff)] px-4 py-3 text-sm font-semibold text-white">Convidar administrador</Link>}
      </PageHeader>
      {!owner && <Notice kind="info">Seu cargo permite consultar os administradores. Somente um OWNER pode alterar acessos ou enviar convites.</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <section className="admin-panel">
        <form onSubmit={applySearch} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1"><label htmlFor="admin-search" className="mb-2 block text-sm font-medium">Pesquisar administradores</label><input id="admin-search" className="admin-field w-full" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou e-mail" type="search" maxLength={200} /></div>
          <button type="submit" className="px-5 font-semibold" disabled={loading}>Pesquisar</button>
          {query && <button type="button" className="admin-secondary" onClick={() => { setSearch(""); setQuery(""); setPage(1); }}>Limpar</button>}
        </form>
        {error ? <Notice kind="error">{error} <button type="button" className="admin-link" onClick={reload}>Tentar novamente</button></Notice> : loading ? <LoadingState label="Carregando administradores..." /> : !data?.items.length ? <EmptyState>Nenhum administrador encontrado.</EmptyState> : (
          <>
            <div className="overflow-x-auto"><table className="admin-table min-w-[900px]"><caption className="sr-only">Administradores cadastrados</caption>
              <thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Status</th><th>Cadastro</th><th>Último acesso</th>{owner && <th>Ações</th>}</tr></thead>
              <tbody>{data.items.map((item) => <tr key={item.id}>
                <td><span className="font-medium text-gray-800">{item.name}</span>{String(item.id) === String(admin.id) && <span className="ml-2 text-xs text-[#73758a]">(você)</span>}</td><td>{item.email}</td>
                <td><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.role === "OWNER" ? "bg-[#f1eeff] text-[#5141d9]" : "bg-gray-100 text-gray-600"}`}>{item.role}</span></td>
                <td><StatusBadge status={item.status} label={item.status === "ACTIVE" ? "Ativo" : "Desativado"} /></td><td>{formatAdminDate(item.createdAt)}</td><td>{formatAdminDate(item.lastAccessAt)}</td>
                {owner && <td><button type="button" className={item.status === "ACTIVE" ? "admin-danger" : "admin-secondary"} disabled={lastOwner(item)} title={lastOwner(item) ? "O último OWNER ativo não pode ser desativado." : undefined} onClick={() => { setTarget(item); setMutationError(null); }}>{item.status === "ACTIVE" ? "Desativar" : "Reativar"}</button>{lastOwner(item) && <p className="mt-1 mb-0 text-xs text-gray-500">Último OWNER ativo</p>}</td>}
              </tr>)}</tbody>
            </table></div>
          </>
        )}
        {!loading && !error && data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} disabled={loading} />}
      </section>
      {target && <Modal title={`${target.status === "ACTIVE" ? "Desativar" : "Reativar"} administrador`} busy={saving} onClose={() => { setTarget(null); setMutationError(null); }}>
        <div className="mb-5 rounded-xl bg-[#f7f8fc] p-4"><p className="mb-1 font-semibold">{target.name}</p><p className="mb-1 break-all text-sm text-gray-600">{target.email}</p><p className="mb-0 text-sm text-gray-500">Cargo: {target.role}</p></div>
        <p className="text-sm text-gray-600">{target.status === "ACTIVE" ? "Ao confirmar, este administrador perderá o acesso ao painel." : "Ao confirmar, este administrador poderá acessar o painel novamente."} A operação será registrada no histórico administrativo.</p>
        {String(target.id) === String(admin.id) && <Notice kind="info">Você está alterando seu próprio acesso e sua sessão poderá ser encerrada.</Notice>}
        {mutationError && <Notice kind="error">{mutationError}</Notice>}
        <div className="admin-actions"><button type="button" className="admin-secondary" disabled={saving} onClick={() => setTarget(null)}>Cancelar</button><button type="button" className={target.status === "ACTIVE" ? "admin-danger" : "px-4 font-semibold"} disabled={saving || lastOwner(target)} onClick={changeStatus}>{saving ? "Salvando..." : `Confirmar ${target.status === "ACTIVE" ? "desativação" : "reativação"}`}</button></div>
      </Modal>}
    </>
  );
}
