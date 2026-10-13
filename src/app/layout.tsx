import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "../components/product/shell";
import { SessionProvider } from "../components/product/session";
import { abcApparelDataset } from "../domain/demo/abc-apparel";
import "./globals.css";

export const metadata: Metadata = { title: "BukuLokal Ops Copilot", description: "Evidence-grounded operational priorities with human-controlled action review." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><SessionProvider organizationId={abcApparelDataset.organization.id}><AppShell>{children}</AppShell></SessionProvider></body></html>;
}
