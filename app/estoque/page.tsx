"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import ProdutosTable from "@/components/estoque/ProdutosTable";
import ProdutoModal, {
  ProdutoFormData,
} from "@/components/estoque/ProdutoModal";
import {
  listProdutos,
  createProduto,
  updateProduto,
  deleteProduto,
  Produto,
} from "@/lib/estoque";
import { listFornecedores, Fornecedor } from "@/lib/fornecedores";
import { ApiError } from "@/lib/api";

export default function Estoque() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchDados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const [produtosData, fornecedoresData] = await Promise.all([
        listProdutos(),
        listFornecedores(),
      ]);
      setProdutos(produtosData);
      setFornecedores(fornecedoresData);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar o estoque.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  function fornecedorNome(id: number) {
    return fornecedores.find((f) => f.id === id)?.nome ?? "—";
  }

  async function handleCreate(data: ProdutoFormData) {
    const fornecedor = fornecedores.find((f) => f.id === data.fornecedorId);
    if (!fornecedor) {
      alert("Fornecedor inválido.");
      return;
    }

    setSaving(true);
    try {
      const novo = await createProduto({
        nome: data.nome,
        categoria: data.categoria,
        quantidade: data.quantidade,
        valor_unitario: data.valor_unitario,
        nomeFornecedor: fornecedor.nome,
        contatoFornecedor: fornecedor.contato,
        CNPJFornecedor: fornecedor.CNPJ,
      });
      setProdutos((prev) => [...prev, novo]);
      setCriando(false);
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: ProdutoFormData) {
    if (!editando) return;

    setSaving(true);
    try {
      const atualizado = await updateProduto(editando.id, {
        nome: data.nome,
        categoria: data.categoria,
        quantidade: data.quantidade,
        valor_unitario: data.valor_unitario,
        fornecedorId: data.fornecedorId,
      });
      setProdutos((prev) =>
        prev.map((p) => (p.id === atualizado.id ? atualizado : p)),
      );
      setEditando(null);
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(produto: Produto) {
    if (!confirm(`Excluir o produto ${produto.nome}?`)) return;

    try {
      await deleteProduto(produto.id);
      setProdutos((prev) => prev.filter((p) => p.id !== produto.id));
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Não foi possível excluir o produto.",
      );
    }
  }

  function handleFornecedorCreated(fornecedor: Fornecedor) {
    setFornecedores((prev) => [...prev, fornecedor]);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Estoque</h1>
        <button
          type="button"
          onClick={() => setCriando(true)}
          className="h-12 w-full px-6 sm:w-auto"
        >
          + Adicionar produto
        </button>
      </div>

      {erro && <p className="text-red-600 font-semibold mb-4">{erro}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Carregando estoque...</p>
      ) : (
        <ProdutosTable
          produtos={produtos}
          fornecedorNome={fornecedorNome}
          onEdit={setEditando}
          onDelete={handleDelete}
        />
      )}

      {criando && (
        <ProdutoModal
          produto={null}
          fornecedores={fornecedores}
          onClose={() => setCriando(false)}
          onSave={handleCreate}
          onFornecedorCreated={handleFornecedorCreated}
          saving={saving}
        />
      )}

      {editando && (
        <ProdutoModal
          produto={editando}
          fornecedores={fornecedores}
          onClose={() => setEditando(null)}
          onSave={handleUpdate}
          onFornecedorCreated={handleFornecedorCreated}
          saving={saving}
        />
      )}
    </AppShell>
  );
}
