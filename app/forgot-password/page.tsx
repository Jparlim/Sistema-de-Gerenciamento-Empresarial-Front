"use client";

import { useState, type FormEvent } from "react";
import AuthCard from "@/components/auth/AuthCard";
import { ApiError } from "@/lib/api";
import { requestPasswordReset } from "@/lib/password";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Informe um email válido.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar o link. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Esqueci minha senha"
      description="Informe o email da sua conta para receber um link de redefinição de senha."
    >
      {sent ? (
        <div
          role="status"
          className="rounded-xl border border-[#e9eaf2] bg-[#f5f4ff] p-5 text-center"
        >
          <p className="mb-2 font-semibold text-[#5141d9]">Confira seu email</p>
          <p className="mb-0 wrap-break-word text-gray-600">
            Enviamos um link para {email.trim()}. Acesse sua caixa de entrada e
            verifique também a pasta de spam.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          aria-busy={loading}
          className="flex flex-col gap-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-base font-medium text-[#45465a]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              placeholder="nome@provedor.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3"
            />
          </div>
          {error && (
            <p
              role="alert"
              className="mb-0 text-center font-semibold text-red-600"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full font-semibold"
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
