import { ArrowRight, BrainCircuit, DatabaseZap, LineChart, LockKeyhole, RadioTower, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { IntegrationStrip } from "@/components/integration-strip";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: DatabaseZap,
    title: "Walrus-native snapshots",
    copy: "Every ProofCast is a canonical JSON memory artifact stored as a permanent Walrus blob."
  },
  {
    icon: RadioTower,
    title: "Tatum live intelligence",
    copy: "Balances, NFT objects, events, checkpoints, and transactions flow through Tatum Sui RPC."
  },
  {
    icon: BrainCircuit,
    title: "DeepSeek explanations",
    copy: "AI turns raw onchain deltas into human summaries, risk scores, and readable reports."
  },
  {
    icon: ShieldCheck,
    title: "Replayable verification",
    copy: "Walrus hashes, Tatum reads, and optional Sui anchors prove the timeline is not just UI."
  }
];

export default function LandingPage() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge>
              <Sparkles size={15} />
              AI-powered verifiable onchain memory
            </Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">
              A time machine for Sui wallets.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/65">
              ProofCast turns wallets, DAOs, NFT collectors, smart contracts, and treasuries into
              permanent AI-generated historical timelines stored on Walrus and powered by Tatum.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Generate ProofCast
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/replay">Open Replay Mode</Link>
              </Button>
            </div>
          </div>

          <div className="glass-strong relative overflow-hidden rounded-[2rem] p-5">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-300/20 to-transparent" />
            <div className="relative grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="border-violet-300/25 bg-violet-300/10 text-violet-100">
                    Live Memory
                  </Badge>
                  <LockKeyhole className="text-cyan-100" />
                </div>
                <div className="mt-12 h-40 rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_50%_35%,rgba(94,234,212,0.22),transparent_34%),radial-gradient(circle,rgba(168,85,247,0.24),transparent_66%)] shadow-glow" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <LineChart className="text-cyan-100" />
                    <p className="mt-4 text-2xl font-bold">Replay</p>
                    <p className="text-xs text-white/50">wallet state over time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <DatabaseZap className="text-violet-100" />
                    <p className="mt-4 text-2xl font-bold">Walrus</p>
                    <p className="text-xs text-white/50">permanent memory</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <RadioTower className="text-emerald-100" />
                    <p className="mt-4 text-2xl font-bold">Tatum</p>
                    <p className="text-xs text-white/50">live chain reads</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <IntegrationStrip />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="max-w-3xl">
            <Badge>How it works</Badge>
            <h2 className="mt-4 text-4xl font-black tracking-tight">GitHub commits for blockchain activity.</h2>
            <p className="mt-4 text-lg leading-8 text-white/60">
              ProofCast captures live Sui state, asks AI to explain what changed, stores the full
              memory on Walrus, and gives everyone a replayable public proof surface.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="p-5">
                    <Icon className="text-cyan-100" />
                    <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{feature.copy}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
