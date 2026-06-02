"use client";

import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { AlertTriangle, ArrowRight, CheckCircle2, DatabaseZap, Loader2, RadioTower, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatusPill } from "@/components/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AnchorRequest, CaptureResponse, HealthResponse, SnapshotSummary } from "@/lib/client-types";
import { formatAddress } from "@/lib/utils";

const demoWallets = [
  {
    label: "Funded Testnet Wallet",
    address: "0x84978ca85b3effd9712157238aa262126392b782897917d7e8475376dcfcb7a2"
  },
  {
    label: "Sui System Address",
    address: "0x0000000000000000000000000000000000000000000000000000000000000005"
  }
];

export function DashboardClient({ health }: { health: HealthResponse }) {
  const account = useCurrentAccount();
  const [walletAddress, setWalletAddress] = useState(demoWallets[0].address);
  const [walletKind, setWalletKind] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capture, setCapture] = useState<CaptureResponse | null>(null);
  const [anchorState, setAnchorState] = useState<string | null>(null);

  const signAndExecute = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) => {
      const response = await fetch("/api/sui/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transactionBytes: bytes, signature })
      });
      const payload = (await response.json()) as {
        result?: { digest?: string; objectChanges?: Array<{ type?: string; objectId?: string; objectType?: string }> };
        error?: { message?: string };
      };

      if (!response.ok || payload.error || !payload.result?.digest) {
        throw new Error(payload.error?.message ?? "Tatum Sui execution failed.");
      }

      return {
        digest: payload.result.digest,
        objectChanges: payload.result.objectChanges
      };
    }
  });

  const chartData = useMemo(() => {
    const raw = capture?.snapshot.raw;
    const txCount = raw?.transactions?.length ?? 0;
    const nftCount = raw?.nfts?.length ?? 0;
    const risk = capture?.snapshot.riskScore ?? 0;
    return [
      { name: "Transactions", value: txCount },
      { name: "NFTs", value: nftCount },
      { name: "Risk", value: risk }
    ];
  }, [capture]);
  const verificationStatus = capture?.verification?.status ?? capture?.snapshot.verificationRecords?.[0]?.status;

  async function captureSnapshot() {
    setLoading(true);
    setError(null);
    setCapture(null);

    try {
      const response = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          walletKind,
          label: walletKind === "TREASURY" ? "DAO treasury" : "Tracked wallet",
          makePublic: true,
          anchorOnchain: false
        })
      });
      const payload = (await response.json()) as CaptureResponse & { error?: string; code?: string; missing?: string[] };

      if (!response.ok) {
        throw new Error(payload.error ?? "Snapshot capture failed.");
      }

      setCapture(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }

  async function anchorSnapshot(anchorRequest: AnchorRequest, snapshot: SnapshotSummary) {
    if (!account) {
      setAnchorState("Connect a Sui wallet before anchoring.");
      return;
    }

    setAnchorState("Waiting for wallet signature...");
    const tx = new Transaction();
    tx.moveCall({
      target: anchorRequest.target,
      arguments: [
        tx.pure.address(anchorRequest.args.watchedAddress),
        tx.pure.vector("u8", stringToBytes(anchorRequest.args.walrusBlobId)),
        tx.pure.vector("u8", stringToBytes(anchorRequest.args.snapshotHash)),
        tx.pure.u64(BigInt(anchorRequest.args.checkpoint || "0")),
        tx.pure.vector("u8", stringToBytes(anchorRequest.args.previousHash)),
        tx.object(anchorRequest.args.clockObjectId)
      ]
    });

    const result = await signAndExecute.mutateAsync({ transaction: tx, chain: "sui:testnet" });
    const createdAnchor = result.objectChanges?.find((change) =>
      change.objectType?.includes("snapshot_anchor::SnapshotAnchor")
    );

    await fetch(`/api/snapshots/${snapshot.id}/anchor`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        anchorObjectId: createdAnchor?.objectId ?? result.digest,
        anchorTxDigest: result.digest
      })
    });

    setAnchorState(`Anchored on Sui: ${formatAddress(result.digest)}`);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-6">
        <Card className="glass-strong">
          <CardHeader>
            <Badge>
              <RadioTower size={14} />
              Live snapshot engine
            </Badge>
            <CardTitle className="text-3xl">Generate a ProofCast</CardTitle>
            <CardDescription>
              Enter any Sui address. ProofCast reads live state through Tatum, stores the canonical
              memory on Walrus, and generates an AI report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <label className="text-sm font-semibold text-white/70">Sui address</label>
              <Input value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} />
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-semibold text-white/70">ProofCast type</label>
              <select
                value={walletKind}
                onChange={(event) => setWalletKind(event.target.value)}
                className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm"
              >
                <option value="USER">Wallet</option>
                <option value="DAO">DAO</option>
                <option value="TREASURY">Treasury</option>
                <option value="NFT_COLLECTION">NFT Collection</option>
                <option value="CONTRACT">Smart Contract</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {demoWallets.map((wallet) => (
                <Button
                  key={wallet.address}
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setWalletAddress(wallet.address)}
                >
                  Load {wallet.label}
                </Button>
              ))}
            </div>
            <Button className="w-full" size="lg" onClick={captureSnapshot} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {loading ? "Capturing live state..." : "Capture Snapshot"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Infrastructure readiness</CardTitle>
            <CardDescription>No demo data is faked. Missing services block live capture.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(health.integrations).map(([name, status]) => (
              <StatusPill
                key={name}
                status={status === "configured" ? "ok" : status === "optional" ? "loading" : "warn"}
                label={`${name}: ${status}`}
              />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        {error ? (
          <Card className="border-amber-300/25 bg-amber-300/10">
            <CardContent className="flex gap-3 p-5 text-amber-100">
              <AlertTriangle className="mt-1" />
              <div>
                <h3 className="font-bold">Live capture blocked</h3>
                <p className="mt-2 text-sm leading-6 text-amber-100/75">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {capture ? (
          <>
            <Card className="glass-strong">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
                    <CheckCircle2 size={14} />
                    {verificationStatus === "VALID" ? "Walrus + Tatum verified" : "Stored on Walrus"}
                  </Badge>
                  <span className="text-xs text-white/45">
                    {verificationStatus ? `Verification ${verificationStatus}` : capture.snapshot.status}
                  </span>
                </div>
                <CardTitle className="text-2xl">{capture.snapshot.aiSummary}</CardTitle>
                <CardDescription>{capture.snapshot.humanReport}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Risk score" value={String(capture.snapshot.riskScore ?? 0)} />
                  <Metric label="Checkpoint" value={capture.snapshot.checkpoint ?? "pending"} />
                  <Metric label="Walrus blob" value={formatAddress(capture.snapshot.walrusBlobId ?? "")} />
                  <Metric label="Verification" value={verificationStatus ?? "pending"} />
                </div>
                <div className="h-64 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="proofcast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.55} />
                          <stop offset="95%" stopColor="#67e8f9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                      <YAxis stroke="rgba(255,255,255,0.45)" />
                      <Tooltip contentStyle={{ background: "#070b16", border: "1px solid rgba(255,255,255,0.12)" }} />
                      <Area dataKey="value" stroke="#67e8f9" fill="url(#proofcast)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/snapshots/${capture.snapshot.id}`}>
                      Snapshot detail
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/proofcast/${capture.snapshot.publicSlug}`}>Public ProofCast</Link>
                  </Button>
                  {capture.anchorRequest ? (
                    <Button variant="secondary" onClick={() => anchorSnapshot(capture.anchorRequest!, capture.snapshot)}>
                      <ShieldCheck size={16} />
                      Anchor on Sui
                    </Button>
                  ) : null}
                </div>
                {anchorState ? <p className="text-sm text-cyan-100">{anchorState}</p> : null}
                {capture.verificationError ? (
                  <p className="text-sm text-amber-100">
                    Stored on Walrus, but server verification needs attention: {capture.verificationError}
                  </p>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge className="border-violet-300/25 bg-violet-300/10 text-violet-100">
                  <DatabaseZap size={14} />
                  Walrus proof
                </Badge>
                <CardTitle>Canonical memory artifact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Code label="Walrus Blob ID" value={capture.snapshot.walrusBlobId ?? "missing"} />
                <Code label="Canonical Hash" value={capture.snapshot.canonicalHash} />
                <Code label="Previous Hash" value={capture.snapshot.previousHash ?? "genesis"} />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="min-h-[34rem]">
            <CardContent className="grid h-full min-h-[34rem] place-items-center p-8 text-center">
              <div>
                <DatabaseZap className="mx-auto text-cyan-100" size={54} />
                <h2 className="mt-6 text-2xl font-bold">No snapshot captured yet</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">
                  Once you run a live capture, this panel becomes the judge-facing proof surface:
                  Tatum data, Walrus blob IDs, AI report, replay data, and Sui anchor actions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-2 overflow-hidden text-ellipsis text-xl font-bold">{value}</p>
    </div>
  );
}

function Code({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-white/45">{label}</p>
      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-cyan-100">
        {value}
      </pre>
    </div>
  );
}

function stringToBytes(value: string) {
  return Array.from(new TextEncoder().encode(value));
}
