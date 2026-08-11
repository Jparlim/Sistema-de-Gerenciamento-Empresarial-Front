"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DadosTable from "@/components/configuracaoIA/DadosTable";
import DadoModal from "@/components/configuracaoIA/DadoModal";
import { getIA, createIA, updateIA } from "@/lib/ia";
import { ApiError } from "@/lib/api";

type FormState = {
  nomeEmpresa: string;
  nomeIA: string;
  instructions: string;
};

export default function ConfiguracaoIA() {
  const [form, setForm] = useState<FormState>({
    nomeEmpresa: "",
    nomeIA: "",
    instructions: "",
  });
  const [dados, setDados] = useState<Record<string, string>>({});
  const [isNew, setIsNew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [dadoModal, setDadoModal] = useState<{ key: string | null } | null>(
    null,
  );

  useEffect(() => {
    getIA()
      .then((config) => {
        if (!config) return;
        setForm({
          nomeEmpresa: config.nomeEmpresa ?? "",
          nomeIA: config.nomeIA ?? "",
          instructions: config.instructions ?? "",
        });
        setDados(config.data ?? {});
        setIsNew(false);
      })
      .catch((err) => {
        setErro(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar a configuração da IA.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSaveDado(nomeAnterior: string | null, nome: string, tipo: string) {
    setDados((prev) => {
      const next = { ...prev };
      if (nomeAnterior && nomeAnterior !== nome) delete next[nomeAnterior];
      next[nome] = tipo;
      return next;
    });
    setDadoModal(null);
  }

  function handleDeleteDado(nome: string) {
    setDados((prev) => {
      const next = { ...prev };
      delete next[nome];
      return next;
    });
  }

  async function handleSave() {
    setErro(null);
    setSalvo(false);

    if (!form.nomeEmpresa.trim() || !form.nomeIA.trim() || !form.instructions.trim()) {
      setErro("Preencha nome da empresa, nome da IA e instruções gerais.");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, data: dados };
      await (isNew ? createIA(payload) : updateIA(payload));
      setIsNew(false);
      setSalvo(true);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar a configuração da IA.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-gray-400 text-sm">Carregando configuração...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-4xl font-medium">Configuração da Inteligência Artificial</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="!bg-blu !bg-none rounded-2xl px-6 h-14"
        >
          {saving ? "Salvando..." : "salvar alterações"}
        </button>
      </div>

      {erro && <p className="text-red-600 font-semibold mb-4">{erro}</p>}
      {salvo && !erro && (
        <p className="text-green-600 font-semibold mb-4">
          Configuração salva com sucesso!
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-[26px] font-normal mb-4">Identidade da IA</h2>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Nome da Empresa
                </p>
                <input
                  type="text"
                  className="w-full pl-2"
                  value={form.nomeEmpresa}
                  onChange={(e) => updateField("nomeEmpresa", e.target.value)}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Nome da IA
                </p>
                <input
                  type="text"
                  className="w-full pl-2"
                  value={form.nomeIA}
                  onChange={(e) => updateField("nomeIA", e.target.value)}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Instruções gerais
                </p>
                <textarea
                  className="w-full pl-2 py-3 border-2 border-gra rounded-[10px] outline-none resize-none"
                  rows={5}
                  value={form.instructions}
                  onChange={(e) => updateField("instructions", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[26px] font-normal mb-4">
              Dados que a IA deve coletar
            </h2>

            <DadosTable
              dados={dados}
              onAdd={() => setDadoModal({ key: null })}
              onEdit={(nome) => setDadoModal({ key: nome })}
              onDelete={handleDeleteDado}
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6">
          {isNew ? (
            <>
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                Bem-vindo! Vamos configurar sua IA
              </h2>
              <p className="text-blue-900 mb-4">
                Antes de usar o sistema, configure como a sua IA deve se
                comportar ao conversar com os clientes pelo WhatsApp.
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-blue-900">
                <li>
                  Preencha o nome da sua empresa e escolha um nome para a IA.
                </li>
                <li>
                  Escreva instruções gerais explicando como ela deve atender e
                  responder seus clientes.
                </li>
                <li>
                  Defina quais dados a IA deve coletar durante a conversa
                  (nome, telefone, endereço, etc.).
                </li>
                <li>
                  Quando terminar, clique em &quot;salvar alterações&quot;
                  para ativar sua IA.
                </li>
              </ul>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Dica</h2>
              <p className="text-blue-900">
                Você pode voltar aqui a qualquer momento para ajustar as
                instruções da IA ou os dados que ela deve coletar durante o
                atendimento.
              </p>
            </>
          )}
        </div>
      </div>

      {dadoModal && (
        <DadoModal
          initialNome={dadoModal.key ?? ""}
          initialTipo={dadoModal.key ? dados[dadoModal.key] : undefined}
          onClose={() => setDadoModal(null)}
          onSave={(nome, tipo) => handleSaveDado(dadoModal.key, nome, tipo)}
        />
      )}
    </AppShell>
  );
}
