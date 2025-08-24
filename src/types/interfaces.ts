export interface LedgerEntry {
  _id?: string;
  date: Date;
  batteryType: 'battery' | 'gutka';
  totalWeight: number;
  ratePerKg: number;
  credit: number;
  debit: number;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LedgerResponse {
  success: boolean;
  data?: LedgerEntry | LedgerEntry[];
  error?: string;
}

export interface DailyBalance {
  date: Date;
  totalCredit: number;
  totalDebit: number;
  balance: number;
}

export interface PDFGenerationResponse {
  success: boolean;
  url?: string;
  error?: string;
}
