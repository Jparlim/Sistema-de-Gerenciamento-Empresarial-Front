import { apiFetch } from "@/lib/api";

export type VisitStatus = "cancelado" | "pendente" | "concluido";

export type Visit = {
  id: number;
  clientId: number;
  nome: string;
  contato: string;
  endereco: string;
  observacao: string;
  responsavel: string;
  data: string;
  hora: string;
  status: VisitStatus;
};

export type CreateVisitPayload = {
  contato: string;
  nome: string;
  data: string;
  hora: string;
  endereco: string;
  observacao: string;
  responsavel: string;
  status: VisitStatus;
};

export async function listVisits(year: number, month: number) {
  return apiFetch<Visit[]>(`/visit?year=${year}&month=${month}`);
}

export async function createVisit(payload: CreateVisitPayload) {
  return apiFetch<Visit>("/visit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteVisit(id: number) {
  return apiFetch<boolean>(`/visit/${id}`, { method: "DELETE" });
}
