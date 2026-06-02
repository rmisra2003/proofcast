"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ChainMemoryClient() {
  const [snapshotId, setSnapshotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadLatestProofCast() {
    setLoadingLatest(true);
    setError(null);

    try {
      const response = await fetch("/api/proofcast/latest");
      const payload = (await response.json()) as { proofcast?: { id?: string }; error?: string };
      if (!response.ok || !payload.proofcast?.id) {
        throw new Error(payload.error ?? "No valid ProofCast is available yet.");
      }
      setSnapshotId(payload.proofcast.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoadingLatest(false);
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai/chain-memory", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ snapshotId })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Chain Memory generation failed.");
      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <Badge>
            <Sparkles size={14} />
            Chain Memories
          </Badge>
          <CardTitle className="text-3xl">Generate historical wallet stories</CardTitle>
          <CardDescription>
            Turn a verified snapshot into an immutable AI narrative stored on Walrus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Snapshot ID or public slug"
            value={snapshotId}
            onChange={(event) => setSnapshotId(event.target.value)}
          />
          <Button type="button" variant="secondary" className="w-full" onClick={loadLatestProofCast} disabled={loadingLatest}>
            {loadingLatest ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Load latest valid ProofCast
          </Button>
          <Button className="w-full" onClick={generate} disabled={loading || !snapshotId}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Generate and store on Walrus
          </Button>
          {error ? <p className="text-sm text-amber-100">{error}</p> : null}
        </CardContent>
      </Card>

      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>Immutable narrative artifact</CardTitle>
          <CardDescription>
            The generated story includes citation hashes and is written back to Walrus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="min-h-96 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-cyan-100">
            {result ? JSON.stringify(result, null, 2) : "No Chain Memory generated yet."}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
