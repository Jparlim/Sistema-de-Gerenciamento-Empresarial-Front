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

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSaveDado(
    nomeAnterior: string | null,
    nome: string,
    tipo: string,
  ) {
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

    if (
      !form.nomeEmpresa.trim() ||
      !form.nomeIA.trim() ||
      !form.instructions.trim()
    ) {
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
      <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Configuração da Inteligência Artificial
        </h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-12 w-full rounded-xl px-6 font-semibold sm:h-14 sm:w-auto"
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

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] xl:gap-6">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[#ececf4] bg-white p-5 shadow-[0_8px_30px_rgba(31,28,78,0.04)] sm:p-7">
            <h2 className="mb-5 text-xl font-semibold sm:text-2xl">Identidade da IA</h2>

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
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
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

        <div className="rounded-2xl border border-[#e4ddff] bg-[linear-gradient(145deg,#f5f2ff_0%,#eef5ff_100%)] p-5 sm:p-7">
          {isNew ? (
            <>
              <h2 className="mb-2 text-xl font-semibold text-[#433e67]">
                Bem-vindo! Vamos configurar sua IA
              </h2>
              <p className="mb-4 text-[#433e67]">
                Antes de usar o sistema, configure como a sua IA deve se
                comportar ao conversar com os clientes pelo WhatsApp.
              </p>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-[#433e67]">
                <li>
                  Preencha o nome da sua empresa e escolha um nome para a IA.
                </li>
                <li>
                  Escreva instruções gerais explicando como ela deve atender e
                  responder seus clientes.
                </li>
                <li>
                  Defina quais dados a IA deve coletar durante a conversa (nome,
                  telefone, endereço, etc.).
                </li>
                <li>
                  Quando terminar, clique em &quot;salvar alterações&quot; para
                  ativar sua IA.
                </li>
              </ul>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-semibold text-[#433e67]">Dica</h2>
              <p className="text-[#433e67]">
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
