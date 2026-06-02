import { BrainCircuit, CheckCircle2, DatabaseZap, Fingerprint, RadioTower, Share2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getProofcast(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch(`${base}/api/proofcast/${id}`, { cache: "no-store" }).catch(() => null);
  if (!response?.ok) return null;
  return response.json() as Promise<{ proofcast: Record<string, unknown> }>;
}

export default async function PublicProofcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProofcast(id);
  const proofcast = data?.proofcast;
  const verification = proofcast?.verification as Record<string, unknown> | undefined;
  const verificationStatus = String(verification?.status ?? "pending");

  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Card className="glass-strong overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <Badge>
              <Share2 size={14} />
              Public ProofCast
            </Badge>
            {proofcast ? (
              <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                <ShieldCheck size={14} />
                {verificationStatus}
              </Badge>
            ) : null}
            <CardTitle className="text-4xl">
              {proofcast ? String(proofcast.aiSummary ?? "Onchain memory report") : "Public proof unavailable"}
            </CardTitle>
            <CardDescription>
              {proofcast
                ? "This is the human-readable story first. The technical receipts are still available below."
                : "Create a live snapshot first, then share its public ProofCast link."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-4">
            <ProofMetric
              icon={ShieldCheck}
              label="Verification"
              value={verificationStatus}
              tone={verificationStatus === "VALID" ? "success" : "default"}
            />
            <ProofMetric icon={DatabaseZap} label="Saved on Walrus" value={String(proofcast?.walrusBlobId ?? "missing")} />
            <ProofMetric icon={RadioTower} label="Checked with Tatum" value={String(proofcast?.checkpoint ?? "missing")} />
            <ProofMetric icon={Fingerprint} label="Sui Anchor" value={String(proofcast?.anchorObjectId ?? "optional")} />
          </CardContent>
        </Card>

        {proofcast ? (
          <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MeaningCard
              icon={BrainCircuit}
              title="What happened?"
              copy="AI translated the wallet activity into a short report."
            />
            <MeaningCard
              icon={DatabaseZap}
              title="Where is the evidence?"
              copy="The full memory is stored as a Walrus blob, not just shown in this UI."
            />
            <MeaningCard
              icon={RadioTower}
              title="Was Sui checked live?"
              copy="Tatum confirms the checkpoint and transaction evidence."
            />
            <MeaningCard
              icon={CheckCircle2}
              title="Can we trust it?"
              copy="VALID means the saved memory matched the proof checks."
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Plain-English report</CardTitle>
                <CardDescription>
                  This is the part a non-technical judge should read first.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-white/65">{String(proofcast.humanReport ?? "")}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/share/${String(proofcast.id)}`}>Open share card</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/snapshots/${String(proofcast.id)}`}>Technical detail</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Technical receipt</CardTitle>
                <CardDescription>
                  The raw proof is here for technical review, but the summary above is the intended
                  beginner-facing experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Receipt label="Walrus memory" value={String(proofcast.walrusBlobId ?? "missing")} />
                  <Receipt label="Tatum checkpoint" value={String(proofcast.checkpoint ?? "missing")} />
                  <Receipt label="Verification" value={verificationStatus} />
                </div>
                <details className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-cyan-100">
                    Open raw JSON proof
                  </summary>
                  <pre className="mt-4 max-h-[28rem] overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-cyan-100">
                    {JSON.stringify(proofcast, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>
          </>
        ) : null}
      </main>
    </SiteShell>
  );
}

function MeaningCard({
  icon: Icon,
  title,
  copy
}: {
  icon: typeof DatabaseZap;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon className="text-cyan-100" />
      <p className="mt-4 font-bold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/55">{copy}</p>
    </div>
  );
}

function Receipt({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-white/80">{value}</p>
    </div>
  );
}

function ProofMetric({
  icon: Icon,
  label,
  value,
  tone = "default"
}: {
  icon: typeof DatabaseZap;
  label: string;
  value: string;
  tone?: "default" | "success";
}) {
  return (
    <div
      className={
        tone === "success"
          ? "rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4"
          : "rounded-2xl border border-white/10 bg-black/20 p-4"
      }
    >
      <Icon className={tone === "success" ? "text-emerald-100" : "text-cyan-100"} />
      <p className="mt-4 text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-white/80">{value}</p>
    </div>
  );
}
