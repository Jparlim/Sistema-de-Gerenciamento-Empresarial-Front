import logo from "@/public/logoCreatePage.png";
import lock from "@/public/Lock.png";
import Link from "next/link";

interface UserData {
  nome: string;
  email: string;
  senha: string;
  CNPJ: string;
  telefone: string;
}

export default function CreateCount() {
  const teste = 50;
  const teste2 = true;

  async function testeFunction(formData: FormData) {
    "use server";
    const data = {
      nome: formData.get("nome"),
      email: formData.get("email"),
      senha: formData.get("senha"),
      telefone: formData.get("telefone"),
      CNPJ: formData.get("CNPJ"),
    };

    try {
      await fetch("http://localhost:8888/user_pending", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (Erro) {
      throw new Error("dados não enviados para o backend");
    }
  }

  return (
    <main className="w-full flex justify-center gap-8">
      <img src={logo.src} width={800} className="" />

      <div className="w-4/12 flex flex-col gap-6 mt-12">
        <h1 className="text-center">Criar conta</h1>
        <p className="text-center text-gray-500">
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
            <div
              className={`w-[${teste}%] h-5 rounded-[20px] bg-gradient-to-r from-[#2D7CFF] via-[#4F55FF] to-[#7A1EFF]`}
            />
          </div>
        </div>

        <form action={testeFunction} className="flex flex-col gap-4">
          <div className="">
            <h3>Nome da empresa</h3>
            <input
              type="text"
              placeholder=""
              name="nome"
              className="w-full pl-2"
            />
          </div>
          <div>
            <h3>Email</h3>
            <input
              type="text"
              name="email"
              className="w-full pl-2"
              placeholder="nome@provedor.com"
            />
          </div>

          <div className="flex gap-6">
            <div className="w-full relative">
              <h3>Senha</h3>
              <input
                type="text"
                name="senha"
                className="w-full pl-11"
                placeholder=""
              />
              <img
                src={lock.src}
                width={25}
                height={25}
                className="absolute top-[50px] left-3 cursor-pointer"
                // onClick={}
              />
            </div>

            <div className="w-full">
              <h3>Telefone</h3>
              <input
                type="text"
                name="telefone"
                className="w-full pl-2"
                placeholder="xx (xx) xxxx-xxxx"
              />
            </div>
          </div>
          <div className="flex justify-between items-end gap-6">
            <div className="w-[50%]">
              <h3>CNPJ</h3>
              <input
                type="text"
                name="CNPJ"
                className="w-full pl-2"
                placeholder="XX.XXX.XXX/XXXX-XX"
              />
            </div>
            <button type="submit" className="w-[50%] h-14">
              Enviar token
            </button>
          </div>
        </form>

        <Link href="/login" className="m-auto">
          <span>-- Voltar para o login</span>
        </Link>
      </div>
    </main>
  );
}
