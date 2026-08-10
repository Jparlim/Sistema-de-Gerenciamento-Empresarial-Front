"use client";

import { useEffect, useState, FormEvent } from "react";
import { listClientes, Cliente } from "@/lib/clientes";
import {
  createVisit,
  CreateVisitPayload,
  VisitStatus,
  Visit,
} from "@/lib/visits";
import { ApiError } from "@/lib/api";

type NewVisitModalProps = {
  defaultDate: string | null;
  onClose: () => void;
  onCreated: (visit: Visit) => void;
};

type FormState = {
  clienteId: string;
  nome: string;
  data: string;
  hora: string;
  endereco: string;
  observacao: string;
  responsavel: string;
  status: VisitStatus;
};

export default function NewVisitModal({
  defaultDate,
  onClose,
  onCreated,
}: NewVisitModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [erroClientes, setErroClientes] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    clienteId: "",
    nome: "",
    data: defaultDate ?? "",
    hora: "",
    endereco: "",
    observacao: "",
    responsavel: "",
    status: "pendente",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listClientes()
      .then(setClientes)
      .catch((err) =>
        setErroClientes(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar os clientes.",
        ),
      )
      .finally(() => setLoadingClientes(false));
  }, []);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!form.clienteId) return "Selecione um cliente!";
    if (!form.nome.trim()) return "O nome da visita é obrigatório!";
    if (!form.data) return "A data é obrigatória!";
    if (!form.hora) return "O horário é obrigatório!";
    if (!form.endereco.trim()) return "O endereço é obrigatório!";
    if (!form.observacao.trim()) return "A observação é obrigatória!";
    if (!form.responsavel.trim()) return "O responsável é obrigatório!";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setErro(validationError);
      return;
    }

    const cliente = clientes.find((c) => String(c.id) === form.clienteId);
    if (!cliente) {
      setErro("Cliente inválido, selecione novamente.");
      return;
    }

    setErro(null);
    setLoading(true);

    try {
      const payload: CreateVisitPayload = {
        contato: cliente.contato,
        nome: form.nome,
        data: form.data,
        hora: form.hora,
        endereco: form.endereco,
        observacao: form.observacao,
        responsavel: form.responsavel,
        status: form.status,
      };

      const visit = await createVisit(payload);
      onCreated(visit);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível criar a visita. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-sm w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Adicionar visita</h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="bg-none! bg-transparent! shadow-none text-gray-400! hover:text-gray-700! px-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Cliente
            </p>
            {loadingClientes ? (
              <p className="text-sm text-gray-400">Carregando clientes...</p>
            ) : erroClientes ? (
              <p className="text-sm text-red-600">{erroClientes}</p>
            ) : clientes.length === 0 ? (
              <p className="text-sm text-gray-400">
                Nenhum cliente cadastrado ainda.
              </p>
            ) : (
              <select
                className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none"
                value={form.clienteId}
                onChange={(e) => updateField("clienteId", e.target.value)}
              >
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome ?? "Sem nome"} — {c.contato}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Nome da visita
            </p>
            <input
              type="text"
              className="w-full pl-2"
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-full">
              <p className="text-sm font-semibold text-gray-700 mb-1">Data</p>
              <input
                type="date"
                className="w-full pl-2"
                value={form.data}
                onChange={(e) => updateField("data", e.target.value)}
              />
            </div>
            <div className="w-full">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Horário
              </p>
              <input
                type="time"
                className="w-full pl-2"
                value={form.hora}
                onChange={(e) => updateField("hora", e.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Endereço
            </p>
            <input
              type="text"
              className="w-full pl-2"
              value={form.endereco}
              onChange={(e) => updateField("endereco", e.target.value)}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Responsável
            </p>
            <input
              type="text"
              className="w-full pl-2"
              value={form.responsavel}
              onChange={(e) => updateField("responsavel", e.target.value)}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Observação
            </p>
            <textarea
              className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none resize-none"
              rows={3}
              value={form.observacao}
              onChange={(e) => updateField("observacao", e.target.value)}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Status</p>
            <select
              className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none"
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value as VisitStatus)
              }
            >
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {erro && (
            <p className="text-red-600 font-semibold text-center">{erro}</p>
          )}

          <button type="submit" disabled={loading} className="h-14">
            {loading ? "Salvando..." : "Adicionar visita"}
          </button>
        </form>
      </div>
    </div>
  );
}
