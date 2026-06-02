import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/server/http";
import { WalrusService } from "@/server/services/walrus-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ blobId: string }> }) {
  try {
    const { blobId } = await params;
    const verify = request.nextUrl.searchParams.get("verify") === "true";

    if (verify) {
      const expectedHash = request.nextUrl.searchParams.get("hash") ?? undefined;
      const result = await new WalrusService().verifyBlob(blobId, expectedHash);
      return NextResponse.json(result);
    }

    const buffer = await new WalrusService().readBlob(blobId);
    return new Response(buffer, {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
