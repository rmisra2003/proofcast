import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "Signed wallet authentication is required.",
      code: "SIGNED_AUTH_REQUIRED",
      authFlow: ["/api/auth/nonce", "/api/auth/verify"]
    },
    { status: 410 }
  );
}
