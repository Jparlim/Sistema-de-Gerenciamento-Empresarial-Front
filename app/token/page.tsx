"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OtpInput from "@/components/OtpInput";
import logoToken from "@/public/logoTokenPag.png";
import postal from "@/public/postal.png";
import lock from "@/public/Lock.png";
import { apiFetch, ApiError } from "@/lib/api";
import Image from "next/image";

const RESEND_COOLDOWN = 60;

export default function PageVerificacao() {
  const [email, setEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [reenviando, setReenviando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    // sessionStorage só existe no client; ler aqui (e não em um initializer de
    // useState) evita mismatch de hidratação entre o HTML do server e o client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(sessionStorage.getItem("registerEmail"));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0 || reenviando) return;

    setReenviando(true);
    setMensagem(null);

    try {
      const data = await apiFetch<{
        success: true;
        email: string;
        devToken?: string;
      }>("/user_pending/resend", { method: "POST" });

      if (data.devToken) {
        console.info("[dev] código de verificação:", data.devToken);
      }

      setMensagem("Um novo código foi enviado.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setMensagem(
        err instanceof ApiError
          ? err.message
          : "Não foi possível reenviar o código. Tente novamente.",
      );
    } finally {
      setReenviando(false);
    }
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-[radial-gradient(ellipse_at_top_left,#e8f0ff_0%,#f5f2ff_34%,#f7f8fc_72%)] px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-7xl items-center justify-center gap-10 lg:gap-16">
        <Image
          src={logoToken}
          width={1000}
          alt=""
          className="hidden w-1/2 max-w-150 object-contain lg:block"
        />
        <div className="flex w-full max-w-[560px] flex-col items-center gap-3 rounded-3xl border border-white bg-white/90 p-5 shadow-[0_24px_80px_rgba(42,38,100,0.12)] backdrop-blur sm:p-9">
          <Image
            src={postal.src}
            width={100}
            alt=""
            className="mb-1 rounded-full bg-[#f1eeff] p-3"
          />
          <h1 className="mb-1 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Verifique seu e-mail
          </h1>
          <p className="mb-3 text-center text-sm text-gray-500 sm:text-base">
            Enviamos um código de ativação{" "}
            {email ? (
              <>
                para{" "}
                <span className="font-semibold text-gray-700">{email}</span>
              </>
            ) : (
              "para o seu email"
            )}
            . Digite o código abaixo para confirmar sua conta.
          </p>

          <div className="flex flex-col w-full gap-1">
            <div className="flex justify-between mx-2">
              <p className="text-lg font-semibold text-gray-400 sm:text-xl">
                Passo 1
              </p>
              <p className="text-lg font-semibold sm:text-xl">Passo 2</p>
            </div>
            <div className="w-full h-5 rounded-[20px] bg-gra">
              <div className="w-full h-5 rounded-[20px] bg-linear-to-r from-[#2D7CFF] via-[#4F55FF] to-[#7A1EFF]" />
            </div>
          </div>

          <OtpInput />

          <div className="mt-3 flex w-full items-center gap-4 rounded-2xl border border-[#e4ddff] bg-[#f6f3ff] px-4 py-4 sm:px-5">
            <Image
              src={lock.src}
              width={32}
              height={32}
              alt=""
              className="shrink-0"
            />
            <label>
              <span className="font-semibold text-[#5141d9]">
                Por segurança, este código expira em 15 minutos.
              </span>
              <p>Não compartilhe este código com ninguém.</p>
            </label>
          </div>

          <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-center text-sm">
            Não recebeu o código?
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || reenviando}
              className="cursor-pointer bg-transparent font-semibold text-[#5141d9] shadow-none disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {cooldown > 0
                ? `Reenviar código (${cooldown}s)`
                : reenviando
                  ? "Enviando..."
                  : "Reenviar código"}
            </button>
          </p>

          {mensagem && (
            <p className="text-sm text-gray-500 text-center">{mensagem}</p>
          )}

          <Link href="/" className="flex">
            <span className="mt-3 text-sm font-semibold text-[#5141d9]">
              Voltar para o login
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
