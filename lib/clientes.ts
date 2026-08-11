import { apiFetch } from "@/lib/api";

export type ClienteStatus = "Fechado" | "Desistência" | "Em Negociação";

export type Cliente = {
  id: number;
  nome: string | null;
  contato: string;
  date: string;
  resumo: string;
  status: ClienteStatus;
};

export type UpdateClientePayload = {
  nome?: string;
  contato?: string;
  status?: ClienteStatus;
  resumo?: string;
};

export async function listClientes() {
  return apiFetch<Cliente[]>("/client");
}

export async function updateCliente(id: number, payload: UpdateClientePayload) {
  return apiFetch<Cliente>(`/client/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCliente(id: number) {
  return apiFetch<Cliente>(`/client/${id}`, {
    method: "DELETE",
  });
}
