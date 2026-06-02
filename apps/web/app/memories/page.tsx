import { SiteShell } from "@/components/site-shell";
import { ChainMemoryClient } from "@/features/memories/chain-memory-client";

export default function ChainMemoriesPage() {
  return (
    <SiteShell>
      <ChainMemoryClient />
    </SiteShell>
  );
}
