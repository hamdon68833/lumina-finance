/**
 * Centralized Currency & Number Formatting Utility for Lumina Finance
 * Follows Indian Numbering Standard (Lakhs / Crores) for Personal Finances
 */

/**
 * Formats a numeric value into INR (Indian Rupee) format with ₹ symbol.
 * Example: 100000 -> "₹1,00,000"
 * Example: 3333 -> "₹3,333"
 */
export function formatINR(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '₹0';
  }
  const num = Number(value);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Format using Indian Numbering System (en-IN)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(absNum);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Formats a monthly value into INR per month format.
 * Example: 3333 -> "₹3,333/mo"
 */
export function formatINRMonthly(value: number | string | null | undefined): string {
  return `${formatINR(value)}/mo`;
}

/**
 * Formats a percentage value.
 * Example: 41.5 -> "41.5%"
 */
export { formatCurrency, formatUSD } from '../../currency_formatter';
