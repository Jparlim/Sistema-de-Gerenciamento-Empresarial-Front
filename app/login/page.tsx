"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import logo from "@/public/logoCreatePag.png";
import eyesOn from "@/public/eyesOn.svg";
import eyesOff from "@/public/eyesOff.svg";
import Link from "next/link";
import Image from "next/image";
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
    <main className="flex min-h-dvh w-full items-center justify-center bg-[radial-gradient(ellipse_at_top_left,#e8f0ff_0%,#f5f2ff_34%,#f7f8fc_72%)] px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-7xl items-center justify-center gap-10 lg:gap-16">
        <Image
          src={logo}
          width={900}
          height={900}
          alt=""
          className="hidden w-1/2 max-w-150 object-contain lg:block"
        />

        <div className="mt-0 flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-white bg-white/90 p-7 shadow-[0_24px_80px_rgba(42,38,100,0.12)] backdrop-blur sm:p-10 lg:max-w-136">
          <div className="mb-2 text-center">
            <p className="mb-2 text-sm font-bold tracking-[0.2em] text-[#6754d9]">
              QUANTYUM
            </p>
            <h1 className="text-center text-3xl sm:text-4xl">Entrar</h1>
          </div>
          <p className="text-center text-gray-500">
            Acesse sua conta para continuar
          </p>

          <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5">
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
              <Image
                src={mostrarSenha ? eyesOn : eyesOff}
                width={25}
                height={25}
                alt="mostrar senha"
                className="absolute top-11 left-3 cursor-pointer"
                onClick={() => setMostrarSenha((v) => !v)}
              />
            </div>

            <Link
              href="/forgot-password"
              className="-mt-2 min-h-0! self-end rounded-none! bg-transparent! p-0! text-sm! font-semibold! text-[#5141d9]! shadow-none! transition-colors hover:text-[#382ca5]!"
              style={{ background: "transparent", backgroundImage: "none" }}
            >
              Esqueceu a senha?
            </Link>

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

          <Link
            href="/register"
            className="mx-auto mt-1 flex flex-wrap justify-center gap-1 text-sm"
          >
            <p className="mb-0 text-gray-500">Não tem uma conta?</p>
            <span className="font-semibold text-[#5141d9]">Criar conta</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
