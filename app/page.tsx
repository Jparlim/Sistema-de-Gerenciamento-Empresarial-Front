import logo from "@/public/Gemini_Generated_Image_anmqoianmqoianmq.png";
import lock from "@/public/Lock.png";

interface UserData {
  nome: string;
  email: string;
  senha: string;
  CNPJ: string;
  telefone: string;
}

export default async function CreateCount() {
  // await fetch("http://localhost:8888/user_pending", {
  //   method: "POST",
  //   headers: {
  //     "content-Type": "application/json",
  //   },
  //   body: JSON.stringify(),
  // });

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
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (Erro) {
      throw new Error("dados não enviados para o backend");
    }

    alert("empresa cadastrada com sucesso!");
  }

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
            <div className={`w-[${teste}%] h-5 rounded-[20px] bg-blu`} />
          </div>
        </div>

        <form action={testeFunction} className="flex flex-col gap-4">
          <div className="">
            <h3>Nome da empresa</h3>
            <input
              type="text"
              placeholder=""
              name="nome"
              className="w-full py-2 pl-2"
            />
          </div>
          <div>
            <h3>Email</h3>
            <input type="text" name="email" className="w-full py-2 pl-2" />
          </div>
          <div className="relative">
            <h3>Senha</h3>
            <input type="text" name="senha" className="w-full py-2 pl-11" />
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
            <input type="text" name="telefone" className="w-full py-2 pl-2" />
          </div>
          <div className="flex justify-between items-end">
            <div className="w-[60%]">
              <h3>CNPJ</h3>
              <input type="text" name="CNPJ" className="w-full py-2 pl-2" />
            </div>
            <button type="submit" className="w-[30%] h-12">
              Enviar token
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
