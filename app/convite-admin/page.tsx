"use client";

import { Suspense, useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import PasswordInput from "@/components/auth/PasswordInput";
import { LoadingState, Modal, Notice, formatAdminDate, useAdminQuery } from "@/components/admin/AdminUI";
import { ApiError } from "@/lib/api";
import { adminApi } from "@/lib/admin";
import "../admin/admin.css";

function AcceptInviteForm() {
  const token = useSearchParams().get("token")?.trim() ?? "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const load = useCallback((signal: AbortSignal) => {
    if (!token) return Promise.reject(new Error("Link de convite inválido."));
    return adminApi.validateInvite(token, signal);
  }, [token]);
  const { data, loading, error, reload } = useAdminQuery(load);

  function review(event: FormEvent) {
    event.preventDefault();
    if (!data || saving) return;
    setMutationError(null);
    if (!name.trim()) {
      setMutationError("Informe seu nome.");
      return;
    }
    if (password.length < 6) {
      setMutationError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setMutationError("As senhas não conferem. Confira os dois campos.");
      return;
    }
    if (new Date(data.expiresAt).getTime() <= Date.now()) {
      setMutationError("Este convite expirou. Solicite um novo convite ao OWNER.");
      return;
    }
    setConfirming(true);
  }

  async function accept() {
    if (!token || !data || saving) return;
    setSaving(true);
    setMutationError(null);
    try {
      await adminApi.acceptInvite({ token, name: name.trim(), password });
      setPassword("");
      setConfirmation("");
      setConfirming(false);
      setSuccess(true);
      window.history.replaceState(window.history.state, "", "/convite-admin");
    } catch (err) {
      setMutationError(err instanceof ApiError ? err.message : "Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (success) return <div className="flex flex-col gap-5"><Notice kind="success">Conta administrativa criada com sucesso. Você já pode entrar no painel.</Notice><Link href="/login/admin" className="rounded-xl bg-[linear-gradient(110deg,#2d7cff,#5141d9,#7a1eff)] px-4 py-3 text-center font-semibold text-white">Entrar como administrador</Link></div>;
  if (!token) return <Notice kind="error">Link de convite inválido. Abra o link recebido por e-mail ou solicite um novo convite ao OWNER.</Notice>;
  if (loading) return <LoadingState label="Validando convite..." />;
  if (error || !data) return <div><Notice kind="error">{error ?? "Não foi possível validar o convite."} Convites aceitos, expirados ou revogados não podem ser utilizados. Solicite um novo convite ao OWNER se necessário.</Notice><button type="button" className="admin-secondary w-full" onClick={reload}>Verificar novamente</button></div>;

  return (
    <>
      <div className="rounded-xl bg-[#f5f4ff] p-4"><p className="mb-1 text-sm text-gray-500">Você foi convidado com o e-mail</p><p className="mb-1 break-all font-semibold text-[#5141d9]">{data.email}</p><p className="mb-0 text-xs text-gray-500">Convite válido até {formatAdminDate(data.expiresAt)}.</p></div>
      <form onSubmit={review} aria-busy={saving} className="flex flex-col gap-5">
        <div><label htmlFor="invited-name" className="mb-2 block text-base font-medium text-[#45465a]">Nome completo</label><input id="invited-name" name="name" type="text" autoComplete="name" required maxLength={200} className="w-full px-3" disabled={saving} value={name} onChange={(event) => setName(event.target.value)} /></div>
        <PasswordInput id="invite-password" label="Senha" value={password} onChange={setPassword} disabled={saving} />
        <p className="-mt-3 mb-0 text-sm text-gray-500">Use ao menos 6 caracteres, como no cadastro.</p>
        <PasswordInput id="invite-confirmation" label="Confirmar senha" value={confirmation} onChange={setConfirmation} disabled={saving} />
        {mutationError && !confirming && <Notice kind="error">{mutationError}</Notice>}
        <button type="submit" disabled={saving} className="h-12 w-full font-semibold">Revisar cadastro</button>
      </form>
      {confirming && <Modal title="Confirmar cadastro" busy={saving} onClose={() => setConfirming(false)}>
        <p className="text-sm text-gray-600">Confirma a criação da sua conta administrativa com os dados abaixo?</p>
        <dl className="mb-5 rounded-xl bg-[#f7f8fc] p-4"><dt className="text-xs text-gray-500">Nome</dt><dd className="mt-1 mb-3 break-words font-medium">{name.trim()}</dd><dt className="text-xs text-gray-500">E-mail</dt><dd className="mt-1 break-all font-medium">{data.email}</dd></dl>
        {mutationError && <Notice kind="error">{mutationError}</Notice>}
        <div className="admin-actions"><button type="button" className="admin-secondary" disabled={saving} onClick={() => setConfirming(false)}>Voltar</button><button type="button" className="px-4 font-semibold" disabled={saving} onClick={accept}>{saving ? "Criando conta..." : "Confirmar cadastro"}</button></div>
      </Modal>}
    </>
  );
}

export default function ConviteAdminPage() {
  return (
    <AuthCard title="Criar conta administrativa" description="Complete seus dados para aceitar o convite e acessar o painel." backHref="/login/admin">
      <Suspense fallback={<LoadingState label="Carregando convite..." />}><AcceptInviteForm /></Suspense>
    </AuthCard>
  );
}
