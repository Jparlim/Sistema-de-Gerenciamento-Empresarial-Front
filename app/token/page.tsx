"use client";

import Link from "next/link";

import OtpInput from "@/components/OtpInput";
import logo2 from "@/public/ChatGPT Image 23 de jul. de 2026, 10_46_56.png";

export default function PageVerificacao() {
  const handleCodeComplete = (codigoCompleto: string) => {
    console.log("Código digitado:", codigoCompleto);
  };

  return (
    <main className="w-full flex justify-center gap-8">
      {/* <img src={logo2.src} width={800} alt="" /> */}
      <div className="bg-white p-8 w-full">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Verifique seu e-mail
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enviamos um código de ativação para <span>{}</span>. Digite o código
          abaixo para confirmar sua conta.
        </p>

        <OtpInput onComplete={handleCodeComplete} />

        <div>
          <img src="https://picsum.photos/200/300" alt="" />
          <p>Por segurança, este código expira em 15 minutos.</p>
          <p>Não compartilhe este código com ninguém.</p>
        </div>

        <button>Verificar código</button>

        <p>
          Não recebeu o código? <span>Reenviar código</span>
        </p>

        <Link rel="stylesheet" href="/">
          <span> -- voltar para o login</span>
        </Link>
      </div>
    </main>
  );
}
