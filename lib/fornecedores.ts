import { apiFetch } from "@/lib/api";

export type Fornecedor = {
  id: number;
  nome: string;
  contato: string;
  CNPJ: string;
};

export type CreateFornecedorPayload = {
  nome: string;
  contato: string;
  CNPJ: string;
};

export async function listFornecedores() {
  return apiFetch<Fornecedor[]>("/fornecedor");
}

export async function createFornecedor(payload: CreateFornecedorPayload) {
  return apiFetch<Fornecedor>("/fornecedor", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
