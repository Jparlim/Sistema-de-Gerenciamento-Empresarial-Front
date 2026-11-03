"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { adminApi, getInviteStatus, type AdminInvite, type InviteStatus } from "@/lib/admin";
import { useAdmin } from "@/components/admin/AdminSession";
import { EmptyState, LoadingState, Modal, Notice, PageHeader, Pagination, StatusBadge, formatAdminDate, useAdminQuery } from "@/components/admin/AdminUI";

const PAGE_SIZE = 10;
type InviteOperation = { type: "resend" | "revoke"; invite: AdminInvite };

export default function ConvitesPage() {
  const { admin } = useAdmin();
  const owner = admin.role === "OWNER";
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InviteStatus | "">("");
  const [page, setPage] = useState(1);
  const [clock, setClock] = useState(() => Date.now());
  const load = useCallback((signal: AbortSignal) => adminApi.invites({ search: query, status, page, pageSize: PAGE_SIZE }, signal), [query, status, page]);
  const { data, loading, error, reload } = useAdminQuery(load);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const [operation, setOperation] = useState<InviteOperation | null>(null);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  function applySearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  function reviewInvite(event: FormEvent) {
    event.preventDefault();
    setMutationError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMutationError("Informe um e-mail válido.");
      return;
    }
    setConfirmEmail(email.trim());
  }

  function closeModal() {
    setCreating(false);
    setConfirmEmail(null);
    setOperation(null);
    setMutationError(null);
  }

  async function execute() {
    if (!owner || saving || (!confirmEmail && !operation)) return;
    if (operation && getInviteStatus(operation.invite) !== "PENDING") {
      setMutationError("Este convite não está mais pendente. Atualize a lista para consultar a situação atual.");
      return;
    }
    setSaving(true);
    setMutationError(null);
    try {
      if (confirmEmail) {
        await adminApi.invite(confirmEmail);
        setSuccess(`Convite enviado para ${confirmEmail}. O link tem validade de 24 horas.`);
        setEmail("");
      } else if (operation?.type === "resend") {
        await adminApi.resendInvite(operation.invite.id);
        setSuccess("Convite reenviado com sucesso. O novo link tem validade de 24 horas.");
      } else if (operation) {
        await adminApi.revokeInvite(operation.invite.id);
        setSuccess("Convite revogado com sucesso.");
      }
      closeModal();
      reload();
    } catch (err) {
      setMutationError(err instanceof ApiError ? err.message : "Não foi possível concluir a operação. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Convites" description="Acompanhe os convites de acesso à administração da Quantyum.">
        {owner && <button type="button" className="px-4 py-3 font-semibold" onClick={() => { setCreating(true); setConfirmEmail(null); setMutationError(null); }}>Convidar administrador</button>}
      </PageHeader>
      {!owner && <Notice kind="info">Somente um OWNER pode enviar, reenviar ou revogar convites.</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      <section className="admin-panel">
        <form onSubmit={applySearch} className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto] sm:items-end">
          <div><label htmlFor="invite-search" className="mb-2 block text-sm font-medium">Pesquisar convites</label><input id="invite-search" className="admin-field w-full" type="search" placeholder="E-mail do convidado" value={search} onChange={(event) => setSearch(event.target.value)} maxLength={200} /></div>
          <div><label htmlFor="invite-status" className="mb-2 block text-sm font-medium">Situação</label><select id="invite-status" className="admin-field w-full" value={status} onChange={(event) => { setStatus(event.target.value as InviteStatus | ""); setPage(1); }}><option value="">Todas</option><option value="PENDING">Pendentes</option><option value="ACCEPTED">Aceitos</option><option value="EXPIRED">Expirados</option><option value="REVOKED">Revogados</option></select></div>
          <button type="submit" className="px-5 font-semibold" disabled={loading}>Pesquisar</button>
        </form>
        {(query || status) && <button type="button" className="admin-link mb-4" onClick={() => { setSearch(""); setQuery(""); setStatus(""); setPage(1); }}>Limpar filtros</button>}
        {error ? <Notice kind="error">{error} <button type="button" className="admin-link" onClick={reload}>Tentar novamente</button></Notice> : loading ? <LoadingState label="Carregando convites..." /> : !data?.items.length ? <EmptyState>Nenhum convite encontrado.</EmptyState> : (
          <>
            <div className="overflow-x-auto"><table className="admin-table min-w-[850px]"><caption className="sr-only">Convites enviados para administradores</caption>
              <thead><tr><th>E-mail</th><th>Enviado por</th><th>Data de envio</th><th>Validade</th><th>Situação</th>{owner && <th>Ações</th>}</tr></thead>
              <tbody>{data.items.map((item) => {
                const inviteStatus = getInviteStatus(item, clock);
                return <tr key={item.id}><td className="font-medium text-gray-800">{item.email}</td><td>{item.invitedBy?.name ?? `Administrador #${item.invitedById}`}</td><td>{formatAdminDate(item.createdAt)}</td><td>{formatAdminDate(item.expiresAt)}</td><td><StatusBadge status={inviteStatus} /></td>{owner && <td>{inviteStatus === "PENDING" ? <div className="flex flex-wrap gap-2"><button type="button" className="admin-secondary" onClick={() => { setOperation({ type: "resend", invite: item }); setMutationError(null); }}>Reenviar</button><button type="button" className="admin-danger" onClick={() => { setOperation({ type: "revoke", invite: item }); setMutationError(null); }}>Revogar</button></div> : <span className="text-gray-400">—</span>}</td>}</tr>;
              })}</tbody>
            </table></div>
          </>
        )}
        {!loading && !error && data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} disabled={loading} />}
      </section>
      {(creating || operation) && <Modal title={operation ? `${operation.type === "resend" ? "Reenviar" : "Revogar"} convite` : confirmEmail ? "Confirmar envio do convite" : "Convidar administrador"} onClose={closeModal} busy={saving}>
        {creating && !confirmEmail ? <form onSubmit={reviewInvite} className="flex flex-col gap-5">
          <p className="mb-0 text-sm text-gray-600">O convidado receberá um link por e-mail para criar a conta. O link terá validade de 24 horas.</p>
          <div><label htmlFor="invite-email" className="mb-2 block text-sm font-medium">E-mail do administrador</label><input id="invite-email" className="admin-field w-full" type="email" required autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          {mutationError && <Notice kind="error">{mutationError}</Notice>}
          <div className="admin-actions"><button type="button" className="admin-secondary" onClick={closeModal}>Cancelar</button><button type="submit" className="px-4 font-semibold">Revisar convite</button></div>
        </form> : <>
          <div className="mb-4 rounded-xl bg-[#f7f8fc] p-4"><p className="mb-1 text-xs font-medium text-gray-500">Destinatário</p><p className="mb-0 break-all font-semibold">{confirmEmail ?? operation?.invite.email}</p></div>
          <p className="text-sm text-gray-600">{confirmEmail ? "Confirma o envio do convite para este e-mail? O destinatário poderá criar uma conta de administrador." : operation?.type === "resend" ? "Confirma o reenvio? Um novo link será enviado com validade de 24 horas. O link anterior deixará de funcionar." : "Confirma a revogação? O destinatário não poderá criar a conta usando este convite."}</p>
          <p className="text-sm text-gray-500">Esta ação será registrada no histórico administrativo.</p>
          {mutationError && <Notice kind="error">{mutationError}</Notice>}
          <div className="admin-actions"><button type="button" className="admin-secondary" disabled={saving} onClick={() => confirmEmail ? setConfirmEmail(null) : closeModal()}>{confirmEmail ? "Voltar" : "Cancelar"}</button><button type="button" className={operation?.type === "revoke" ? "admin-danger" : "px-4 font-semibold"} disabled={saving} onClick={execute}>{saving ? "Processando..." : operation?.type === "revoke" ? "Confirmar revogação" : operation ? "Confirmar reenvio" : "Confirmar envio"}</button></div>
        </>}
      </Modal>}
    </>
  );
}
