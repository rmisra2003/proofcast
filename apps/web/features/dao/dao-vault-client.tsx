"use client";

import { ArrowRight, Building2, DatabaseZap, Loader2, RadioTower, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CaptureResponse } from "@/lib/client-types";
import { formatAddress } from "@/lib/utils";

const demoTreasury = "0x84978ca85b3effd9712157238aa262126392b782897917d7e8475376dcfcb7a2";

type TreasuryResponse = CaptureResponse & {
  treasuryReport: {
    currentHash: string;
    riskFlags: string[];
    activity: {
      transactionCount: number;
      nftObjectCount: number;
      eventCount: number;
      inflowMist: string;
      outflowMist: string;
    };
    aiSummary: string;
    riskAnalysis: string;
  };
  treasuryWalrusBlob: {
    blobId: string;
    objectId?: string;
    proofUrl: string;
    contentHash: string;
  };
};

export function DaoVaultClient() {
  const [walletAddress, setWalletAddress] = useState(demoTreasury);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TreasuryResponse | null>(null);

  async function captureTreasury() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/dao/treasury", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          label: "DAO treasury",
          makePublic: true,
          anchorOnchain: false
        })
      });
      const payload = (await response.json()) as TreasuryResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "DAO treasury capture failed.");
      }

      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="space-y-6">
        <Card className="glass-strong">
          <CardHeader>
            <Badge>
              <Building2 size={14} />
              DAO Memory Vault
            </Badge>
            <CardTitle className="text-4xl">Treasury history that cannot disappear.</CardTitle>
            <CardDescription>
              Capture a live Sui treasury address through Tatum, store the treasury report on
              Walrus, and publish a replayable ProofCast.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => setWalletAddress(demoTreasury)}>
                Load funded treasury demo
              </Button>
            </div>
            <Button className="w-full" size="lg" onClick={captureTreasury} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <RadioTower size={18} />}
              {loading ? "Capturing treasury..." : "Capture DAO treasury"}
            </Button>
            {error ? <p className="text-sm leading-6 text-amber-100">{error}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge className="border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
              <DatabaseZap size={14} />
              Walrus treasury reports
            </Badge>
            <CardTitle>What gets stored</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Capability title="Balances" copy="Treasury balances captured from Tatum." />
            <Capability title="Activity" copy="Inflow/outflow, NFTs, events, and transaction counts." />
            <Capability title="Risk flags" copy="AI risk and sampled movement anomalies." />
            <Capability title="Replay proof" copy="Walrus blob IDs, hashes, and public proof links." />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        {result ? (
          <>
            <Card className="glass-strong">
              <CardHeader>
                <Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
                  <ShieldCheck size={14} />
                  Treasury report stored on Walrus
                </Badge>
                <CardTitle>{result.treasuryReport.aiSummary}</CardTitle>
                <CardDescription>{result.treasuryReport.riskAnalysis}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Metric label="Transactions" value={String(result.treasuryReport.activity.transactionCount)} />
                <Metric label="Events" value={String(result.treasuryReport.activity.eventCount)} />
                <Metric label="Inflow mist" value={result.treasuryReport.activity.inflowMist} />
                <Metric label="Outflow mist" value={result.treasuryReport.activity.outflowMist} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proof surfaces</CardTitle>
                <CardDescription>Every link below is backed by a live artifact, not demo copy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Code label="Treasury Walrus Blob" value={result.treasuryWalrusBlob.blobId} />
                <Code label="Treasury Report Hash" value={result.treasuryReport.currentHash} />
                <Code label="Snapshot Walrus Blob" value={result.snapshot.walrusBlobId ?? "missing"} />
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/proofcast/${result.snapshot.publicSlug}`}>
                      Public ProofCast
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/replay`}>Replay treasury</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={result.treasuryWalrusBlob.proofUrl}>Open Walrus report</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.treasuryReport.riskFlags.length > 0 ? (
                  result.treasuryReport.riskFlags.map((flag) => (
                    <p key={flag} className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
                      {flag}
                    </p>
                  ))
                ) : (
                  <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">
                    No treasury-specific risk flags in the sampled activity.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="min-h-[34rem]">
            <CardContent className="grid h-full min-h-[34rem] place-items-center p-8 text-center">
              <div>
                <DatabaseZap className="mx-auto text-cyan-100" size={54} />
                <h2 className="mt-6 text-2xl font-bold">No treasury report captured yet</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">
                  Capture a live treasury to generate a Walrus-stored DAO report with Tatum
                  checkpoints and public ProofCast links.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}

function Capability({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/55">{copy}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-2 break-all text-lg font-bold">{value}</p>
    </div>
  );
}

function Code({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-white/45">{label}</p>
      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-cyan-100">
        {value.startsWith("0x") ? formatAddress(value) : value}
      </pre>
    </div>
  );
}
