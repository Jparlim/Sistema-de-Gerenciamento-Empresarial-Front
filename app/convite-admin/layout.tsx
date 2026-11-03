import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Convite administrativo | Quantyum",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function InviteLayout({ children }: { children: ReactNode }) {
  return children;
}
