"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import logo from "@/public/logoCreatePage.png";
import lock from "@/public/Lock.png";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";

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
      if (data.devToken) {
        console.info("[dev] código de verificação:", data.devToken);
      }

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
    <main className="w-full flex justify-center gap-8">
      <img src={logo.src} width={800} alt="" />

      <div className="w-4/12 flex flex-col gap-6 mt-12">
        <h1 className="text-center">Criar conta</h1>
        <p className="text-center text-gray-500">
          Antes de continuar, confirme seu email para receber o token de
          ativação
        </p>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between mx-2">
            <p className="text-[26px] font-semibold">Passo 1</p>
            <p className="text-[26px] text-gray-400 font-semibold">Passo 2</p>
          </div>
          <div className="w-full h-5 rounded-[20px] bg-gra">
            <div
              className="h-5 rounded-[20px] bg-gradient-to-r from-[#2D7CFF] via-[#4F55FF] to-[#7A1EFF]"
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
              className="w-full pl-2"
              placeholder="nome@provedor.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="flex gap-6">
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

            <div className="w-full">
              <h3>Telefone</h3>
              <input
                type="text"
                name="telefone"
                className="w-full pl-2"
                placeholder="(xx) xxxxx-xxxx"
                value={form.telefone}
                onChange={(e) =>
                  updateField("telefone", maskTelefone(e.target.value))
                }
              />
            </div>
          </div>
          <div className="flex justify-between items-end gap-6">
            <div className="w-[50%]">
              <h3>CNPJ</h3>
              <input
                type="text"
                name="CNPJ"
                className="w-full pl-2"
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={form.CNPJ}
                onChange={(e) => updateField("CNPJ", maskCNPJ(e.target.value))}
              />
            </div>
            <button type="submit" disabled={loading} className="w-[50%] h-14">
              {loading ? "Enviando..." : "Enviar token"}
            </button>
          </div>

          {erro && (
            <p className="text-red-600 font-semibold text-center">{erro}</p>
          )}
        </form>

        <Link href="/" className="m-auto">
          <span>-- Voltar para o login</span>
        </Link>
      </div>
    </main>
  );
}
