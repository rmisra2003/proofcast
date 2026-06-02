import { SiteShell } from "@/components/site-shell";
import { ReplayClient } from "@/features/replay/replay-client";

export default function ReplayPage() {
  return (
    <SiteShell>
      <ReplayClient />
    </SiteShell>
  );
}
