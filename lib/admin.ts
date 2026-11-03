import { apiFetch, ApiError } from "@/lib/api";

// Contrato do painel: veja docs/admin-api.md. As rotas administrativas ainda
// precisam ser implementadas no backend; nenhuma resposta fictícia é utilizada.
export type EntityId = string | number;
export type AccountStatus = "ACTIVE" | "INACTIVE";
export type CompanyStatus = AccountStatus;
export type AdminRole = "OWNER" | "ADMIN";
export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export type AdminSummary = { id: EntityId; name: string; email: string };
export type Admin = AdminSummary & {
  role: AdminRole;
  status: AccountStatus;
  createdAt: string;
  lastAccessAt: string | null;
};
export type AdminSession = { admin: Admin };

export type Company = {
  id: EntityId;
  name: string;
  email: string;
  cnpj: string;
  phone: string | null;
  status: CompanyStatus;
  statusReason: string | null;
  createdAt: string;
  lastAccessAt: string | null;
};
export type CompanyDetail = Company & {
  balance: number | null;
  aiConfiguration: {
    companyName: string | null;
    name: string | null;
    instructions: string | null;
  } | null;
};

export type AdminInvite = {
  id: EntityId;
  email: string;
  invitedById: EntityId;
  invitedBy: AdminSummary | null;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  status: InviteStatus;
};
export type InviteValidation = { email: string; expiresAt: string };
export type MutationResult = { success: boolean; message?: string };

export const AUDIT_ACTIONS = [
  "ADMIN_INVITED",
  "ADMIN_INVITE_REVOKED",
  "ADMIN_INVITE_ACCEPTED",
  "ADMIN_DEACTIVATED",
  "ADMIN_REACTIVATED",
  "COMPANY_DEACTIVATED",
  "COMPANY_REACTIVATED",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
type DetailValue = string | number | boolean | null;
export type AuditDetails = {
  operation?: "CREATE" | "RESEND";
  statusReason?: string;
  reason?: string;
  email?: string;
  previousStatus?: boolean | string;
  newStatus?: boolean | string;
  changes?: { field: string; from: DetailValue; to: DetailValue }[];
};
export type AuditLog = {
  id: EntityId;
  actorId: EntityId;
  actor: AdminSummary | null;
  action: AuditAction | string;
  targetType: string;
  targetId: EntityId;
  createdAt: string;
  details: AuditDetails | null;
};

export type PageResult<T> = { items: T[]; total: number; page: number; pageSize: number };
export type AdministratorsResult = PageResult<Admin> & { activeOwnerCount: number };
export type ListFilters = { search?: string; page?: number; pageSize?: number };
export type CompanyFilters = ListFilters & { status?: CompanyStatus | ""; from?: string; to?: string };
export type InviteFilters = ListFilters & { status?: InviteStatus | "" };
export type AuditFilters = ListFilters & { actorId?: EntityId | ""; action?: string; from?: string; to?: string };
export type DashboardData = {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  newCompaniesThisMonth: number;
  pendingCompanies: number | null;
  growth: { month: string; count: number }[];
  recentCompanies: Company[];
};

// Projeções dos models existentes. Senhas, tokens e hashes não fazem parte do DTO.
type AdminWire = {
  id: EntityId;
  nome: string;
  email: string;
  role: AdminRole;
  ativo: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};
type AdminSummaryWire = Pick<AdminWire, "id" | "nome" | "email">;
type CompanyWire = {
  id: EntityId;
  nome: string;
  email: string;
  CNPJ: string;
  telefone: string | null;
  status: boolean;
  statusReason: string | null;
  createdAt: string;
  lastLoginAt: string | null;
};
type CompanyDetailWire = CompanyWire & {
  saldo: number | null;
  IA: { nomeEmpresa?: string | null; nomeIA: string | null; instructions: string | null } | null;
};
type InviteWire = Omit<AdminInvite, "status" | "invitedBy"> & { invitedBy: AdminSummaryWire | null };
type AuditWire = Omit<AuditLog, "actor" | "details"> & { actor: AdminSummaryWire | null; details: unknown };

function invalidResponse(): never {
  throw new ApiError(502, "A API administrativa retornou uma resposta incompatível. Verifique a integração com o backend.");
}

function summary(raw: AdminSummaryWire): AdminSummary {
  if (!raw || raw.id == null || typeof raw.nome !== "string" || typeof raw.email !== "string") invalidResponse();
  return { id: raw.id, name: raw.nome, email: raw.email };
}

function administrator(raw: AdminWire): Admin {
  if (!raw || !["OWNER", "ADMIN"].includes(raw.role) || typeof raw.ativo !== "boolean") invalidResponse();
  return { ...summary(raw), role: raw.role, status: raw.ativo ? "ACTIVE" : "INACTIVE", createdAt: raw.createdAt, lastAccessAt: raw.lastLoginAt ?? null };
}

function company(raw: CompanyWire): Company {
  if (!raw || typeof raw.nome !== "string" || typeof raw.status !== "boolean") invalidResponse();
  return {
    id: raw.id, name: raw.nome, email: raw.email, cnpj: raw.CNPJ,
    phone: raw.telefone ?? null, status: raw.status ? "ACTIVE" : "INACTIVE",
    statusReason: raw.statusReason ?? null, createdAt: raw.createdAt, lastAccessAt: raw.lastLoginAt ?? null,
  };
}

export function getInviteStatus(invite: Pick<AdminInvite, "acceptedAt" | "revokedAt" | "expiresAt">, now = Date.now()): InviteStatus {
  if (invite.acceptedAt) return "ACCEPTED";
  if (invite.revokedAt) return "REVOKED";
  const expiration = Date.parse(invite.expiresAt);
  // Datas inválidas nunca habilitam ações em um convite.
  return !Number.isFinite(expiration) || expiration <= now ? "EXPIRED" : "PENDING";
}

function invitation(raw: InviteWire): AdminInvite {
  if (!raw || raw.id == null || typeof raw.email !== "string" || typeof raw.expiresAt !== "string") invalidResponse();
  const invite = {
    id: raw.id, email: raw.email, invitedById: raw.invitedById,
    invitedBy: raw.invitedBy ? summary(raw.invitedBy) : null,
    createdAt: raw.createdAt, expiresAt: raw.expiresAt,
    acceptedAt: raw.acceptedAt ?? null, revokedAt: raw.revokedAt ?? null,
  };
  return { ...invite, status: getInviteStatus(invite) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const allowedChangeFields = new Set([
  "nome", "name", "email", "status", "ativo", "role", "statusReason",
  "expiresAt", "acceptedAt", "revokedAt", "CNPJ", "cnpj", "telefone", "phone",
]);
function isDetailValue(value: unknown): value is DetailValue {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

// Nunca repassar JSON arbitrário ao modal: o backend pode conter dados internos.
export function sanitizeAuditDetails(value: unknown): AuditDetails | null {
  if (!isRecord(value)) return null;
  const result: AuditDetails = {};
  if (value.operation === "CREATE" || value.operation === "RESEND") result.operation = value.operation;
  for (const key of ["statusReason", "reason", "email"] as const) {
    if (typeof value[key] === "string") result[key] = value[key];
  }
  for (const key of ["previousStatus", "newStatus"] as const) {
    if (typeof value[key] === "string" || typeof value[key] === "boolean") result[key] = value[key];
  }
  if (Array.isArray(value.changes)) {
    result.changes = value.changes.flatMap((change: unknown) => {
      if (!isRecord(change) || typeof change.field !== "string" || !allowedChangeFields.has(change.field) || !isDetailValue(change.from) || !isDetailValue(change.to)) return [];
      return [{ field: change.field, from: change.from, to: change.to }];
    });
  }
  return result;
}

function query(filters: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  return params.size ? `?${params}` : "";
}

async function read<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(path, { signal, cache: "no-store" });
}

function mappedPage<Wire, Item>(raw: PageResult<Wire>, map: (item: Wire) => Item): PageResult<Item> {
  if (!raw || !Array.isArray(raw.items) || !Number.isInteger(raw.total) || raw.total < 0 || !Number.isInteger(raw.page) || raw.page < 1 || !Number.isInteger(raw.pageSize) || raw.pageSize < 1) invalidResponse();
  return { items: raw.items.map(map), total: raw.total, page: raw.page, pageSize: raw.pageSize };
}

async function mutate(path: string, method: "POST" | "PATCH", payload?: object): Promise<MutationResult> {
  const result = await apiFetch<MutationResult>(path, { method, ...(payload ? { body: JSON.stringify(payload) } : {}) });
  if (result?.success !== true) throw new ApiError(502, result?.message ?? "A operação não foi confirmada pelo servidor. Atualize os dados antes de tentar novamente.");
  return result;
}

const resource = (id: EntityId) => encodeURIComponent(String(id));

export const adminApi = {
  async me(signal?: AbortSignal): Promise<AdminSession> {
    const raw = await read<{ admin: AdminWire }>("/admin/me", signal);
    if (!raw?.admin) invalidResponse();
    return { admin: administrator(raw.admin) };
  },
  async dashboard(signal?: AbortSignal): Promise<DashboardData> {
    const raw = await read<Omit<DashboardData, "recentCompanies"> & { recentCompanies: CompanyWire[] }>("/admin/dashboard", signal);
    if (!raw || !Array.isArray(raw.growth) || !Array.isArray(raw.recentCompanies)) invalidResponse();
    for (const count of [raw.totalCompanies, raw.activeCompanies, raw.inactiveCompanies, raw.newCompaniesThisMonth]) {
      if (!Number.isInteger(count) || count < 0) invalidResponse();
    }
    return {
      totalCompanies: raw.totalCompanies, activeCompanies: raw.activeCompanies,
      inactiveCompanies: raw.inactiveCompanies, newCompaniesThisMonth: raw.newCompaniesThisMonth,
      pendingCompanies: Number.isInteger(raw.pendingCompanies) && raw.pendingCompanies !== null && raw.pendingCompanies >= 0 ? raw.pendingCompanies : null,
      growth: raw.growth.map((point) => {
        if (!point || typeof point.month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(point.month) || !Number.isInteger(point.count) || point.count < 0) invalidResponse();
        return { month: point.month, count: point.count };
      }),
      recentCompanies: raw.recentCompanies.map(company),
    };
  },
  async companies(filters: CompanyFilters = {}, signal?: AbortSignal): Promise<PageResult<Company>> {
    return mappedPage(await read<PageResult<CompanyWire>>(`/admin/companies${query(filters)}`, signal), company);
  },
  async company(id: EntityId, signal?: AbortSignal): Promise<CompanyDetail> {
    const raw = await read<CompanyDetailWire>(`/admin/companies/${resource(id)}`, signal);
    if (!raw || (raw.saldo !== null && (typeof raw.saldo !== "number" || !Number.isFinite(raw.saldo)))) invalidResponse();
    return { ...company(raw), balance: raw.saldo, aiConfiguration: raw.IA ? { companyName: raw.IA.nomeEmpresa ?? null, name: raw.IA.nomeIA, instructions: raw.IA.instructions } : null };
  },
  async setCompanyStatus(id: EntityId, status: AccountStatus, statusReason?: string): Promise<MutationResult> {
    if (status === "INACTIVE" && !statusReason?.trim()) throw new ApiError(400, "Informe a justificativa da desativação.");
    return mutate(`/admin/companies/${resource(id)}/status`, "PATCH", { status: status === "ACTIVE", ...(status === "INACTIVE" ? { statusReason: statusReason!.trim() } : {}) });
  },
  async administrators(filters: ListFilters = {}, signal?: AbortSignal): Promise<AdministratorsResult> {
    const raw = await read<PageResult<AdminWire> & { activeOwnerCount: number }>(`/admin/administrators${query(filters)}`, signal);
    if (!raw || !Number.isInteger(raw.activeOwnerCount) || raw.activeOwnerCount < 0) invalidResponse();
    return { ...mappedPage(raw, administrator), activeOwnerCount: raw.activeOwnerCount };
  },
  setAdminStatus(id: EntityId, status: AccountStatus): Promise<MutationResult> {
    return mutate(`/admin/administrators/${resource(id)}/status`, "PATCH", { ativo: status === "ACTIVE" });
  },
  async invites(filters: InviteFilters = {}, signal?: AbortSignal): Promise<PageResult<AdminInvite>> {
    return mappedPage(await read<PageResult<InviteWire>>(`/admin/invites${query(filters)}`, signal), invitation);
  },
  invite(email: string): Promise<MutationResult> {
    return mutate("/admin/invites", "POST", { email: email.trim() });
  },
  resendInvite(id: EntityId): Promise<MutationResult> {
    return mutate(`/admin/invites/${resource(id)}/resend`, "POST");
  },
  revokeInvite(id: EntityId): Promise<MutationResult> {
    return mutate(`/admin/invites/${resource(id)}/revoke`, "POST");
  },
  async auditLogs(filters: AuditFilters = {}, signal?: AbortSignal): Promise<PageResult<AuditLog>> {
    return mappedPage(await read<PageResult<AuditWire>>(`/admin/audit-logs${query(filters)}`, signal), (raw) => ({
      id: raw.id, actorId: raw.actorId, actor: raw.actor ? summary(raw.actor) : null,
      action: raw.action, targetType: raw.targetType, targetId: raw.targetId,
      createdAt: raw.createdAt, details: sanitizeAuditDetails(raw.details),
    }));
  },
  async auditActors(signal?: AbortSignal): Promise<AdminSummary[]> {
    const raw = await read<AdminSummaryWire[]>("/admin/audit-logs/actors", signal);
    if (!Array.isArray(raw)) invalidResponse();
    return raw.map(summary);
  },
  async validateInvite(token: string, signal?: AbortSignal): Promise<InviteValidation> {
    const raw = await read<InviteValidation>(`/admin/invites/validate${query({ token })}`, signal);
    if (!raw || typeof raw.email !== "string" || !Number.isFinite(Date.parse(raw.expiresAt))) invalidResponse();
    return { email: raw.email, expiresAt: raw.expiresAt };
  },
  acceptInvite(payload: { token: string; name: string; password: string }): Promise<MutationResult> {
    return mutate("/admin/invites/accept", "POST", { token: payload.token, nome: payload.name.trim(), senha: payload.password });
  },
};
