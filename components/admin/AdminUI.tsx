"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api";

export function PageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <header className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1><p className="mb-0 mt-2 text-sm text-gray-500">{description}</p></div>{children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}</header>;
}

export function Notice({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  const colors = { error: "border-red-100 bg-red-50 text-red-700", success: "border-emerald-100 bg-emerald-50 text-emerald-800", info: "border-[#e5e0fc] bg-[#f5f3ff] text-[#5141d9]" };
  return <div role={kind === "error" ? "alert" : "status"} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${colors[kind]}`}>{children}</div>;
}

export function LoadingState({ label = "Carregando registros..." }: { label?: string }) {
  return <div role="status" className="flex items-center justify-center gap-3 py-14 text-sm text-gray-500"><span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-[#e5e0fc] border-t-[#5141d9]" />{label}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="py-14 text-center text-sm text-gray-500">{children}</div>;
}

export function Pagination({ page, pageSize, total, onPageChange, disabled = false }: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void; disabled?: boolean }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <nav aria-label="Paginação" className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e9eaf2] pt-4 text-sm"><p className="mb-0 text-gray-500">{total === 0 ? "Nenhum registro" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total} registros`}</p><div className="flex items-center gap-3"><button type="button" className="admin-secondary" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>Anterior</button><span aria-live="polite" className="text-gray-500">{page} / {pages}</span><button type="button" className="admin-secondary" disabled={disabled || page >= pages} onClick={() => onPageChange(page + 1)}>Próxima</button></div></nav>;
}

export function Modal({ title, onClose, children, busy = false }: { title: string; onClose: () => void; children: ReactNode; busy?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const focused = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => { element?.close(); focused?.focus(); };
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId} aria-busy={busy} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} className="admin-modal"><div className="mb-5 flex items-center justify-between gap-4"><h2 id={titleId} className="mb-0 text-xl font-semibold">{title}</h2><button type="button" disabled={busy} className="admin-secondary h-10 w-10 shrink-0 p-0!" aria-label="Fechar modal" onClick={onClose}>✕</button></div>{children}</dialog>;
}

const badges: Record<string, { label: string; colors: string }> = {
  ACTIVE: { label: "Ativa", colors: "bg-emerald-50 text-emerald-700" },
  INACTIVE: { label: "Desativada", colors: "bg-red-50 text-red-700" },
  PENDING: { label: "Pendente", colors: "bg-amber-50 text-amber-800" },
  ACCEPTED: { label: "Aceito", colors: "bg-emerald-50 text-emerald-700" },
  EXPIRED: { label: "Expirado", colors: "bg-gray-100 text-gray-600" },
  REVOKED: { label: "Revogado", colors: "bg-red-50 text-red-700" },
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const badge = badges[status] ?? { label: status, colors: "bg-[#f1eeff] text-[#5141d9]" };
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${badge.colors}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{label ?? badge.label}</span>;
}

export function formatAdminDate(value: string | null | undefined) {
  if (!value) return "Não informado";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Não informado" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(date);
}

export function adminErrorMessage(error: unknown, fallback = "Não foi possível concluir a operação. Tente novamente.") {
  return error instanceof ApiError ? error.message : fallback;
}

export function useAdminQuery<T>(loader: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({ data: null, error: null, loading: true });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: null, loading: true });
    loader(controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ data, error: null, loading: false });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ data: null, error: adminErrorMessage(error, "Não foi possível carregar os dados. Tente novamente."), loading: false });
    });
    return () => controller.abort();
  }, [loader, revision]);
  return { ...state, reload };
}
