import { SiteShell } from "@/components/site-shell";
import { DaoVaultClient } from "@/features/dao/dao-vault-client";

export default function DaoVaultPage() {
  return (
    <SiteShell>
      <DaoVaultClient />
    </SiteShell>
  );
}
