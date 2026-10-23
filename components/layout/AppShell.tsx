"use client";

import { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "sidebarOpen";

export default function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;

    // Synchronize the saved layout before paint to prevent a sidebar width flash.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(isMobile ? false : stored !== null ? stored === "true" : true);
    const frame = window.requestAnimationFrame(() => setReady(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, String(open));
  }, [open, ready]);

  return (
    <div className="w-full min-h-screen bg-[#f7f8fc] lg:flex lg:items-start">
      {ready && open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 rounded-none! p-0! lg:hidden"
          style={{
            minHeight: 0,
            background: "transparent",
            backgroundImage: "none",
            boxShadow: "none",
            filter: "none",
            transform: "none",
          }}
        />
      )}
      <Sidebar
        open={open}
        mobileOpen={ready && open}
        transitionsEnabled={ready}
        onToggle={() => setOpen((v) => !v)}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e9eaf2] bg-white/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="h-10 w-10 rounded-xl! bg-[#f2efff]! text-[#5141d9]! shadow-none!"
            style={{ background: "#f2efff", backgroundImage: "none" }}
          >
            <span className="flex flex-col gap-1">
              <span className="h-0.5 w-4 rounded bg-current" />
              <span className="h-0.5 w-4 rounded bg-current" />
              <span className="h-0.5 w-4 rounded bg-current" />
            </span>
          </button>
          <span className="bg-[linear-gradient(110deg,#2d7cff,#7a1eff)] bg-clip-text text-lg font-bold tracking-tight text-transparent">
            Quantyum
          </span>
        </header>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
