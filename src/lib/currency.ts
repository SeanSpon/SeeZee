// Utilities for money/currency handling on the server
// Converts a decimal-like amount to the integer number of cents without precision loss
export function toStripeCents(amount: string | number): number {
  if (typeof amount === "number") {
    return Math.round(amount * 100);
  }
  const trimmed = amount.trim();
  if (trimmed.length === 0) return 0;
  const negative = trimmed.startsWith("-");
  const normalized = negative ? trimmed.slice(1) : trimmed;
  const [intPart, fracPart = ""] = normalized.split(".");
  const frac = (fracPart + "00").slice(0, 2);
  // Use BigInt for safe integer math, then convert back
  const centsBigInt = BigInt(intPart || "0") * BigInt(100) + BigInt(frac);
  const result = Number(centsBigInt);
  return negative ? -result : result;
}




