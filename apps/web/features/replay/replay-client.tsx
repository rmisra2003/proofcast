"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DatabaseZap, Loader2, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ReplayFrame } from "@/lib/client-types";

const demoWallet = "0x84978ca85b3effd9712157238aa262126392b782897917d7e8475376dcfcb7a2";

export function ReplayClient() {
  const [walletAddress, setWalletAddress] = useState(demoWallet);
  const [frames, setFrames] = useState<ReplayFrame[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = frames[index];

  async function loadReplay() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/replay/${walletAddress}`);
      const payload = (await response.json()) as { frames?: ReplayFrame[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Replay loading failed.");
      setFrames(payload.frames ?? []);
      setIndex(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Replay Mode</CardTitle>
          <CardDescription>
            Move through valid Walrus blobs only. Postgres indexes the frames; replay data is
            reconstructed from Walrus and hash-checked before display.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="0x..." value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} />
          <Button className="w-full" onClick={loadReplay} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
            Load replay
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => setWalletAddress(demoWallet)}>
            Load hackathon wallet
          </Button>
          {frames.length > 0 ? (
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              value={index}
              onChange={(event) => setIndex(Number(event.target.value))}
              className="w-full accent-cyan-300"
            />
          ) : null}
          {error ? <p className="text-sm text-amber-100">{error}</p> : null}
        </CardContent>
      </Card>

      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>{selected ? selected.aiSummary : "No replay frames yet"}</CardTitle>
          <CardDescription>
            {selected
              ? `Frame ${selected.index + 1} from ${new Date(selected.timestamp).toLocaleString()}`
              : "Capture multiple snapshots for the same wallet to animate its history."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {frames.length > 0 ? (
            <div className="h-72 rounded-2xl border border-white/10 bg-black/25 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={frames}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="index" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip contentStyle={{ background: "#070b16", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <Area dataKey="transactionCount" stroke="#67e8f9" fill="#67e8f930" />
                  <Area dataKey="riskScore" stroke="#c084fc" fill="#c084fc25" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}
          {selected ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Source" value={selected.source} />
              <Metric label="Walrus read" value={selected.walrusVerified ? "ok" : "failed"} />
              <Metric label="Hash" value={selected.hashOk ? "verified" : "mismatch"} />
              <Metric label="Walrus blob" value={selected.walrusBlobId ?? "missing"} />
              <Metric label="Risk" value={String(selected.riskScore)} />
              <Metric label="Verification" value={selected.verificationStatus} />
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center text-center text-white/50">
              <div>
                <DatabaseZap className="mx-auto text-cyan-100" size={50} />
                <p className="mt-4">Replay state will be reconstructed from stored Walrus snapshots.</p>
              </div>
            </div>
          )}
          {selected ? (
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href={`/proofcast/${selected.publicSlug}`}>Open public frame</Link>
              </Button>
              {selected.walrusProofUrl ? (
                <Button asChild variant="secondary">
                  <Link href={selected.walrusProofUrl}>Open Walrus blob</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold">{value}</p>
    </div>
  );
}
