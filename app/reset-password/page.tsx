"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import PasswordInput from "@/components/auth/PasswordInput";
import { ApiError } from "@/lib/api";
import { resetPassword } from "@/lib/password";

function ResetPasswordForm() {
  const token = useSearchParams().get("token")?.trim();
  const email = useSearchParams().get("email")?.trim();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !token) return;
    setError(null);
    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não conferem. Confira os dois campos.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, email!, password, confirmation);
      setPassword("");
      setConfirmation("");
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível redefinir a senha. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success)
    return (
      <p
        role="status"
        className="mb-0 rounded-xl bg-[#f5f4ff] p-5 text-center font-medium text-[#5141d9]"
      >
        Senha redefinida com sucesso! Você já pode entrar com sua nova senha.
      </p>
    );
  if (!token)
    return (
      <div role="alert" className="text-center">
        <p className="text-red-600">
          Link de recuperação inválido. Abra o link recebido por email ou
          solicite um novo.
        </p>
        <Link href="/forgot-password" className="font-semibold text-[#5141d9]">
          Solicitar novo link
        </Link>
      </div>
    );
  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={loading}
      className="flex flex-col gap-5"
    >
      <PasswordInput
        id="nova-senha"
        label="Nova senha"
        value={password}
        onChange={setPassword}
        disabled={loading}
      />
      <p className="-mt-3 mb-0 text-sm text-gray-500">
        Use ao menos 6 caracteres, como no cadastro.
      </p>
      <PasswordInput
        id="confirmar-senha"
        label="Confirmar nova senha"
        value={confirmation}
        onChange={setConfirmation}
        disabled={loading}
      />
      {error && (
        <div role="alert" className="text-center">
          <p className="mb-2 font-semibold text-red-600">{error}</p>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[#5141d9]"
          >
            Solicitar novo link
          </Link>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full font-semibold"
      >
        {loading ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <AuthCard
      title="Redefinir senha"
      description="Crie sua nova senha e repita abaixo para confirmar."
    >
      <Suspense
        fallback={
          <p role="status" className="text-center">
            Carregando...
          </p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
