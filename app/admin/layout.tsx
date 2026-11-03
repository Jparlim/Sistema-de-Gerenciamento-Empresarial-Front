import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminSession from "@/components/admin/AdminSession";
import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Administração | Quantyum", template: "%s | Quantyum Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminSession><AdminShell>{children}</AdminShell></AdminSession>;
}
