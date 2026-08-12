import { apiFetch } from "@/lib/api";

export type Produto = {
  id: number;
  nome: string;
  categoria: string;
  quantidade: number;
  valor_unitario: number;
  fornecedorId: number;
  estoqueId: number;
};

export type CreateProdutoPayload = {
  nome: string;
  categoria: string;
  quantidade: number;
  valor_unitario: number;
  nomeFornecedor: string;
  contatoFornecedor: string;
  CNPJFornecedor: string;
};

export type UpdateProdutoPayload = {
  nome?: string;
  categoria?: string;
  quantidade?: number;
  valor_unitario?: number;
  fornecedorId: number;
};

export async function listProdutos() {
  return apiFetch<Produto[]>("/produto");
}

export async function createProduto(payload: CreateProdutoPayload) {
  return apiFetch<Produto>("/produto", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduto(id: number, payload: UpdateProdutoPayload) {
  return apiFetch<Produto>(`/produto/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduto(id: number) {
  return apiFetch<Produto>(`/produto/${id}`, {
    method: "DELETE",
  });
}
