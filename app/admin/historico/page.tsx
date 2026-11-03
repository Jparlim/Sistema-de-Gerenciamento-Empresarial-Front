"use client";

import { useCallback, useState, type FormEvent } from "react";
import {
  EmptyState,
  LoadingState,
  Modal,
  Notice,
  PageHeader,
  Pagination,
  formatAdminDate,
  useAdminQuery,
} from "@/components/admin/AdminUI";
import { adminApi, type AuditFilters, type AuditLog } from "@/lib/admin";

const PAGE_SIZE = 10;

const actions: Record<string, { label: string; color: string }> = {
  COMPANY_DEACTIVATED: { label: "Empresa desativada", color: "bg-red-50 text-red-700" },
  COMPANY_REACTIVATED: { label: "Empresa reativada", color: "bg-emerald-50 text-emerald-700" },
  ADMIN_DEACTIVATED: { label: "Administrador desativado", color: "bg-red-50 text-red-700" },
  ADMIN_REACTIVATED: { label: "Administrador reativado", color: "bg-emerald-50 text-emerald-700" },
  ADMIN_INVITED: { label: "Convite enviado", color: "bg-violet-50 text-violet-700" },
  ADMIN_INVITE_ACCEPTED: { label: "Convite aceito", color: "bg-blue-50 text-blue-700" },
  ADMIN_INVITE_REVOKED: { label: "Convite revogado", color: "bg-amber-50 text-amber-800" },
};

const emptyFilters = { search: "", actorId: "", action: "", from: "", to: "" };

function actionLabel(action: string, operation?: string) {
  if (action === "ADMIN_INVITED" && operation === "RESEND") return "Convite reenviado";
  return actions[action]?.label ?? action;
}

function ActionBadge({ action, operation }: { action: string; operation?: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${actions[action]?.color ?? "bg-gray-100 text-gray-700"}`}>
      {actionLabel(action, operation)}
    </span>
  );
}

function targetLabel(type: string) {
  const labels: Record<string, string> = {
    COMPANY: "Empresa", Company: "Empresa", company: "Empresa",
    ADMIN: "Administrador", Admin: "Administrador", admin: "Administrador",
    ADMIN_INVITE: "Convite", AdminInvite: "Convite", adminInvite: "Convite",
  };
  return labels[type] ?? type;
}

function detailValue(value: string | number | boolean | null | undefined) {
  if (value == null || value === "") return "Não informado";
  if (value === "ACTIVE") return "Ativo";
  if (value === "INACTIVE") return "Desativado";
  if (value === "PENDING") return "Pendente";
  if (value === true) return "Sim";
  if (value === false) return "Não";
  return String(value);
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 break-words whitespace-pre-wrap text-sm text-gray-800">{value}</dd>
    </div>
  );
}

function AuditDetails({ log }: { log: AuditLog }) {
  const details = log.details;
  const fieldLabels: Record<string, string> = {
    name: "Nome", nome: "Nome", email: "E-mail", role: "Cargo", status: "Status", ativo: "Ativo",
    statusReason: "Justificativa", phone: "Telefone", cnpj: "CNPJ",
    telefone: "Telefone", CNPJ: "CNPJ", expiresAt: "Validade", acceptedAt: "Aceito em", revokedAt: "Revogado em",
  };
  const hasDetails = details && (
    details.statusReason || details.reason || details.email || details.operation ||
    details.previousStatus != null || details.newStatus != null || details.changes?.length
  );

  return (
    <div className="space-y-6">
      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailItem label="Registro" value={String(log.id)} />
        <DetailItem label="Data e horário" value={formatAdminDate(log.createdAt)} />
        <DetailItem label="Administrador responsável" value={log.actor?.name ?? "Administrador não disponível"} />
        <DetailItem label="Identificador do administrador" value={String(log.actorId)} />
        {log.actor?.email && <DetailItem label="E-mail do administrador" value={log.actor.email} />}
        <DetailItem label="Ação" value={actionLabel(log.action, log.details?.operation)} />
        <DetailItem label="Tipo de registro afetado" value={targetLabel(log.targetType)} />
        <DetailItem label="Identificador do registro afetado" value={String(log.targetId)} />
      </dl>

      <div className="border-t border-[#e9eaf2] pt-5">
        <h3 className="mb-4 font-semibold">Detalhes da operação</h3>
        {!hasDetails ? (
          <p className="text-sm text-gray-500">Nenhum detalhe adicional disponível.</p>
        ) : (
          <dl className="space-y-4">
            {details.operation && <DetailItem label="Operação" value={details.operation === "RESEND" ? "Reenvio de convite" : "Criação de convite"} />}
            {details.statusReason && <DetailItem label="Justificativa da desativação" value={details.statusReason} />}
            {details.reason && details.reason !== details.statusReason && <DetailItem label="Justificativa" value={details.reason} />}
            {details.email && <DetailItem label="E-mail afetado" value={details.email} />}
            {details.previousStatus != null && <DetailItem label="Status anterior" value={detailValue(details.previousStatus)} />}
            {details.newStatus != null && <DetailItem label="Novo status" value={detailValue(details.newStatus)} />}
            {!!details.changes?.length && (
              <div>
                <dt className="mb-2 text-xs font-medium text-gray-500">Alterações registradas</dt>
                <dd className="overflow-x-auto rounded-xl border border-[#e9eaf2]">
                  <table className="admin-table min-w-[400px]">
                    <thead><tr><th>Campo</th><th>Antes</th><th>Depois</th></tr></thead>
                    <tbody>
                      {details.changes.map((change, index) => (
                        <tr key={`${change.field}-${index}`}>
                          <td>{fieldLabels[change.field] ?? change.field}</td>
                          <td className="break-words whitespace-pre-wrap">{detailValue(change.from)}</td>
                          <td className="break-words whitespace-pre-wrap">{detailValue(change.to)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}

export default function ActivityHistoryPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState<AuditFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const loadLogs = useCallback(
    (signal: AbortSignal) => adminApi.auditLogs({ ...filters, page, pageSize: PAGE_SIZE }, signal),
    [filters, page],
  );
  const loadActors = useCallback((signal: AbortSignal) => adminApi.auditActors(signal), []);
  const { data, loading, error, reload } = useAdminQuery(loadLogs);
  const actors = useAdminQuery(loadActors);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.from && draft.to && draft.from > draft.to) {
      setFilterError("A data final deve ser igual ou posterior à data inicial.");
      return;
    }
    setFilterError(null);
    setFilters({ ...draft, search: draft.search.trim() });
    setPage(1);
  }

  function clearFilters() {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setFilterError(null);
    setPage(1);
  }

  return (
    <>
      <PageHeader title="Histórico de Atividades" description="Consulte as ações administrativas, os responsáveis e os detalhes de cada operação.">
        <button type="button" className="admin-secondary" onClick={reload} disabled={loading}>Atualizar</button>
      </PageHeader>

      <div className="admin-panel mb-5">
        <form onSubmit={applyFilters} className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label className="block text-sm font-medium text-gray-600">
            Pesquisar registros
            <input type="search" className="admin-field mt-2 w-full" placeholder="Buscar no histórico..." value={draft.search} onChange={(event) => setDraft({ ...draft, search: event.target.value })} />
          </label>
          <label className="block text-sm font-medium text-gray-600">
            Administrador responsável
            <select className="admin-field mt-2 w-full" value={draft.actorId} onChange={(event) => setDraft({ ...draft, actorId: event.target.value })} disabled={actors.loading || !!actors.error}>
              <option value="">{actors.loading ? "Carregando administradores..." : "Todos os administradores"}</option>
              {actors.data?.map((actor) => <option key={actor.id} value={actor.id}>{actor.name} ({actor.email})</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-600">
            Tipo de ação
            <select className="admin-field mt-2 w-full" value={draft.action} onChange={(event) => setDraft({ ...draft, action: event.target.value })}>
              <option value="">Todas as ações</option>
              {Object.entries(actions).map(([value, action]) => <option key={value} value={value}>{action.label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-600">
            Data inicial
            <input type="date" className="admin-field mt-2 w-full" value={draft.from} max={draft.to || undefined} onChange={(event) => setDraft({ ...draft, from: event.target.value })} />
          </label>
          <label className="block text-sm font-medium text-gray-600">
            Data final
            <input type="date" className="admin-field mt-2 w-full" value={draft.to} min={draft.from || undefined} onChange={(event) => setDraft({ ...draft, to: event.target.value })} />
          </label>
          <div className="admin-actions">
            <button type="submit" className="px-5 py-2.5 font-medium" disabled={loading}>Aplicar filtros</button>
            <button type="button" className="admin-secondary" onClick={clearFilters}>Limpar</button>
          </div>
        </form>
        {filterError && <div className="mt-4"><Notice kind="error">{filterError}</Notice></div>}
        {actors.error && (
          <div className="mt-4">
            <Notice kind="error">Não foi possível carregar o filtro de administradores. <button type="button" className="admin-link" onClick={actors.reload}>Tentar novamente</button></Notice>
          </div>
        )}
      </div>

      <section className="admin-panel" aria-label="Registros de atividades" aria-busy={loading}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Atividades administrativas</h2>
          <span className="rounded-full bg-[#f1eeff] px-3 py-1 text-xs font-medium text-[#6754d9]">Somente leitura</span>
        </div>
        {loading ? <LoadingState label="Carregando histórico de atividades..." /> : error ? (
          <Notice kind="error">{error} <button type="button" className="admin-link" onClick={reload}>Tentar novamente</button></Notice>
        ) : !data?.items.length ? (
          <EmptyState>Nenhuma atividade encontrada para os filtros selecionados.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-[850px]">
              <caption className="sr-only">Histórico de ações administrativas</caption>
              <thead><tr><th>Administrador responsável</th><th>Ação</th><th>Registro afetado</th><th>Data e horário</th><th className="text-right">Detalhes</th></tr></thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id}>
                    <td><p className="mb-0 font-medium text-gray-800">{log.actor?.name ?? "Administrador não disponível"}</p><p className="mb-0 mt-0.5 text-xs text-gray-500">{log.actor?.email ?? `ID: ${log.actorId}`}</p></td>
                    <td><ActionBadge action={log.action} operation={log.details?.operation} /></td>
                    <td><p className="mb-0">{targetLabel(log.targetType)}</p><p className="mb-0 mt-0.5 max-w-48 break-all text-xs text-gray-500">ID: {log.targetId}</p></td>
                    <td className="whitespace-nowrap">{formatAdminDate(log.createdAt)}</td>
                    <td className="text-right"><button type="button" className="admin-link whitespace-nowrap" aria-label={`Ver detalhes: ${actionLabel(log.action, log.details?.operation)} em ${formatAdminDate(log.createdAt)}`} onClick={() => setSelected(log)}>Ver detalhes</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && data && (
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} disabled={loading} />
        )}
      </section>

      {selected && (
        <Modal title="Detalhes da atividade" onClose={() => setSelected(null)}>
          <AuditDetails log={selected} />
          <div className="mt-6 flex justify-end"><button type="button" className="admin-secondary" onClick={() => setSelected(null)}>Fechar</button></div>
        </Modal>
      )}
    </>
  );
}
