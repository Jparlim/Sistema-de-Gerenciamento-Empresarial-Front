"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import eyesOn from "@/public/eyesOn.svg";
import eyesOff from "@/public/eyesOff.svg";
import { apiFetch, ApiError } from "@/lib/api";
import Image from "next/image";
import logo from "@/public/Logo.png";

type FormState = {
  email: string;
  senha: string;
};

type LoginResponse = {
  success: true;
  token: string;
  refreshToken: string;
};

export default function LoginAdm() {
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
      await apiFetch<LoginResponse>("/login/adm", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/home");
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
    <main className="flex min-h-dvh w-full items-center justify-center bg-[radial-gradient(ellipse_at_top_left,#e8f0ff_0%,#f5f2ff_34%,#f7f8fc_72%)] px-4 py-8 sm:px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white bg-white/90 p-8 shadow-[0_24px_80px_rgba(42,38,100,0.12)] backdrop-blur sm:p-12">
        <Image
          src={logo}
          width={900}
          height={900}
          alt=""
          className="mx-auto mb-5 h-32 w-32 object-contain sm:h-40 sm:w-40"
        />
        <p className="mb-4 text-center text-sm font-bold tracking-[0.16em] text-[#6754d9] sm:tracking-[0.2em]">
          QUANTYUM · ADMIN
        </p>
        <h1 className="text-center text-3xl sm:text-4xl">Entrar</h1>
        <p className="mt-2 text-center leading-relaxed text-gray-500">
          Acesse sua conta para continuar
        </p>

        <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-7">
          <div>
            <h3>Email</h3>
            <input
              type="email"
              name="email"
              className="w-full pl-2"
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
            <Image
              src={mostrarSenha ? eyesOn : eyesOff}
              width={25}
              height={25}
              alt="mostrar senha"
              className="absolute top-11 left-3 cursor-pointer"
              onClick={() => setMostrarSenha((v) => !v)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full font-semibold"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {erro && (
            <p className="text-red-600 font-semibold text-center">{erro}</p>
          )}
        </form>
      </div>
    </main>
  );
}
