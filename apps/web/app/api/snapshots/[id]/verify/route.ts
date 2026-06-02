import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/server/http";
import { VerificationEngine } from "@/server/services/verification-engine";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await new VerificationEngine().verifySnapshot(id);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return POST(request, context);
}
