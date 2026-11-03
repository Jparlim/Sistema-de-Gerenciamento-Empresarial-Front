import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

// O projeto usa aliases do TypeScript; o runner nativo resolve apenas estes
// imports locais, sem adicionar um segundo framework de testes ao frontend.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const { adminApi, getInviteStatus, sanitizeAuditDetails } = await import("../lib/admin.ts");

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("histórico preserva justificativas e remove segredos e alterações sensíveis", () => {
  const safe = sanitizeAuditDetails({
    statusReason: "Contrato encerrado a pedido da empresa.",
    reason: "Revisão de acesso",
    email: "equipe@example.test",
    previousStatus: true,
    newStatus: false,
    password: "segredo",
    passwordHash: "hash-secreto",
    tokenHash: "hash-do-token",
    accessToken: "token-secreto",
    metadata: { token: "outro-segredo" },
    changes: [
      { field: "status", from: true, to: false },
      { field: "role", from: "OWNER", to: "ADMIN" },
      { field: "passwordHash", from: "hash-anterior", to: "hash-novo" },
      { field: "token", from: null, to: "token-secreto" },
      { field: "status", from: { password: "segredo" }, to: false },
    ],
  });

  assert.deepEqual(safe, {
    statusReason: "Contrato encerrado a pedido da empresa.",
    reason: "Revisão de acesso",
    email: "equipe@example.test",
    previousStatus: true,
    newStatus: false,
    changes: [
      { field: "status", from: true, to: false },
      { field: "role", from: "OWNER", to: "ADMIN" },
    ],
  });
  assert.doesNotMatch(JSON.stringify(safe), /segredo|hash-do-token|token-secreto/);
});

test("histórico não aceita JSON arbitrário em campos de detalhes", () => {
  assert.equal(sanitizeAuditDetails(null), null);
  assert.equal(sanitizeAuditDetails("token-secreto"), null);
  assert.equal(sanitizeAuditDetails([{ password: "segredo" }]), null);
  assert.deepEqual(sanitizeAuditDetails({ statusReason: { token: "segredo" }, newStatus: ["segredo"] }), {});
});

test("histórico identifica reenvio sem aceitar valores arbitrários de operação", () => {
  assert.deepEqual(sanitizeAuditDetails({ operation: "RESEND" }), { operation: "RESEND" });
  assert.deepEqual(sanitizeAuditDetails({ operation: "CREATE" }), { operation: "CREATE" });
  assert.deepEqual(sanitizeAuditDetails({ operation: "token-secreto" }), {});
});

test("convite expira no instante limite e datas inválidas nunca habilitam ações", () => {
  const invitation = { acceptedAt: null, revokedAt: null, expiresAt: "2026-11-04T12:00:00.000Z" };
  const deadline = Date.parse(invitation.expiresAt);
  assert.equal(getInviteStatus(invitation, deadline - 1), "PENDING");
  assert.equal(getInviteStatus(invitation, deadline), "EXPIRED");
  assert.equal(getInviteStatus({ ...invitation, expiresAt: "invalid" }, deadline), "EXPIRED");
  assert.equal(getInviteStatus({ ...invitation, revokedAt: "2026-11-03T12:00:00Z" }, deadline - 1), "REVOKED");
  assert.equal(getInviteStatus({ ...invitation, acceptedAt: "2026-11-03T12:00:00Z" }, deadline), "ACCEPTED");
});

test("desativação sem justificativa falha antes de enviar uma requisição", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch", async () => jsonResponse({ success: true }));
  await assert.rejects(adminApi.setCompanyStatus("empresa-1", "INACTIVE", "   "), /justificativa/);
  assert.equal(fetch.mock.callCount(), 0);
});

test("desativação envia status e justificativa com cookies de sessão", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch", async () => jsonResponse({ success: true }));
  await adminApi.setCompanyStatus("empresa/1", "INACTIVE", "  Contrato encerrado.  ");
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(new URL(url).pathname, "/admin/companies/empresa%2F1/status");
  assert.equal(options.method, "PATCH");
  assert.equal(options.credentials, "include");
  assert.deepEqual(JSON.parse(options.body), { status: false, statusReason: "Contrato encerrado." });
});

test("resposta HTTP 200 sem confirmação do servidor não gera sucesso", async (context) => {
  context.mock.method(globalThis, "fetch", async () => jsonResponse({ success: false, message: "Convite já revogado." }));
  await assert.rejects(adminApi.revokeInvite(1), /Convite já revogado/);
});

test("filtros são codificados e não permitem injetar parâmetros na pesquisa", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch", async () => jsonResponse({ items: [], total: 0, page: 1, pageSize: 10 }));
  await adminApi.auditLogs({ search: "joão@example.test&actorId=outro", action: "ADMIN_INVITED", actorId: "admin/2", page: 1, pageSize: 10 });
  const [url, options] = fetch.mock.calls[0].arguments;
  const params = new URL(url).searchParams;
  assert.equal(params.get("search"), "joão@example.test&actorId=outro");
  assert.equal(params.get("actorId"), "admin/2");
  assert.equal(params.get("action"), "ADMIN_INVITED");
  assert.equal(params.getAll("actorId").length, 1);
  assert.equal(options.cache, "no-store");
});

test("projeção da sessão remove senha e hashes devolvidos indevidamente pelo backend", async (context) => {
  context.mock.method(globalThis, "fetch", async () => jsonResponse({ admin: {
    id: 1, nome: "Responsável", email: "owner@example.test", role: "OWNER", ativo: true,
    createdAt: "2026-11-03T12:00:00Z", lastLoginAt: null,
    senha: "segredo", passwordHash: "hash-secreto", refreshToken: "token-secreto",
  } }));
  assert.deepEqual(await adminApi.me(), { admin: {
    id: 1, name: "Responsável", email: "owner@example.test", role: "OWNER", status: "ACTIVE",
    createdAt: "2026-11-03T12:00:00Z", lastAccessAt: null,
  } });
});

test("papel administrativo desconhecido não libera uma sessão", async (context) => {
  context.mock.method(globalThis, "fetch", async () => jsonResponse({ admin: {
    id: 1, nome: "Usuário", email: "user@example.test", role: "SUPERADMIN", ativo: true,
    createdAt: "2026-11-03T12:00:00Z", lastLoginAt: null,
  } }));
  await assert.rejects(adminApi.me(), { status: 502 });
});

test("saldo e configuração da IA usam projeções explícitas sem campos internos", async (context) => {
  context.mock.method(globalThis, "fetch", async () => jsonResponse({
    id: 1, nome: "Empresa", email: "empresa@example.test", CNPJ: "00000000000000",
    telefone: null, status: false, statusReason: "Contrato encerrado.",
    createdAt: "2026-11-03T12:00:00Z", lastLoginAt: null, saldo: 125.5,
    senha: "segredo", tokenHash: "hash-secreto",
    IA: { nomeEmpresa: "Empresa", nomeIA: "Assistente", instructions: "Atenda os clientes.", apiKey: "chave-secreta" },
  }));
  const company = await adminApi.company(1);
  assert.equal(company.balance, 125.5);
  assert.equal(company.status, "INACTIVE");
  assert.equal(company.statusReason, "Contrato encerrado.");
  assert.deepEqual(company.aiConfiguration, { companyName: "Empresa", name: "Assistente", instructions: "Atenda os clientes." });
  assert.doesNotMatch(JSON.stringify(company), /segredo|secreta|tokenHash|apiKey/);
});

test("gráfico rejeita meses e contagens inválidos antes de renderizar", async (context) => {
  const dashboard = { totalCompanies: 0, activeCompanies: 0, inactiveCompanies: 0, newCompaniesThisMonth: 0, pendingCompanies: null, recentCompanies: [] };
  const payloads = [
    { ...dashboard, growth: [{ month: "2026-13", count: 1 }] },
    { ...dashboard, growth: [{ month: "2026-11", count: -1 }] },
    { ...dashboard, growth: [null] },
  ];
  context.mock.method(globalThis, "fetch", async () => jsonResponse(payloads.shift()));
  for (let attempt = 0; attempt < 3; attempt++) await assert.rejects(adminApi.dashboard(), { status: 502 });
});

test("saldo incompatível não vira valor monetário inventado", async (context) => {
  context.mock.method(globalThis, "fetch", async () => jsonResponse({ saldo: "125.50" }));
  await assert.rejects(adminApi.company(1), { status: 502 });
});
