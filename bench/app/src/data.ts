import type { GridColDef, GridColumnPinning } from '@opencorestack/opengridx';

// Deterministic benchmark data: a seeded PRNG, so every run and every engine sees the same rows.

export interface BenchRow {
  id: number;
  name: string;
  email: string;
  region: string;
  status: string;
  amount: number;
  price: number;
  quantity: number;
  score: number;
  created: Date;
  active: boolean;
  code: string;
}

export const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'Pacific', 'Atlantic', 'Mountain'];
const STATUSES = ['Open', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];
const FIRST = ['Ada', 'Ben', 'Cleo', 'Dev', 'Elif', 'Femi', 'Gus', 'Hana', 'Ivo', 'Juno', 'Kai', 'Lena', 'Mio', 'Nils', 'Omar', 'Pia'];
const LAST = ['Adams', 'Berg', 'Costa', 'Dahl', 'Eze', 'Fox', 'Grau', 'Haas', 'Ito', 'Jones', 'Kahn', 'Lund', 'Moss', 'Novak', 'Ortiz', 'Park'];

/** mulberry32: a small, fast 32-bit PRNG with a fixed seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRows(count: number, seed: number): BenchRow[] {
  const rand = mulberry32(seed);
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(rand() * list.length)];
  const start = Date.UTC(2020, 0, 1);
  const rows = new Array<BenchRow>(count);
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    rows[i] = {
      id: i,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      region: pick(REGIONS),
      status: pick(STATUSES),
      amount: Math.round(rand() * 1_000_000) / 100,
      price: Math.round(rand() * 50_000) / 100,
      quantity: Math.floor(rand() * 500),
      score: rand() * 100,
      created: new Date(start + Math.floor(rand() * 1_500) * 86_400_000),
      active: rand() < 0.5,
      code: Math.floor(rand() * 0xffffff).toString(16).padStart(6, '0'),
    };
  }
  return rows;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** 12 columns of mixed types; `valueFormatter` on two numbers; `id` and `name` pinned left. */
export const columns: GridColDef<BenchRow>[] = [
  { field: 'id', headerName: 'ID', type: 'number', width: 90 },
  { field: 'name', headerName: 'Name', width: 160 },
  { field: 'email', headerName: 'Email', width: 240 },
  { field: 'region', headerName: 'Region', type: 'singleSelect', valueOptions: REGIONS, width: 130 },
  { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: STATUSES, width: 130 },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'number',
    width: 140,
    valueFormatter: ({ value }) => (typeof value === 'number' ? currency.format(value) : ''),
  },
  {
    field: 'price',
    headerName: 'Price',
    type: 'number',
    width: 120,
    valueFormatter: ({ value }) => (typeof value === 'number' ? `${value.toFixed(2)} €` : ''),
  },
  { field: 'quantity', headerName: 'Qty', type: 'number', width: 100 },
  { field: 'score', headerName: 'Score', type: 'number', width: 110 },
  { field: 'created', headerName: 'Created', type: 'date', width: 140 },
  { field: 'active', headerName: 'Active', type: 'boolean', width: 100 },
  { field: 'code', headerName: 'Code', width: 120 },
];

export const pinnedColumns: GridColumnPinning = { left: ['id', 'name'] };
