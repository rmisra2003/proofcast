"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import { Archive, Building2, FileText, Home, Layers3, Radio, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/project", label: "Project", icon: FileText },
  { href: "/dashboard", label: "Dashboard", icon: Radio },
  { href: "/replay", label: "Replay", icon: Layers3 },
  { href: "/dao", label: "DAO Vault", icon: Building2 },
  { href: "/memories", label: "Chain Memories", icon: Sparkles }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [shareHref, setShareHref] = useState("/dashboard");

  useEffect(() => {
    let alive = true;

    fetch("/api/proofcast/latest")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { proofcast?: { href?: string } } | null) => {
        if (alive && payload?.proofcast?.href) {
          setShareHref(payload.proofcast.href);
        }
      })
      .catch(() => {
        if (alive) setShareHref("/dashboard");
      });

    return () => {
      alive = false;
    };
  }, []);

  const links = [...baseLinks, { href: shareHref, label: "Share", icon: Share2 }];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050712]/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-fit items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-sm font-black text-cyan-100 shadow-glow">
              PC
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight">ProofCast</span>
              <span className="block text-xs text-white/45">Onchain memory for Sui</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 lg:flex">
            {links.map((link) => {
              const Icon = link.icon;
              const active =
                pathname === link.href ||
                (link.label === "Share" && (pathname.startsWith("/proofcast") || pathname.startsWith("/share")));
              return (
                <Link
                  href={link.href}
                  key={link.href}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold text-white/62 transition hover:bg-white/10 hover:text-white",
                    active && "bg-white/12 text-white"
                  )}
                >
                  <Icon size={15} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 sm:inline-flex">
              <Archive size={15} />
              Start
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
