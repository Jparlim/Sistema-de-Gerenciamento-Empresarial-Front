import logo from "@/public/Logo.png";
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

export default function CreateCount() {
  const teste = 2 * 1;
  const teste2 = true;

  return (
    <main>
      <div className="flex flex-col gap-4">
        <h1>Criar conta</h1>
        <p className="text-[20px]">
          Antes de continuar, confirme seu email para receber o token de
          ativação
        </p>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between mx-2">
            <p className="text-[26px] font-semibold">Passo 1</p>
            {!teste ? (
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
          <div>
            <h3>Nome da empresa</h3>
            <input type="text" placeholder="" />
          </div>
          <div>
            <h3>Email</h3>
            <input type="text" placeholder="exemplo@gmail.com" />
          </div>
          <div>
            <h3>Nome da empresa</h3>
            <input type="text">
              <img src={lock.src} alt="" />
            </input>
          </div>
          <div>
            <h3>Nome da empresa</h3>
            <input type="text" />
          </div>
          <div>
            <h3>Nome da empresa</h3>
            <input type="text" />
          </div>
          <button>Enviar token</button>
        </div>
      </div>
    </main>
  );
}
