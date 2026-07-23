"use client";

import Link from "next/link";
import OtpInput from "@/components/OtpInput";
import logo2 from "@/public/logoTokenPage.png";
import postal from "@/public/ChatGPT Image Jul 23, 2026, 04_45_51 PM.png";

export default function PageVerificacao() {
  const handleCodeComplete = (codigoCompleto: string) => {
    console.log("Código digitado:", codigoCompleto);
  };

  return (
    <main className="flex justify-start -ml-50">
      <img src={logo2.src} width={1000} alt="" className="" />
      <div className="flex flex-col items-center bg-white ">
        <img
          src={postal.src}
          width={80}
          alt=""
          className="bg-blue-50 rounded-full"
        />
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Verifique seu e-mail
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enviamos um código de ativação para <span>{}</span>. Digite o código
          abaixo para confirmar sua conta.
        </p>

        <OtpInput onComplete={handleCodeComplete} />

        <div className="flex justify-center items-center mt-18 gap-5 px-6 bg-blue-50 rounded-2xl h-26">
          <img
            src="https://picsum.photos/200/300"
            width={40}
            height={40}
            alt=""
          />
          <label>
            <span className="text-blue-700 font-semibold">
              Por segurança, este código expira em 15 minutos.
            </span>
            <p>Não compartilhe este código com ninguém.</p>
          </label>
        </div>

        <button className="w-[50%] h-12 mt-12">Verificar código</button>

        <p className="flex gap-2 mt-6">
          Não recebeu o código?
          <span className="text-blue-700 font-semibold cursor-pointer">
            Reenviar código
          </span>
        </p>

        <Link rel="stylesheet" href="/" className="flex ">
          <span className="text-blue-700 font-semibold cursor-pointer mt-6">
            -- voltar para o login
          </span>
        </Link>
      </div>
    </main>
  );
}
