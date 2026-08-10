"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "sidebarOpen";

export default function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setOpen(stored === "true");
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, String(open));
  }, [open, ready]);

  return (
    <div className="w-full min-h-screen flex items-stretch bg-gray-50">
      <Sidebar open={open} onToggle={() => setOpen((v) => !v)} />
      <main className="flex-1 min-w-0 p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
