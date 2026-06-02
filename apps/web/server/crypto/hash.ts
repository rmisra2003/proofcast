import { createHash } from "node:crypto";

function normalizeJsonValue(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toJSON();
  }

  if (Array.isArray(value)) {
    return value.map((item) => (item === undefined ? null : normalizeJsonValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, normalizeJsonValue(item)])
    );
  }

  return value;
}

export function canonicalize(value: unknown): string {
  const normalized = normalizeJsonValue(value);

  if (normalized === undefined) {
    return "null";
  }

  if (Array.isArray(normalized)) {
    return `[${normalized.map((item) => canonicalize(item)).join(",")}]`;
  }

  if (normalized && typeof normalized === "object") {
    return `{${Object.entries(normalized as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(normalized);
}

export function sha256Hex(value: unknown) {
  const input = typeof value === "string" ? value : canonicalize(value);
  return createHash("sha256").update(input).digest("hex");
}
