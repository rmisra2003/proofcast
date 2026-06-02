import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ProofCast share card";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

async function getProofcast(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch(`${base}/api/proofcast/${id}`, { cache: "no-store" }).catch(() => null);
  if (!response?.ok) return null;
  const payload = (await response.json()) as { proofcast?: Record<string, unknown> };
  return payload.proofcast ?? null;
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proofcast = await getProofcast(id);
  const verification = proofcast?.verification as Record<string, unknown> | undefined;
  const verificationStatus = String(verification?.status ?? "PENDING");
  const headline = proofcast
    ? "This wallet has a permanent onchain memory."
    : "ProofCast not found.";
  const proofLine = proofcast
    ? `ProofCast ID ${id} is ${verificationStatus}: backed by Walrus storage, Tatum Sui RPC intelligence, and Sui proof anchors.`
    : "Capture a live snapshot before sharing a verifiable ProofCast.";
  const proofBadges = proofcast
    ? ["Walrus memory layer", "Tatum intelligence layer", verificationStatus]
    : ["No Walrus proof", "No Tatum checkpoint", "No Sui anchor"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          background:
            "radial-gradient(circle at 20% 0%, rgba(103,232,249,0.36), transparent 360px), radial-gradient(circle at 84% 18%, rgba(192,132,252,0.34), transparent 420px), linear-gradient(135deg, #050712 0%, #08111f 56%, #030407 100%)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                border: "1px solid rgba(103,232,249,0.36)",
                background: "rgba(103,232,249,0.13)",
                fontSize: 24,
                fontWeight: 900
              }}
            >
              PC
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>ProofCast</div>
              <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 22 }}>
                AI-powered verifiable onchain memory
              </div>
            </div>
          </div>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 999,
              padding: "12px 20px",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.78)",
              fontSize: 20
            }}
          >
            Sui + Tatum + Walrus
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ maxWidth: 920, fontSize: 76, lineHeight: 0.95, fontWeight: 950 }}>
            {headline}
          </div>
          <div style={{ maxWidth: 780, color: "rgba(255,255,255,0.66)", fontSize: 30, lineHeight: 1.35 }}>
            {proofLine}
          </div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {proofBadges.map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(255,255,255,0.13)",
                borderRadius: 20,
                padding: "16px 20px",
                background: "rgba(0,0,0,0.28)",
                fontSize: 22
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
