# Recuperação de senha

- Login → `/forgot-password`: recebe apenas o email.
- O link do email abre `/reset-password?token=...`: recebe e confirma a nova senha.
- A senha segue o mínimo de 6 caracteres usado no cadastro.

## Configuração da API

Defina `NEXT_PUBLIC_API_URL` no `.env.local` do front (padrão: `http://localhost:8888`) e reinicie o servidor Next.js.
Os caminhos e os corpos das requisições estão em `lib/password.ts`:

- `POST /forgot-password`: `{ email }`.
- `POST /forgot-password/new-password?token=...`: `{ pass1, pass2 }`.

No back-end, `FRONTEND_URL` deve apontar para a origem do front, por exemplo `http://localhost:3000`. O back-end é responsável pelo envio do email, validação, expiração e uso único do token.

## Pendências encontradas no back-end local

A integração usa o contrato de `root/modules/login/Controller.ts`. O fluxo completo depende de correções em `root/modules/login/Service.ts`:

- A busca por email chama `findForgotPasswordEntry(email)`, mas o primeiro argumento do repositório é o token. Para buscar por email, usar `findForgotPasswordEntry(undefined, email)`.
- O token é salvo como SHA-256, mas `createNewPassword` consulta o token recebido sem calcular o hash. A consulta deve usar o hash do token do link.
- A expiração deve usar `token_expires`, e o token precisa ser invalidado após a alteração da senha.
- Ao reenviar o email, gerar um novo token e enviar o valor original; o hash armazenado não deve ser enviado no link.

Esses arquivos do back-end não foram alterados. O envio real do email e a alteração da senha não foram testados com uma conta.
