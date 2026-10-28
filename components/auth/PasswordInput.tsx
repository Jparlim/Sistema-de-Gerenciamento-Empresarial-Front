"use client";

import { useState } from "react";
import Image from "next/image";
import eyesOn from "@/public/eyesOn.svg";
import eyesOff from "@/public/eyesOff.svg";

export default function PasswordInput({ id, label, value, onChange, disabled }: {
  id: string; label: string; value: string; onChange: (value: string) => void; disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-base font-medium text-[#45465a]">{label}</label>
      <div className="relative">
        <input id={id} name={id} type={visible ? "text" : "password"} autoComplete="new-password" required minLength={6} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className="w-full pl-3 pr-14" />
        <button type="button" disabled={disabled} onClick={() => setVisible((previous) => !previous)} aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`} aria-pressed={visible} className="absolute inset-y-1 right-1 w-11 shadow-none!" style={{ background: "transparent", backgroundImage: "none" }}>
          <Image src={visible ? eyesOn : eyesOff} width={25} height={25} alt="" />
        </button>
      </div>
    </div>
  );
}
