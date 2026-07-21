import logo from "@/public/Gemini_Generated_Image_anmqoianmqoianmq.png";
import lock from "@/public/Lock.png";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quantyum - Gerencia | Analise | Evolua",
  description: "Todos os dados da sua empresa em um só lugar",
  openGraph: {
    title: "Quantyum - Sistema para sua empresa",
    description: "Todos os dados da sua empresa em um só lugar",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// ("use client");
// ("use server");

export default function CreateCount() {
  const teste = 2 * 1;
  const teste2 = true;

  return (
    <main className="w-full flex justify-center gap-8">
      <img src={logo.src} width={800} />
      <div className="flex flex-col mt-10 gap-4">
        <h1>Criar conta</h1>
        <p className="text-[20px]">
          Antes de continuar, confirme seu email para receber o token de
          ativação
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
            <div className={`w-[${teste}px] h-5 rounded-[20px] bg-blu`} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="">
            <h3>Nome da empresa</h3>
            <input type="text" placeholder="" className="w-full py-2 pl-2" />
          </div>
          <div>
            <h3>Email</h3>
            <input type="text" className="w-full py-2 pl-2" />
          </div>
          <div className="relative">
            <h3>Senha</h3>
            <input type="text" className="w-full py-2 pl-11" />
            <img
              src={lock.src}
              width={25}
              height={25}
              className="absolute top-[46px] left-3 cursor-pointer"
              // onClick={}
            />
          </div>
          <div>
            <h3>Telefone</h3>
            <input type="text" className="w-full py-2 pl-2" />
          </div>
          <div className="flex justify-between items-end">
            <div className="w-[60%]">
              <h3>CNPJ</h3>
              <input type="text" className="w-full py-2 pl-2" />
            </div>
            <button className="w-[30%] h-12">Enviar token</button>
          </div>
        </div>
      </div>
    </main>
  );
}
