export interface CurrencyOption {
  symbol: string;
  code: string;
  label: string;
}

export interface PeriodOption {
  value: string;
  label: string;
}

export const CURRENCIES: readonly CurrencyOption[] = [
  { symbol: "$", code: "USD", label: "$ (USD)" },
  { symbol: "€", code: "EUR", label: "€ (EUR)" },
  { symbol: "£", code: "GBP", label: "£ (GBP)" },
  { symbol: "৳", code: "BDT", label: "৳ (BDT)" },
  { symbol: "C$", code: "CAD", label: "C$ (CAD)" },
  { symbol: "A$", code: "AUD", label: "A$ (AUD)" },
  { symbol: "AED", code: "AED", label: "AED (UAE Dirham)" },
  { symbol: "SAR", code: "SAR", label: "SAR (Saudi Riyal)" },
];

/** Formats an amount with its currency; letter-based symbols get a space ("AED 5,000"). */
export function formatMoney(symbol: string, amount: string): string {
  return /^[A-Za-z]+$/.test(symbol) ? `${symbol} ${amount}` : `${symbol}${amount}`;
}

export const PERIODS: readonly PeriodOption[] = [
  { value: "/ yr", label: "Yearly (/ yr)" },
  { value: "/ mo", label: "Monthly (/ mo)" },
  { value: "/ hr", label: "Hourly (/ hr)" },
];

export const DEFAULT_CURRENCY = "$";
export const DEFAULT_PERIOD = "/ yr";
