import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  DatabaseZap,
  Fingerprint,
  History,
  RadioTower,
  Repeat2,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { IntegrationStrip } from "@/components/integration-strip";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Paste a wallet address",
    copy: "Think of this like looking up a public account number. No password is needed because Sui activity is public.",
    icon: Fingerprint
  },
  {
    title: "Read what happened",
    copy: "Tatum is the live data pipe. It tells ProofCast what the wallet owns, what it sent, what it received, and when it happened.",
    icon: RadioTower
  },
  {
    title: "Save a memory",
    copy: "ProofCast creates a time-stamped record of that moment, like a permanent receipt for the wallet's history.",
    icon: History
  },
  {
    title: "Archive it on Walrus",
    copy: "Walrus stores the full evidence so the memory can be opened later instead of disappearing from a private server.",
    icon: DatabaseZap
  },
  {
    title: "Explain it in plain English",
    copy: "AI turns confusing wallet activity into a short report: what changed, why it matters, and whether anything looks risky.",
    icon: BrainCircuit
  },
  {
    title: "Prove it was real",
    copy: "ProofCast checks the saved Walrus memory against live Sui data from Tatum, then shows a public proof page anyone can inspect.",
    icon: ShieldCheck
  }
];

const examples = [
  {
    title: "DAO treasury story",
    user: "A community wants to know where its treasury money went.",
    result: "ProofCast creates a public history card showing balances, major movements, AI explanation, and permanent Walrus proof."
  },
  {
    title: "NFT collector journey",
    user: "A collector wants to remember how their collection grew.",
    result: "ProofCast turns mints, transfers, and owned NFTs into a readable timeline and stores the story on Walrus."
  },
  {
    title: "Builder launch record",
    user: "A developer wants proof of what happened when they launched a project.",
    result: "ProofCast captures the wallet activity, explains the launch moment, and gives judges or users a verification link."
  },
  {
    title: "Wallet health check",
    user: "Someone wants to know whether a wallet looks normal or suspicious.",
    result: "ProofCast gives a risk score, explains the warning signs, and keeps the evidence available for review."
  }
];

const proofChecks = [
  "Can we still open the saved memory from Walrus?",
  "Does the saved memory match the fingerprint ProofCast recorded?",
  "Does Tatum show that Sui has moved past the moment we captured?",
  "Can Tatum still find the transactions and events mentioned in the memory?",
  "If there is a Sui anchor, does it point to the same wallet, Walrus memory, and fingerprint?"
];

export default function ProjectPage() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="self-center">
            <Badge>
              <Sparkles size={15} />
              Project explanation
            </Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-black tracking-tight sm:text-7xl">
              ProofCast turns a wallet into a permanent, verifiable story.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              Imagine a bank statement, a documentary, and a notarized receipt in one place.
              ProofCast looks at a public Sui wallet, explains what happened in normal language,
              saves the evidence forever on Walrus, and gives everyone a link to verify it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Capture a ProofCast
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/proofcast/662c368e">Open live proof</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/mcp">Tatum MCP guide</Link>
              </Button>
            </div>
          </div>

          <Card className="glass-strong overflow-hidden">
            <CardHeader className="border-b border-white/10">
              <Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
                <CheckCircle2 size={14} />
                Judge quick read
              </Badge>
              <CardTitle className="text-3xl">What are we really doing?</CardTitle>
              <CardDescription>
                A beginner does not need to read blockchain data. They need to understand the story,
                then trust that the proof underneath is real.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-5">
              <Fact label="One sentence" value="ProofCast makes a permanent history page for any Sui wallet." />
              <Fact label="Wallet" value="The public account we are looking at." />
              <Fact label="Tatum" value="The live reader that checks what happened on Sui." />
              <Fact label="Walrus" value="The permanent archive where the memory and report are stored." />
              <Fact label="AI" value="The narrator that turns raw activity into a readable story." />
              <Fact label="MCP" value="Official Tatum MCP lets AI assistants inspect blockchain facts. ProofCast does not run a custom MCP server." />
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <IntegrationStrip />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="max-w-3xl">
            <Badge>Simple version</Badge>
            <h2 className="mt-4 text-4xl font-black tracking-tight">From confusing wallet activity to a story anyone can understand.</h2>
            <p className="mt-4 text-lg leading-8 text-white/60">
              The technical proof is still there for experts, but the main experience is simple:
              choose an address, capture its history, read the explanation, and share the proof.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <Icon className="text-cyan-100" />
                      <span className="text-xs font-bold text-white/35">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{step.copy}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Card className="glass-strong">
              <CardHeader>
                <Badge>
                  <DatabaseZap size={14} />
                  Walrus-first architecture
                </Badge>
                <CardTitle className="text-3xl">What goes into Walrus?</CardTitle>
                <CardDescription>
                  Walrus is the product core. It is where the actual memory lives, not just an
                  image or a database row.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Artifact name="Wallet memory" copy="The evidence from one moment in time: balances, activity, owned objects, events, and a fingerprint that proves it was not changed." />
                <Artifact name="AI explanation" copy="The human-readable summary a judge or beginner can understand without reading blockchain records." />
                <Artifact name="DAO treasury report" copy="A special memory for organizations that explains how treasury funds moved." />
                <Artifact name="Chain Memory story" copy="A longer historical narrative, generated from a verified memory and stored back on Walrus." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="border-violet-300/25 bg-violet-300/10 text-violet-100">
                  <Repeat2 size={14} />
                  What judges should look for
                </Badge>
                <CardTitle className="text-3xl">No one has to read JSON to understand the proof.</CardTitle>
                <CardDescription>
                  The app turns technical evidence into a small set of plain-language receipts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Artifact name="Story" copy="What happened to this wallet?" />
                <Artifact name="Permanent archive" copy="Where is the Walrus blob that stores the evidence?" />
                <Artifact name="Live chain check" copy="What Sui checkpoint did Tatum confirm?" />
                <Artifact name="Verification result" copy="Did the saved memory match live blockchain data?" />
                <details className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-cyan-100">
                    Technical JSON example for expert reviewers
                  </summary>
                  <pre className="mt-4 overflow-auto rounded-xl border border-white/10 bg-black/35 p-4 text-xs leading-6 text-cyan-100">
{`{
  "snapshotId": "e4274458-a727-4b8a-9b15-62c5ee1ca2cc",
  "walletAddress": "0x8497...",
  "timestamp": "2026-06-01T...",
  "checkpoint": "343426348",
  "transactions": ["...live Tatum transaction blocks"],
  "balances": ["...Sui balances"],
  "nfts": ["...owned Sui objects"],
  "contractEvents": ["...Tatum event results"],
  "aiSummary": "Wallet deployed two smart contracts...",
  "riskAnalysis": "No red flags.",
  "previousHash": "cc5c4148...",
  "currentHash": "441e6035...",
  "source": {
    "chain": "sui",
    "provider": "tatum",
    "storage": "walrus"
  }
}`}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="max-w-3xl">
            <Badge>Real examples</Badge>
            <h2 className="mt-4 text-4xl font-black tracking-tight">Who would use this?</h2>
            <p className="mt-4 text-lg leading-8 text-white/60">
              ProofCast is useful anywhere blockchain history needs to be understandable, permanent,
              and independently checkable.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {examples.map((example) => (
              <Card key={example.title}>
                <CardHeader>
                  <CardTitle>{example.title}</CardTitle>
                  <CardDescription>{example.user}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-white/62">{example.result}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Card className="glass-strong">
            <CardHeader>
              <Badge>
                <RadioTower size={14} />
                Official Tatum MCP
              </Badge>
              <CardTitle className="text-3xl">AI agents use Tatum MCP, not a ProofCast MCP clone.</CardTitle>
              <CardDescription>
                If a judge wants an AI assistant to inspect blockchain facts, the assistant connects
                to Tatum&apos;s official MCP server. ProofCast then captures those facts into permanent
                Walrus memories through the web app.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/mcp">Open Tatum MCP guide</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="https://tatum.io/mcp">Official Tatum MCP docs</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Card className="glass-strong">
            <CardHeader>
              <Badge>
                <ShieldCheck size={14} />
                Plain-English verification
              </Badge>
              <CardTitle className="text-3xl">How do we know the memory is real?</CardTitle>
              <CardDescription>
                ProofCast checks the story against evidence. If something is missing or does not
                match, the app refuses to call it valid.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {proofChecks.map((check) => (
                <div key={check} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-100" size={18} />
                  <p className="text-sm leading-6 text-white/65">{check}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
          <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Badge>Demo path</Badge>
                <h2 className="mt-4 text-4xl font-black tracking-tight">The hackathon story in 60 seconds.</h2>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-white/60">
                  Open Dashboard, capture the funded wallet, read the AI story, show the Walrus
                  archive receipt, open the public proof, replay the wallet history, then generate a
                  Chain Memory story. The judge sees the story first and the technical proof only
                  when they want it.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button asChild size="lg">
                  <Link href="/dashboard">Start demo</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/replay">Replay proof</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/memories">Chain Memories</Link>
                </Button>
              </div>
            </div>
          </div>
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

function Artifact({ name, copy }: { name: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="font-semibold text-white">{name}</p>
      <p className="mt-2 text-sm leading-6 text-white/55">{copy}</p>
    </div>
  );
}
