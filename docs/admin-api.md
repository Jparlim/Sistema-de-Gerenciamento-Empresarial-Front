# Painel administrativo

O painel é um cliente das APIs do backend configurado em `NEXT_PUBLIC_API_URL`
(padrão: `http://localhost:8888`). O contrato está centralizado em
`lib/admin.ts`, utiliza `apiFetch` e envia os cookies de sessão com
`credentials: "include"`. Não há dados de demonstração, armazenamento de
registros no navegador ou alterações no banco.

## Estado da integração

O schema Prisma do backend local em
`../Sistema-de-Gerenciamento-Empresarial/root/infra/database/prisma/schema.prisma`
foi consultado, sem alterações. As novas rotas `/admin/*` abaixo são um
**contrato de integração a implementar no backend**, não endpoints já
verificados em funcionamento. O backend local possui um CRUD legado `/adm`
que não atende às operações e permissões solicitadas; o painel não o utiliza
como substituto para desativação, convites ou histórico.

O login existente continua usando `POST /login/adm` com `{ email, senha }`.
A sessão administrativa é obtida por `GET /admin/me`; o cargo nunca é
inferido do token pelo navegador. `POST /logout`, já existente no backend,
remove os cookies `token` e `refreshToken` e pode encerrar a sessão admin.

## Models e projeções seguras

Os nomes utilizados pela interface são DTOs, não mudanças nos models.
As respostas HTTP usam os nomes existentes do schema; o adaptador transforma
explicitamente cada resposta e descarta campos não utilizados.

| Model | Projeção HTTP esperada | DTO da interface |
| --- | --- | --- |
| `Company` | `id, nome, email, CNPJ, telefone, status, statusReason, createdAt, lastLoginAt` | `id, name, email, cnpj, phone, status, statusReason, createdAt, lastAccessAt` |
| `Company`, detalhe | campos anteriores, `saldo`, `IA: { nomeEmpresa, nomeIA, instructions } \| null` | campos anteriores, `balance`, `aiConfiguration: { companyName, name, instructions } \| null` |
| `Admin` | `id, nome, email, role, ativo, createdAt, lastLoginAt` | `id, name, email, role, status, createdAt, lastAccessAt` |
| `AdminInvite` | `id, email, invitedById, invitedBy: { id, nome, email } \| null, createdAt, expiresAt, acceptedAt, revokedAt` | mesmos campos, `invitedBy.name`, `status` calculado |
| `AdminAuditLog` | `id, actorId, actor: { id, nome, email } \| null, action, targetType, targetId, createdAt, details` | mesmos campos, `actor.name`, detalhes com campos permitidos |

`Company.status` é booleano; `true` corresponde a `ACTIVE`, e `false`, a
`INACTIVE`. `Admin.ativo` usa a mesma conversão. `Company` não possui um
terceiro status para confirmação. Os cadastros ainda não confirmados estão
em `Company_Pending`; o contador opcional do dashboard deve vir dessa tabela
quando autorizado e disponível, e deve ser `null` quando indisponível.
O DTO de empresas admite somente `ACTIVE` e `INACTIVE`; os cadastros
aguardando confirmação não são tratados como empresas já cadastradas.

O status dos convites é derivado de `acceptedAt`, `revokedAt` e `expiresAt`:
aceito, revogado, expirado ou pendente, nessa ordem. Uma data de expiração
inválida nunca permite ações no convite. O servidor continua sendo a fonte
de autoridade para expiração e validade dos tokens.

Não retornar `senha`, hashes, `tokenHash`, tokens de convite, cookies ou
qualquer segredo em listas, detalhes, dashboard, sessão ou histórico.
O frontend não armazena tokens de autenticação em `localStorage`.

## Contrato HTTP proposto

Datas retornadas são strings ISO 8601 com fuso. IDs podem ser números ou
strings no DTO; o schema atual usa números. Listagens retornam:

```json
{ "items": [], "total": 0, "page": 1, "pageSize": 10 }
```

`page` começa em 1. `total` é a quantidade total após aplicar os filtros,
antes da paginação. O backend deve ordenar listas de forma estável
(por exemplo `createdAt DESC, id DESC`) e validar limites e parâmetros.

| Método e rota | Entrada | Resposta |
| --- | --- | --- |
| `GET /admin/me` | cookie de sessão | `{ admin: <projeção Admin> }` |
| `GET /admin/dashboard` | cookie de sessão | agregado descrito abaixo |
| `GET /admin/companies` | `search, status, from, to, page, pageSize` | página de projeções `Company` |
| `GET /admin/companies/:id` | ID | projeção de detalhe `Company` |
| `PATCH /admin/companies/:id/status` | `{ status: false, statusReason: "justificativa" }` ou `{ status: true }` | confirmação de operação |
| `GET /admin/administrators` | `search, page, pageSize` | página de projeções `Admin` e `activeOwnerCount` na raiz |
| `PATCH /admin/administrators/:id/status` | `{ ativo: false }` ou `{ ativo: true }` | confirmação de operação |
| `GET /admin/invites` | `search, status, page, pageSize` | página de projeções `AdminInvite` |
| `POST /admin/invites` | `{ email }` | confirmação após emissão e envio por email |
| `POST /admin/invites/:id/resend` | sem corpo | confirmação após reemissão e envio por email |
| `POST /admin/invites/:id/revoke` | sem corpo | confirmação de operação |
| `GET /admin/invites/validate?token=...` | token do link, sem sessão prévia | `{ email, expiresAt }`, somente para convite válido |
| `POST /admin/invites/accept` | `{ token, nome, senha }` | confirmação de operação |
| `GET /admin/audit-logs` | `search, actorId, action, from, to, page, pageSize` | página de projeções `AdminAuditLog` |
| `GET /admin/audit-logs/actors` | cookie de sessão | array de `{ id, nome, email }` para o filtro de responsáveis |

Todas as mutações devem responder `{ "success": true, "message": "..." }`
somente após concluir a operação. Uma resposta 2xx com `success: false`,
sem corpo ou sem confirmação explícita é tratada como erro pelo adaptador.
Erros HTTP usam `{ message, issues?: [{ path, message }] }` e códigos
`400/401/403/404/409/410/422` conforme o caso. Não enviar stack traces nem
informações internas em mensagens.

`search` nas empresas busca nome, email e CNPJ (normalizando pontuação do
CNPJ no backend). Nos administradores e convites, busca nome/email conforme
os campos disponíveis; nos logs, busca responsável, ação, alvo e os detalhes
permitidos. Os filtros `status` usam os literais dos DTOs (`ACTIVE`,
`INACTIVE`, `PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`, conforme o recurso);
o backend converte os status de contas para os campos booleanos existentes.
Listagens de `Company` aceitam apenas `ACTIVE`/`INACTIVE`.

`from` e `to` são dias `YYYY-MM-DD`. Considere o início de `from` e o fim
inclusivo de `to` em `America/Sao_Paulo`, convertendo os limites para as datas
armazenadas. Filtros por período referem-se a `createdAt`. O histórico deve
incluir administradores desativados nas opções de responsáveis e manter as
opções independentes da página atual de registros.

O dashboard retorna o objeto abaixo; `recentCompanies` contém projeções
nativas de `Company`, e os números devem ser agregados no servidor:

```ts
{
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  newCompaniesThisMonth: number;
  pendingCompanies: number | null;
  growth: { month: string; count: number }[];
  recentCompanies: CompanyProjection[];
}
```

`month` usa `YYYY-MM`, em ordem crescente, e `count` é o número inteiro não
negativo de empresas cadastradas naquele mês. O adaptador rejeita meses
inválidos e contagens incompatíveis. O backend deve incluir meses sem cadastros com
`count: 0` dentro do período escolhido para o gráfico. O mês atual deve
seguir `America/Sao_Paulo`. Não calcular totais globais a partir da página
atual de uma listagem.

`Company.saldo` é `Float?` no schema atual, e sua projeção HTTP usa
`number | null`, sem serialização de Prisma `Decimal`. O adaptador rejeita
strings, valores não finitos e saldos ausentes na resposta de detalhe para
evitar exibir um saldo incorreto; não há conversão silenciosa de strings.

## Regras que o backend deve garantir

- Autenticar e autorizar todas as rotas privadas com o administrador atual
  ativo. `OWNER` pode convidar, reenviar/revogar convites e alterar o status
  de administradores. As consultas de `ADMIN` devem respeitar os campos e
  recursos permitidos. A política de alteração de empresas também deve ser
  aplicada no servidor; esconder controles no frontend não concede nem
  substitui permissão.
- Calcular `activeOwnerCount` sobre todos os `OWNER` ativos, sem filtros ou
  paginação. Impedir a desativação do último `OWNER` ativo dentro de uma
  transação com proteção contra concorrência. Retornar `409` se a regra
  impedir a alteração mesmo que a tela tivesse um contador anterior.
- Exigir justificativa não vazia para desativar empresa e salvar em
  `Company.statusReason`. Alterar status e inserir `AdminAuditLog`
  atomicamente. O ator vem da sessão, nunca do corpo recebido.
- Executar reativação, desativação, criação/aceite, reenvio e revogação de
  convites com registro administrativo. Não disponibilizar edição ou
  exclusão do histórico ao painel.
- Gerar convites com token aleatório seguro, persistir somente o hash e
  expirar em 24 horas. O email aponta para a página de aceite do frontend
  com `?token=...`. O aceite exige token válido, não revogado, não usado e
  não expirado; cria o `Admin` com `role: ADMIN`, senha com hash e consumo
  único do convite na mesma transação. Nunca aceitar cargo do navegador.
- Permitir reenvio/revogação apenas de convites ainda pendentes, verificando
  a situação novamente no servidor. Reenviar gera outro token, invalida o
  anterior e inicia outra validade de 24 horas. Evitar duplicação em
  requisições concorrentes; falhas de envio não podem ser notificadas como
  sucesso. A expiração deve ser verificada novamente no aceite.
- Usar cookies `HttpOnly`, `Secure` em produção e `SameSite` apropriado,
  validar a origem/CSRF das mutações e configurar CORS para a origem real
  do frontend. Configurar limites e proteção contra abuso nas rotas de
  convite e aceite. Não registrar o token do link em logs de aplicação.

## Histórico e detalhes

As ações existentes no enum `AdminAuditAction` são `ADMIN_INVITED`,
`ADMIN_INVITE_REVOKED`, `ADMIN_INVITE_ACCEPTED`, `ADMIN_DEACTIVATED`,
`ADMIN_REACTIVATED`, `COMPANY_DEACTIVATED` e `COMPANY_REACTIVATED`.
O enum atual não possui uma ação própria para reenvio. O contrato registra
reenvios como `ADMIN_INVITED` com `details.operation: "RESEND"`, diferenciando
de `details.operation: "CREATE"`, sem criar valores novos no enum.

O frontend projeta `details` pelos campos permitidos: `operation`,
`statusReason`, `reason`, `email`, `previousStatus`, `newStatus` e
`changes: [{ field, from, to }]`. As mudanças aceitas usam campos conhecidos
de nome, email, status, cargo, justificativa, datas de convite, CNPJ e telefone,
com valores simples. Objetos aninhados e campos de senha/token/hash são
descartados. O backend deve realizar a mesma seleção antes de responder;
o filtro visual não é uma proteção para uma resposta HTTP que já inclua
segredos.

O schema local declara `AdminAuditLog.companyId` como `Int` obrigatório,
mesmo para operações cujo alvo é um administrador ou convite. Isso precisa
ser considerado no backend para gravar esses eventos corretamente com o
schema vigente: a interface não inventa uma empresa nem envia um `companyId`
arbitrário para contornar a restrição. Nenhuma alteração de schema foi feita.

## Validação da integração

Sem as rotas propostas implementadas e um backend ativo, o painel mostra
carregamento/erro e permite tentar novamente, sem substituir falhas por
contagens ou cadastros inventados. O envio de emails, persistência das
mudanças, auditoria e autenticação devem ser verificados de ponta a ponta
quando o backend estiver disponível.

## Verificação local

`node --test tests/admin-api.test.mjs` executa os testes do adaptador com o
runner nativo do Node 24. Os testes verificam projeções sem segredos,
expiração de convites, envio de justificativa, codificação dos filtros e
rejeição de respostas incompatíveis. Os dados sintéticos existem apenas
nesses testes; a interface sempre consulta o backend.

`npm run build` verifica a compilação de produção e os tipos das rotas.
O aceite público em `/convite-admin?token=...` usa `noindex` e a política
`no-referrer` para evitar indexação e envio do token pelo cabeçalho Referer.
