import { DatabaseZap, RadioTower, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function IntegrationStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="glass rounded-2xl p-4">
        <Badge>
          <RadioTower size={14} />
          Powered by Tatum RPC
        </Badge>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Every dashboard number, checkpoint, object, event, and transaction comes from Tatum Sui
          endpoints.
        </p>
      </div>
      <div className="glass rounded-2xl p-4">
        <Badge className="border-violet-300/25 bg-violet-300/10 text-violet-100">
          <DatabaseZap size={14} />
          Permanent on Walrus
        </Badge>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Canonical snapshots, reports, replay states, and audit records are stored as Walrus blobs.
        </p>
      </div>
      <div className="glass rounded-2xl p-4">
        <Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
          <ShieldCheck size={14} />
          Verifiable Sui Anchors
        </Badge>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Optional Sui anchor objects connect snapshot hashes to public onchain proof.
        </p>
      </div>
    </div>
  );
}
