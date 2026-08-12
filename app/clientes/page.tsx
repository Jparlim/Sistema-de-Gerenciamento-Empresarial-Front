"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import StatsGrid from "@/components/clientes/StatsGrid";
import FiltroNegocios from "@/components/clientes/FiltroNegocios";
import ClientesTable from "@/components/clientes/ClientesTable";
import ClienteModal from "@/components/clientes/ClienteModal";
import {
  listClientes,
  updateCliente,
  deleteCliente,
  Cliente,
  ClienteStatus,
} from "@/lib/clientes";
import { ApiError } from "@/lib/api";

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<ClienteStatus>("Fechado");
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await listClientes();
      setClientes(data);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os clientes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  async function handleSave(
    nome: string,
    contato: string,
    status: ClienteStatus,
    resumo: string,
    valorPotencial: number,
  ) {
    if (!editando) return;

    setSaving(true);
    try {
      const atualizado = await updateCliente(editando.id, {
        nome,
        contato,
        status,
        resumo,
        valorPotencial,
      });
      setClientes((prev) =>
        prev.map((c) => (c.id === atualizado.id ? atualizado : c)),
      );
      setEditando(null);
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar o cliente.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cliente: Cliente) {
    if (!confirm(`Excluir o cliente ${cliente.nome ?? cliente.contato}?`))
      return;

    try {
      await deleteCliente(cliente.id);
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Não foi possível excluir o cliente.",
      );
    }
  }

  return (
    <AppShell>
      <h1 className="text-4xl font-medium mb-8">Clientes</h1>

      {erro && <p className="text-red-600 font-semibold mb-4">{erro}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Carregando clientes...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <StatsGrid clientes={clientes} />
            <ClientesTable
              clientes={clientes}
              onEdit={setEditando}
              onDelete={handleDelete}
            />
          </div>

          <FiltroNegocios
            clientes={clientes}
            status={statusFiltro}
            onStatusChange={setStatusFiltro}
            onEdit={setEditando}
            onDelete={handleDelete}
          />
        </div>
      )}

      {editando && (
        <ClienteModal
          cliente={editando}
          onClose={() => setEditando(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </AppShell>
  );
}
