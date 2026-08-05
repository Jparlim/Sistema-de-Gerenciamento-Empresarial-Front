"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OtpInput from "@/components/OtpInput";
import logo2 from "@/public/logoTokenPage.png";
import postal from "@/public/postal.png";
import lock from "@/public/Lock.png";
import { apiFetch, ApiError } from "@/lib/api";

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
      const data = await apiFetch<{ success: true; email: string; devToken?: string }>(
        "/user_pending/resend",
        { method: "POST" },
      );

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
    <main className="flex justify-start -ml-50">
      <img src={logo2.src} width={1000} alt="" />
      <div className="flex flex-col items-center bg-white gap-2">
        <img
          src={postal.src}
          width={100}
          alt=""
          className="bg-blue-50 rounded-full"
        />
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Verifique seu e-mail
        </h1>
        <p className=" text-gray-500 text-center mb-6">
          Enviamos um código de ativação{" "}
          {email ? (
            <>
              para <span className="font-semibold text-gray-700">{email}</span>
            </>
          ) : (
            "para o seu email"
          )}
          . Digite o código abaixo para confirmar sua conta.
        </p>

        <div className="flex flex-col w-full gap-1">
          <div className="flex justify-between mx-2">
            <p className="text-[26px] text-gray-400 font-semibold">Passo 1</p>
            <p className="text-[26px] font-semibold">Passo 2</p>
          </div>
          <div className="w-full h-5 rounded-[20px] bg-gra">
            <div className="w-full h-5 rounded-[20px] bg-gradient-to-r from-[#2D7CFF] via-[#4F55FF] to-[#7A1EFF]" />
          </div>
        </div>

        <OtpInput />

        <div className="flex justify-center items-center mt-18 gap-5 px-6 bg-blue-50 rounded-2xl h-26">
          <img src={lock.src} width={40} height={40} alt="" />
          <label>
            <span className="text-blue-700 font-semibold">
              Por segurança, este código expira em 15 minutos.
            </span>
            <p>Não compartilhe este código com ninguém.</p>
          </label>
        </div>

        <p className="flex gap-2 mt-6 items-center">
          Não recebeu o código?
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || reenviando}
            className="text-blue-700 font-semibold cursor-pointer bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
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
          <span className="mt-6">-- voltar para o login</span>
        </Link>
      </div>
    </main>
  );
}
