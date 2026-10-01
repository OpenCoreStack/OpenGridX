import type { GridColDef } from '@opencorestack/opengridx';

export type InvoiceStatus = 'Open' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: number;
  docNo: string;
  date: Date;
  customer: string;
  region: string;
  amount: number;
  tax: number;
  status: InvoiceStatus;
  posted: boolean;
}

export const STATUSES: InvoiceStatus[] = ['Open', 'Paid', 'Overdue', 'Cancelled'];
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const CUSTOMERS = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Ind', 'Wayne Ent', 'Wonka', 'Tyrell', 'Cyberdyne'];

/** Deterministic LCG so every run (and every browser) sees the same rows. */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function makeInvoices(n: number, seed = 42): Invoice[] {
  const r = rng(seed);
  const base = Date.UTC(2024, 0, 1);
  const out: Invoice[] = [];
  for (let i = 1; i <= n; i++) {
    const amount = Math.round(r() * 1000000) / 100;
    out.push({
      id: i,
      docNo: `INV-${String(i).padStart(6, '0')}`,
      date: new Date(base + Math.floor(r() * 730) * 86400000),
      customer: CUSTOMERS[Math.floor(r() * CUSTOMERS.length)],
      region: REGIONS[Math.floor(r() * REGIONS.length)],
      amount,
      tax: Math.round(amount * 18) / 100,
      status: STATUSES[Math.floor(r() * STATUSES.length)],
      posted: r() > 0.3,
    });
  }
  return out;
}

export const money = (v: unknown): string => (typeof v === 'number' ? v.toFixed(2) : '');

export const invoiceColumns: GridColDef<Invoice>[] = [
  { field: 'docNo', headerName: 'Doc No', width: 130 },
  { field: 'date', headerName: 'Date', type: 'date', width: 120 },
  { field: 'customer', headerName: 'Customer', width: 150 },
  { field: 'region', headerName: 'Region', width: 110 },
  { field: 'amount', headerName: 'Amount', type: 'number', width: 140, valueFormatter: ({ value }) => money(value) },
  { field: 'tax', headerName: 'Tax', type: 'number', width: 120, valueFormatter: ({ value }) => money(value) },
  { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: STATUSES, width: 120 },
  { field: 'posted', headerName: 'Posted', type: 'boolean', width: 90 },
];
