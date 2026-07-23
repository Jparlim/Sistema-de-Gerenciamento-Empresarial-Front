"use client";

import {
  useState,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent,
} from "react";

interface OtpInputProps {
  length?: number;
  onComplete?: (code: string) => void;
}

export default function OtpInput({ length = 6, onComplete }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const combinedCode = newOtp.join("");
    if (combinedCode.length === length && onComplete) {
      onComplete(combinedCode);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, length);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, idx) => {
      newOtp[idx] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col items-center gap-2"
    >
      <label className="sr-only" htmlFor="otp-input-0">
        Código de verificação de {length} dígitos
      </label>

      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={`otp-input-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-20 h-15 mt-10 text-center text-xl font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-1">
        O código possui {length} dígitos
      </p>
    </form>
  );
}
