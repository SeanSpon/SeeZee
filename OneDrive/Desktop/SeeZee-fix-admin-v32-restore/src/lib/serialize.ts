// Server-only serializer to convert non-plain values (Prisma Decimal, Date, BigInt)
// into JSON-safe primitives before passing to Client Components.
// Note: Keep this imported only in server files.
import { Decimal } from "@prisma/client/runtime/library";

export function toPlain<T>(input: T): any {
  if (input instanceof Decimal) {
    return input.toString();
  }
  if (input instanceof Date) {
    return input.toISOString();
  }
  if (typeof input === "bigint") {
    return input.toString();
  }
  if (Array.isArray(input)) {
    return input.map((v) => toPlain(v));
  }
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).map(([k, v]) => [k, toPlain(v)])
    );
  }
  return input;
}




