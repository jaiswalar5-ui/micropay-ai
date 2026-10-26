import { AIServiceInfo, TransactionRecord, SystemStats } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4020';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchServices(): Promise<{ services: AIServiceInfo[]; marketplaceMetadata: any }> {
  const res = await fetch(`${API_BASE}/api/services`);
  if (!res.ok) throw new Error(`Failed to fetch services: ${res.statusText}`);
  return res.json();
}

export async function fetchTransactions(limit = 50, payer?: string): Promise<{ transactions: TransactionRecord[]; count: number }> {
  const url = new URL(`${API_BASE}/api/transactions`);
  url.searchParams.set('limit', String(limit));
  if (payer) url.searchParams.set('payer', payer);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.statusText}`);
  return res.json();
}

export async function fetchStats(): Promise<{ stats: SystemStats }> {
  const res = await fetch(`${API_BASE}/api/transactions/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  return res.json();
}

export { API_BASE };
