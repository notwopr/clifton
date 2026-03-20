"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLogo() {
  const isHome = usePathname() === "/";
  return (
    <Link href="/" className="flex items-end gap-4">
      <span className={`font-bold text-5xl tracking-tight ${isHome ? "text-foreground" : "text-primary"}`}>Clifton</span>
      {!isHome && (
        <div className="rounded-2xl px-2 pt-2 bg-transparent dark:bg-white">
          <img src="/logo.svg" alt="Clifton" className="h-24 w-auto block" />
        </div>
      )}
    </Link>
  );
}
