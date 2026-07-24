"use client";

import Link from "next/link";
import OtpInput from "@/components/OtpInput";
import logo2 from "@/public/logoTokenPage.png";
import postal from "@/public/postal.png";

export default function PageVerificacao() {
  const teste = 50;
  const teste2 = true;

  const handleCodeComplete = (codigoCompleto: string) => {
    console.log("Código digitado:", codigoCompleto);
  };

  return (
    <main className="flex justify-start -ml-50">
      <img src={logo2.src} width={1000} className="" />
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
          Enviamos um código de ativação para <span>{}</span>. Digite o código
          abaixo para confirmar sua conta.
        </p>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between mx-2">
            <p className="text-[26px] font-semibold">Passo 1</p>
            {!teste2 ? (
              <p className="text-[26px] font-semibold">Passo 2</p>
            ) : (
              <p className="text-[26px] text-gray-400 font-semibold">Passo 2</p>
            )}
          </div>
          <div className={`w-full h-5 rounded-[20px] bg-gra`}>
            <div
              className={`w-[${teste}%] h-5 rounded-[20px] bg-gradient-to-r from-[#2D7CFF] via-[#4F55FF] to-[#7A1EFF]`}
            />
          </div>
        </div>

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

        <button className="w-[50%] h-15 mt-12">Verificar código</button>

        <p className="flex gap-2 mt-6">
          Não recebeu o código?
          <span className="text-blue-700 font-semibold cursor-pointer">
            Reenviar código
          </span>
        </p>

        <Link rel="stylesheet" href="/" className="flex ">
          <span className="mt-6">-- voltar para o login</span>
        </Link>
      </div>
    </main>
  );
}
