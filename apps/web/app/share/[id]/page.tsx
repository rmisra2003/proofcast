import { AlertTriangle, DatabaseZap, RadioTower, Share2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getShareProofState } from "../share-proof-state";

export const dynamic = "force-dynamic";

async function getProofcast(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch(`${base}/api/proofcast/${id}`, { cache: "no-store" }).catch(() => null);
  if (!response?.ok) return null;
  return response.json() as Promise<{ proofcast: Record<string, unknown> }>;
}

export default async function ShareCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProofcast(id);
  const proofcast = data?.proofcast;
  const proofState = getShareProofState(proofcast);

  return (
    <SiteShell>
      <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-5xl place-items-center px-4 py-10 sm:px-6">
        {!proofcast ? (
          <Card className="glass-strong w-full">
            <CardContent className="p-8 sm:p-12">
              <Badge className="border-amber-300/25 bg-amber-300/10 text-amber-100">
                <AlertTriangle size={14} />
                ProofCast not found
              </Badge>
              <h1 className="mt-8 max-w-3xl text-5xl font-black tracking-tight">
                Capture a live ProofCast before sharing.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
                This share ID does not point to a stored Walrus memory, Tatum checkpoint, or Sui
                anchor. ProofCast will not show proof badges until the record exists.
              </p>
              <Button asChild className="mt-8">
                <Link href="/dashboard">Create live proof</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
        <Card className="glass-strong w-full overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-[radial-gradient(circle_at_20%_0%,rgba(103,232,249,0.25),transparent_28rem),radial-gradient(circle_at_80%_20%,rgba(192,132,252,0.2),transparent_30rem)] p-8 sm:p-12">
              <Badge>
                <Share2 size={14} />
                Shareable ProofCast
              </Badge>
              <h1 className="mt-8 max-w-3xl text-5xl font-black tracking-tight sm:text-7xl">
                This wallet has a permanent public history card.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
                ProofCast ID {id} is {proofState.verificationStatus}. The story is easy to read,
                and the proof underneath can be checked with Walrus, Tatum, and Sui.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                  <DatabaseZap className="text-cyan-100" />
                  <p className="mt-4 font-bold">Saved permanently</p>
                  <p className="mt-2 break-all text-xs text-white/45">{proofState.walrusBlobLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                  <RadioTower className="text-violet-100" />
                  <p className="mt-4 font-bold">Checked live</p>
                  <p className="mt-2 text-xs text-white/45">{proofState.checkpointLabel}</p>
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                  <ShieldCheck className="text-emerald-100" />
                  <p className="mt-4 font-bold">Proof result: {proofState.verificationStatus}</p>
                  <p className="mt-2 text-xs text-white/45">{proofState.anchorCopy}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </main>
    </SiteShell>
  );
}
