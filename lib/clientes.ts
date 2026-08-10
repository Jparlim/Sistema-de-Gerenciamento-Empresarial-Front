import { apiFetch } from "@/lib/api";

export type Cliente = {
  id: number;
  nome: string | null;
  contato: string;
};

export async function listClientes() {
  return apiFetch<Cliente[]>("/client");
}
