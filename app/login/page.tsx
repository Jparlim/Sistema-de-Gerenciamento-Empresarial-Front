"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import logo from "@/public/logoCreatePage.png";
import lock from "@/public/Lock.png";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { getIA } from "@/lib/ia";

type FormState = {
  email: string;
  senha: string;
};

type LoginResponse = {
  success: true;
  token: string;
  refreshToken: string;
};

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", senha: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Informe um email válido!";
    if (!form.senha) return "Informe sua senha!";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setErro(validationError);
      return;
    }

    setErro(null);
    setLoading(true);

    try {
      await apiFetch<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      try {
        const ia = await getIA();
        router.push(ia ? "/home" : "/configuracao-ia");
      } catch {
        router.push("/home");
      }
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full flex justify-center gap-8">
      <img src={logo.src} width={800} alt="" />

      <div className="w-4/12 flex flex-col gap-6 mt-14">
        <h1 className="text-center">Entrar</h1>
        <p className="text-center text-gray-500">
          Acesse sua conta para continuar
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <h3>Email</h3>
            <input
              type="email"
              name="email"
              className="w-full pl-2"
              placeholder="nome@provedor.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="w-full relative">
            <h3>Senha</h3>
            <input
              type={mostrarSenha ? "text" : "password"}
              name="senha"
              className="w-full pl-11"
              value={form.senha}
              onChange={(e) => updateField("senha", e.target.value)}
            />
            <img
              src={lock.src}
              width={25}
              height={25}
              alt="mostrar senha"
              className="absolute top-[50px] left-3 cursor-pointer"
              onClick={() => setMostrarSenha((v) => !v)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-2xs h-14 mx-auto my-8"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {erro && (
            <p className="text-red-600 font-semibold text-center">{erro}</p>
          )}
        </form>

        <Link href="/register" className="mx-auto my-10">
          <span>Não tem uma conta? Criar conta</span>
        </Link>
      </div>
    </main>
  );
}
