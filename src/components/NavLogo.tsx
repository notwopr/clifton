"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLogo() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Link href="/" className="flex items-center gap-4">
      <span className="font-bold text-5xl tracking-tight">Clifton</span>
      {!isHome && (
        <div className="rounded-2xl p-2 bg-transparent dark:bg-white">
          <img src="/logo.svg" alt="Clifton" className="h-24 w-auto" />
        </div>
      )}
    </Link>
  );
}
