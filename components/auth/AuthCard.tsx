import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logoCreatePag.png";

export default function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-[radial-gradient(ellipse_at_top_left,#e8f0ff_0%,#f5f2ff_34%,#f7f8fc_72%)] px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-7xl items-center justify-center gap-10 lg:gap-16">
        <Image src={logo} width={900} height={900} alt="" className="hidden h-auto w-1/2 max-w-150 object-contain lg:block" />
        <div className="flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-white bg-white/90 p-7 shadow-[0_24px_80px_rgba(42,38,100,0.12)] backdrop-blur sm:p-10 lg:max-w-136">
          <div className="text-center">
            <p className="mb-2 text-sm font-bold tracking-[0.2em] text-[#6754d9]">QUANTYUM</p>
            <h1 className="text-3xl sm:text-4xl">{title}</h1>
          </div>
          <p className="mb-0 text-center text-gray-500">{description}</p>
          {children}
          <Link href="/login" className="mx-auto text-sm font-semibold text-[#5141d9] hover:text-[#382ca5]">Voltar para entrar</Link>
        </div>
      </div>
    </main>
  );
}
