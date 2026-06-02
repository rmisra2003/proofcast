import { Bot, CheckCircle2, Copy, DatabaseZap, ExternalLink, RadioTower, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const prompts = [
  "Use Tatum MCP to inspect this Sui wallet, then paste the address into ProofCast to create a permanent memory.",
  "Check recent activity for 0x8497... on Sui using Tatum MCP. What changed recently?",
  "Use Tatum MCP RPC tools to confirm whether these transaction digests still exist on Sui.",
  "After ProofCast stores a Walrus memory, use Tatum MCP to independently inspect the wallet history."
];

const workflow = [
  {
    title: "AI assistant reads Sui through Tatum MCP",
    copy: "The assistant uses Tatum's official Blockchain MCP server for live blockchain reads and RPC gateway access.",
    icon: Bot
  },
  {
    title: "ProofCast captures the wallet",
    copy: "The web app uses server-side Tatum Sui RPC to build the same kind of live blockchain picture.",
    icon: RadioTower
  },
  {
    title: "Walrus stores the memory",
    copy: "ProofCast stores the full evidence, reports, and Chain Memories as Walrus blobs.",
    icon: DatabaseZap
  },
  {
    title: "Proof can be checked twice",
    copy: "Judges can inspect the public ProofCast and ask an MCP-enabled assistant to re-check live chain facts through Tatum.",
    icon: ShieldCheck
  }
];

export default function TatumMcpPage() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="self-center">
            <Badge>
              <Bot size={15} />
              Tatum MCP only
            </Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-black tracking-tight sm:text-7xl">
              ProofCast is agent-ready through the official Tatum MCP server.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              We are not shipping a custom ProofCast MCP server. The MCP layer is Tatum&apos;s official
              Blockchain MCP server, which lets AI assistants read blockchain data and use RPC
              tools. ProofCast then turns those same Tatum-powered facts into permanent Walrus
              memories.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">Create ProofCast</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="https://tatum.io/mcp">
                  Tatum MCP docs
                  <ExternalLink size={16} />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="glass-strong">
            <CardHeader>
              <Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
                <CheckCircle2 size={14} />
                No custom MCP server
              </Badge>
              <CardTitle className="text-3xl">What MCP means in this project</CardTitle>
              <CardDescription>
                MCP is the AI assistant entry point into Tatum&apos;s blockchain data. ProofCast remains
                the product experience and proof engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Fact label="MCP provider" value="Official Tatum Blockchain MCP server." />
              <Fact label="Blockchain source" value="Tatum MCP and ProofCast both point back to Tatum-powered blockchain data." />
              <Fact label="Storage source" value="ProofCast stores permanent memories on Walrus after capture." />
              <Fact label="Judge story" value="AI agents can inspect chain facts; ProofCast preserves and explains them." />
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <Badge>
              <RadioTower size={14} />
              Agent workflow
            </Badge>
            <h2 className="mt-4 text-4xl font-black tracking-tight">How a judge can use it.</h2>
            <p className="mt-4 text-lg leading-8 text-white/60">
              The website is for humans. Tatum MCP is for AI assistants. Together they show that
              ProofCast is not just a static app: it fits into an agent workflow for blockchain
              intelligence.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <Icon className="text-cyan-100" />
                      <span className="text-xs font-bold text-white/35">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{item.copy}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="glass-strong">
              <CardHeader>
                <Badge>
                  <Copy size={14} />
                  MCP config
                </Badge>
                <CardTitle className="text-3xl">Copy this into an MCP client.</CardTitle>
                <CardDescription>
                  Keep the real Tatum API key in the MCP client&apos;s environment. Do not expose it in
                  the browser.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/35 p-4 text-xs leading-6 text-cyan-100">
{`{
  "mcpServers": {
    "tatumio": {
      "command": "npx",
      "args": ["@tatumio/blockchain-mcp"],
      "env": {
        "TATUM_API_KEY": "YOUR_TATUM_API_KEY"
      }
    }
  }
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="border-violet-300/25 bg-violet-300/10 text-violet-100">
                  <Sparkles size={14} />
                  Demo prompts
                </Badge>
                <CardTitle className="text-3xl">What to ask the AI assistant.</CardTitle>
                <CardDescription>
                  These prompts use Tatum MCP for chain inspection, then ProofCast for permanent
                  memory and public proof.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {prompts.map((prompt) => (
                  <div key={prompt} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm leading-6 text-white/70">{prompt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
          <Card>
            <CardHeader>
              <Badge>
                <ShieldCheck size={14} />
                Hackathon positioning
              </Badge>
              <CardTitle className="text-3xl">Why this matters for ProofCast.</CardTitle>
              <CardDescription>
                Tatum MCP lets AI agents explore blockchain facts. ProofCast captures, explains,
                stores, and verifies those facts as permanent Walrus memories.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Fact label="Tatum prize" value="MCP and RPC show Tatum as the live intelligence layer." />
              <Fact label="Walrus prize" value="Walrus remains the permanent memory layer for all saved artifacts." />
              <Fact label="Product value" value="A beginner sees stories; a judge can verify receipts; an AI agent can inspect chain facts." />
            </CardContent>
          </Card>
        </section>
      </main>
    </SiteShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white/72">{value}</p>
    </div>
  );
}
