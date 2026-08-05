"use client";

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, ClipboardEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

interface OtpInputProps {
  length?: number;
}

type VerifyResponse = { success: true; token: string; refreshToken: string };

export default function OtpInput({ length = 6 }: OtpInputProps) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otp.every((digit) => digit) && !loading) {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split("").forEach((char, idx) => { newOtp[idx] = char; });
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  function clearOtp() {
    setOtp(Array(length).fill(""));
    inputRefs.current[0]?.focus();
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  async function submit() {
    const code = otp.join("");
    if (code.length < length) {
      setErro(`Preencha todos os ${length} dígitos do código.`);
      triggerShake();
      return;
    }

    setErro(null);
    setLoading(true);

    try {
      await apiFetch<VerifyResponse>("/user", {
        method: "POST",
        body: JSON.stringify({ token: code }),
      });

      router.push("/home");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/register");
        return;
      }

      setErro(err instanceof ApiError ? err.message : "Não foi possível verificar o código. Tente novamente.");
      triggerShake();
      clearOtp();
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
      <label className="sr-only" htmlFor="otp-input-0">
        Código de verificação de {length} dígitos
      </label>

      <div className={`flex gap-2 justify-center ${shake ? "shake" : ""}`}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            id={`otp-input-${index}`}
            type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
            value={digit}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            disabled={loading}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-14 h-14 mt-10 text-center text-xl font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-1">O código possui {length} dígitos</p>

      {erro && <p className="text-red-600 font-semibold text-sm text-center">{erro}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-[50%] h-12 mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-95"
      >
        {loading ? "Verificando..." : "Verificar código"}
      </button>
    </form>
  );
}
