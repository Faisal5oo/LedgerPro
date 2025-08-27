export interface Customer {
  _id?: string;
  name: string;
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
  batteryType: 'battery' | 'gutka';
  totalWeight: number;
  ratePerKg: number;
  credit: number;
  debit: number;
  balance: number;
  weightLogs: WeightLog[];
  notes?: string;
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
  totalWeight: number;
  totalCredit: number;
  totalDebit: number;
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
