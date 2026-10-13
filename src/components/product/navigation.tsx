"use client";
import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";
// Optional navigation callback lets integration tests exercise links with a memory router.
export const NavigationContext = createContext<((href: string) => void) | null>(null);
export function ProductLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const navigate = useContext(NavigationContext);
  return <Link href={href} className={className} onClick={(event) => { if (navigate) { event.preventDefault(); navigate(href); } }}>{children}</Link>;
}
