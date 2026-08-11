import { apiFetch } from "@/lib/api";

export type IAConfig = {
  id: number;
  nomeEmpresa: string | null;
  nomeIA: string | null;
  instructions: string | null;
  data: Record<string, string> | null;
  companyId: number;
};

export type SaveIAPayload = {
  nomeEmpresa: string;
  nomeIA: string;
  instructions: string;
  data: Record<string, string>;
};

export async function getIA() {
  return apiFetch<IAConfig | null>("/ia");
}

export async function createIA(payload: SaveIAPayload) {
  return apiFetch<IAConfig>("/ia", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateIA(payload: SaveIAPayload) {
  return apiFetch<IAConfig>("/ia", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
