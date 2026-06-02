import { AlertTriangle, DatabaseZap, RadioTower, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SnapshotSummary } from "@/lib/client-types";
import { formatAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getSnapshot(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch(`${base}/api/snapshots/${id}`, { cache: "no-store" }).catch(() => null);
  if (!response?.ok) return null;
  return (await response.json()) as { snapshot: SnapshotSummary };
}

export default async function SnapshotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getSnapshot(id);

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {!data ? (
          <Card>
            <CardContent className="flex gap-3 p-6 text-amber-100">
              <AlertTriangle />
              <div>
                <h1 className="font-bold">Snapshot unavailable</h1>
                <p className="mt-2 text-sm text-white/60">
                  This page needs the database and live API routes to be configured.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SnapshotView snapshot={data.snapshot} />
        )}
      </main>
    </SiteShell>
  );
}

function SnapshotView({ snapshot }: { snapshot: SnapshotSummary }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="space-y-6">
        <Card className="glass-strong">
          <CardHeader>
            <Badge>
              <DatabaseZap size={14} />
              Walrus-backed memory
            </Badge>
            <CardTitle className="text-3xl">{snapshot.aiSummary ?? "ProofCast snapshot"}</CardTitle>
            <CardDescription>{snapshot.humanReport ?? "AI report is stored with this snapshot."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Fact label="Wallet" value={snapshot.watchedAddress} />
            <Fact label="Walrus Blob ID" value={snapshot.walrusBlobId ?? "missing"} />
            <Fact label="Canonical Hash" value={snapshot.canonicalHash} />
            <Fact label="Sui Anchor Object" value={snapshot.anchorObjectId ?? "not anchored"} />
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/proofcast/${snapshot.publicSlug}`}>Open public proof</Link>
              </Button>
              {snapshot.walrusBlobId ? (
                <Button asChild variant="secondary">
                  <Link href={`/api/walrus/${snapshot.walrusBlobId}`}>Read Walrus blob</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
              <ShieldCheck size={14} />
              Verification status
            </Badge>
            <CardTitle>{snapshot.verificationRecords?.[0]?.status ?? "PENDING"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href={`/api/snapshots/${snapshot.id}/verify`}>Verification API</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <Card>
          <CardHeader>
            <Badge>
              <RadioTower size={14} />
              Tatum captured state
            </Badge>
            <CardTitle>Snapshot JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[42rem] overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-cyan-100">
              {JSON.stringify(snapshot.raw ?? snapshot, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
      <p className="break-all rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-white/80">
        {value.startsWith("0x") ? formatAddress(value) : value}
      </p>
    </div>
  );
}
