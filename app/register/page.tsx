"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import logo from "@/public/logoCreatePag.png";
import Link from "next/link";
import eyesOn from "@/public/eyesOn.svg";
import eyesOff from "@/public/eyesOff.svg";
import { apiFetch, ApiError } from "@/lib/api";
import Image from "next/image";

function maskCNPJ(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskTelefone(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

type FormState = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  CNPJ: string;
};

type FormResponse = {
  success: true;
  email: string;
  expiresIn: number;
  devToken?: string;
};

export default function CreateCount() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    CNPJ: "",
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!form.nome.trim()) return "O nome da empresa é obrigatório!";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Informe um email válido!";
    if (form.senha.length < 6) return "A senha deve ter ao menos 6 caracteres!";
    if (form.telefone.replace(/\D/g, "").length < 10)
      return "Informe um telefone válido!";
    if (form.CNPJ.replace(/\D/g, "").length !== 14)
      return "Informe um CNPJ válido!";
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
      const data = await apiFetch<FormResponse>("/user_pending", {
        method: "POST",
        body: JSON.stringify(form),
      });

      sessionStorage.setItem("registerEmail", data.email);

      router.push("/token");
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir o cadastro. Tente novamente.",
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
          loading="eager"
          alt=""
          className="hidden h-auto w-1/2 max-w-150 object-contain lg:block"
        />

        <div className="flex w-full max-w-[620px] flex-col gap-5 rounded-3xl border border-white bg-white/90 p-5 shadow-[0_24px_80px_rgba(42,38,100,0.12)] backdrop-blur sm:p-9">
          <div className="mb-1 text-center">
            <p className="mb-2 text-sm font-bold tracking-[0.2em] text-[#6754d9]">
              QUANTYUM
            </p>
            <h1 className="text-center text-3xl sm:text-4xl">Criar conta</h1>
          </div>
          <p className="text-center text-sm text-gray-500 sm:text-base">
            Antes de continuar, confirme seu email para receber o token de
            ativação
          </p>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between mx-2">
              <p className="text-lg font-semibold sm:text-xl">Passo 1</p>
              <p className="text-lg font-semibold text-gray-400 sm:text-xl">
                Passo 2
              </p>
            </div>
            <div className="w-full h-5 rounded-[20px] bg-gra">
              <div
                className="h-5 rounded-[20px] bg-linear-to-r from-[#2D7CFF] via-[#4F55FF] to-[#7A1EFF]"
                style={{ width: "50%" }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h3>Nome da empresa</h3>
              <input
                type="text"
                name="nome"
                autoComplete="organization"
                className="w-full pl-2"
                value={form.nome}
                onChange={(e) => updateField("nome", e.target.value)}
              />
            </div>
            <div>
              <h3>Email</h3>
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="w-full pl-2"
                placeholder="nome@provedor.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="w-full relative">
                <h3>Senha</h3>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  autoComplete="new-password"
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

              <div className="w-full">
                <h3>Telefone</h3>
                <input
                  type="text"
                  name="telefone"
                  autoComplete="tel"
                  className="w-full pl-2"
                  placeholder="(xx) xxxxx-xxxx"
                  value={form.telefone}
                  onChange={(e) =>
                    updateField("telefone", maskTelefone(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="w-full">
                <h3>CNPJ</h3>
                <input
                  type="text"
                  name="CNPJ"
                  autoComplete="organization"
                  className="w-full pl-2"
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  value={form.CNPJ}
                  onChange={(e) =>
                    updateField("CNPJ", maskCNPJ(e.target.value))
                  }
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full font-semibold sm:h-14"
              >
                {loading ? "Enviando..." : "Enviar token"}
              </button>
            </div>

            {erro && (
              <p className="text-red-600 font-semibold text-center">{erro}</p>
            )}
          </form>

          <Link href="/" className="mx-auto mt-1 flex gap-1 text-sm">
            <p className="mb-0 text-gray-500">Já tem uma conta?</p>
            <span className="font-semibold text-[#5141d9]">Entrar</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
