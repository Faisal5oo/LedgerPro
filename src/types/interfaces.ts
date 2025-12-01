export interface Customer {
  _id?: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WeightLog {
  weight: number;
  time: Date;
}

export interface LedgerEntry {
  _id?: string;
  customerId: string;
  customerName?: string; // Virtual field, populated from Customer reference
  date: Date;
  batteryType?: 'battery' | 'gutka'; // Optional for payment-only entries
  totalWeight: number;
  ratePerKg: number;
  credit: number;
  debit: number;
  balance: number;
  weightLogs: WeightLog[];
  notes?: string;
  isPaymentOnly?: boolean;
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

export interface CustomerAccount {
  customer: Customer;
  entries: LedgerEntry[];
  payments: LedgerEntry[]; // Payment-only entries
  totalWeight: number;
  totalCredit: number;
  totalDebit: number;
  totalReceived: number; // Total from payment entries
  netBalance: number;
}

export interface CustomerAccountResponse {
  success: boolean;
  data?: CustomerAccount;
  error?: string;
}

export interface CustomerResponse {
  success: boolean;
  data?: Customer | Customer[];
  error?: string;
}
