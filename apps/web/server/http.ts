import { NextResponse } from "next/server";
import { MissingEnvError } from "@/server/env/env";
import { ZodError } from "zod";

export function jsonError(error: unknown, status = 500) {
  if (error instanceof MissingEnvError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "MISSING_ENV",
        envName: error.envName
      },
      { status: 503 }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Invalid request.",
        code: "VALIDATION_ERROR",
        details: error.issues
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : String(error),
      code: "SERVER_ERROR"
    },
    { status }
  );
}

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local"
  );
}
