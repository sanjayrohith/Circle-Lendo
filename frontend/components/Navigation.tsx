"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";
import { useAccount } from "wagmi";

export function Navigation() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const links = [
    { href: "/", label: "Home" },
    { href: "/circles", label: "Browse Circles" },
    ...(isConnected
      ? [
          { href: "/create", label: "Create Circle" },
          { href: "/profile", label: "Profile" },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="headline-font text-lg font-semibold tracking-tight text-slate-900">
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                CreditCoin
              </span>{" "}
              Lending Circles
            </Link>
            <div className="hidden md:flex gap-2 rounded-full bg-white/80 px-2 py-1 shadow-sm ring-1 ring-slate-200/70">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    pathname === link.href
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
