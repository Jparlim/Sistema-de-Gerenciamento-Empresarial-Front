import dash from "../../public/dashboard.png";
import home from "../../public/Home.png";
import tool from "../../public/Tool.png";
import users from "../../public/Users.png";
import calendar from "../../public/Calendar.png";
import clipboard from "../../public/Clipboard.png";
import bar from "../../public/Bar.png";

export default function Dashboard() {
  return (
    <aside className="h-full w-60 border-r border-black px-6 py-8 flex flex-col">
      <div className="flex items-center gap-6 mb-10">
        <button className="cursor-pointer transition hover:scale-105 active:scale-95">
          <img src={dash.src} alt="Tela inicial" width={34} height={30} />
        </button>

        <h1 className="text-[28px] font-semibold">Dashboard</h1>
      </div>

      <nav className="flex-1">
        <ul className="flex flex-col gap-10">
          <li className="flex items-center py-3 pl-1 rounded-[10px] gap-5 cursor-pointer transition hover:transition-all">
            <img src={home.src} width={28} height={28} alt="" />
            <span className="text-[18px]">Tela inicial</span>
          </li>

          <li className="flex items-center gap-5 cursor-pointer transition hover:text-blue-600">
            <img src={clipboard.src} width={28} height={28} alt="" />
            <span className="text-[18px]">Estoque</span>
          </li>

          <li className="flex items-center gap-5 cursor-pointer transition hover:text-blue-600">
            <img src={tool.src} width={28} height={28} alt="" />
            <span className="text-[18px]">Configuração IA</span>
          </li>

          <li className="flex items-center gap-5 cursor-pointer transition hover:text-blue-600">
            <img src={users.src} width={28} height={28} alt="" />
            <span className="text-[18px]">Clientes</span>
          </li>

          <li className="flex items-center gap-5 cursor-pointer transition hover:text-blue-600">
            <img src={bar.src} width={28} height={28} alt="" />
            <span className="text-[18px]">Financeiro</span>
          </li>

          <li className="flex items-center gap-5 cursor-pointer transition hover:text-blue-600">
            <img src={calendar.src} width={28} height={28} alt="" />
            <span className="text-[18px]">Agenda</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
