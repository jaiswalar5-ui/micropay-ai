import React, { useState } from 'react';
import {
  Activity,
  Coins,
  TrendingDown,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { TransactionRecord, SystemStats } from '../types';
import { shortenAddress, formatRelativeTime } from '../utils/formatters';

interface DashboardProps {
  transactions: TransactionRecord[];
  stats: SystemStats | null;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  stats,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchPayer, setSearchPayer] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);

  const filteredTx = transactions.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchPayer.trim()) {
      const q = searchPayer.toLowerCase();
      return t.payer.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono font-medium mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>On-Chain Settlement Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Usage & Transaction Ledger
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Real-time auditable logs of x402 payment challenges, signatures, and settlements on Base Sepolia.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
        >
          <Activity className="w-3.5 h-3.5 text-brand-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Requests</span>
            <Activity className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">
            {stats?.totalRequests || transactions.length}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {stats?.settledTransactions || 0} successfully settled
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Volume Paid</span>
            <Coins className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">
            ${stats?.totalVolumeUsd || '0.0000'} <span className="text-xs font-normal text-slate-400">USDC</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Base Sepolia testnet
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Cost Savings</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            ${stats?.costSavingsVsSubscriptionUsd || '19.98'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            vs. $20/month SaaS subscriptions
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Average Latency</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">
            {stats?.averageLatencyMs || 350} <span className="text-xs font-normal text-slate-400">ms</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Sub-second verification
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 mb-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'settled', 'challenged', 'failed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filterStatus === st
                  ? 'bg-brand-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by payer address or ID..."
            value={searchPayer}
            onChange={(e) => setSearchPayer(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-925 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Payer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Signature Snippet</th>
                <th className="py-3 px-4 text-right">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTx.length > 0 ? (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatRelativeTime(tx.timestamp)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-200 font-sans">
                        {tx.serviceId === 'ai-text-summarizer' ? 'Executive Summarizer' : 'Research Brief'}
                      </span>
                      <span className="block text-[10px] text-slate-500">{tx.endpoint}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                      {shortenAddress(tx.payer) || 'Anonymous'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-brand-400 font-bold">${tx.amountUsd}</span>
                      <span className="text-[10px] text-slate-500 ml-1">({tx.amountAtomic})</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        tx.status === 'settled'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : tx.status === 'challenged'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {tx.status === 'settled' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'challenged' && <ShieldCheck className="w-3 h-3" />}
                        {tx.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[140px]">
                      {tx.signatureSnippet}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-200"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No transactions match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-white text-base">Payment Settlement Proof</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt ID:</span>
                  <span className="text-slate-200">{selectedTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-200">{selectedTx.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="text-brand-400">{selectedTx.serviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Settled:</span>
                  <span className="text-emerald-400 font-bold">${selectedTx.amountUsd} USDC ({selectedTx.amountAtomic} atomic)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer:</span>
                  <span className="text-slate-200 break-all">{selectedTx.payer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payee:</span>
                  <span className="text-slate-200 break-all">{selectedTx.payee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Network:</span>
                  <span className="text-slate-200">{selectedTx.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">USDC Contract:</span>
                  <span className="text-slate-400">{shortenAddress(selectedTx.asset)}</span>
                </div>
                {selectedTx.transactionHash && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Proof Hash:</span>
                    <span className="text-brand-300 break-all text-[11px]">{selectedTx.transactionHash}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
