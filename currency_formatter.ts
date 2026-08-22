export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

/**
 * Centralized Currency Formatter
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: CurrencyCode = "INR",
  options?: { compact?: boolean; precision?: number }
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "Data unavailable";
  }

  const precision = options?.precision ?? (currency === "USD" ? 2 : 0);

  if (currency === "INR") {
    // Standard Indian Numbering System (Lakhs & Crores)
    const absVal = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (options?.compact) {
      if (absVal >= 10000000) return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
      if (absVal >= 100000) return `${sign}₹${(absVal / 100000).toFixed(2)} L`;
      if (absVal >= 1000) return `${sign}₹${(absVal / 1000).toFixed(1)} k`;
      return `${sign}₹${absVal.toLocaleString("en-IN")}`;
    }

    return `${sign}₹${absVal.toLocaleString("en-IN", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    })}`;
  }

  // USD or international currencies
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
  const absVal = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  return `${sign}${symbol}${absVal.toLocaleString("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  })}`;
}

export function formatINR(val: number | null | undefined): string {
  return formatCurrency(val, "INR");
}

export function formatUSD(val: number | null | undefined): string {
  return formatCurrency(val, "USD");
}
