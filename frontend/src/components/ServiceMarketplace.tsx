import React, { useState } from 'react';
import {
  Layers,
  Zap,
  Search,
  Check,
  Copy,
  ExternalLink,
  Cpu,
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';
import { AIServiceInfo } from '../types';

interface ServiceMarketplaceProps {
  services: AIServiceInfo[];
  onSelectService: (serviceId: string) => void;
}

export const ServiceMarketplace: React.FC<ServiceMarketplaceProps> = ({
  services,
  onSelectService
}) => {
  const [filter, setFilter] = useState<'all' | 'text' | 'research'>('all');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const filteredServices = services.filter(s => {
    if (filter === 'all') return true;
    return s.category === filter;
  });

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono font-medium mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Pay-Per-Use Service Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            AI Service Marketplace
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Pay small amounts per API request. No subscriptions, no upfront commitments.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          {(['all', 'text', 'research'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === cat
                  ? 'bg-brand-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Services' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl glass-panel p-6 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top Row: Icon + Price Tag */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform">
                  {service.category === 'research' ? <Search className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>

                <div className="text-right">
                  <div className="inline-flex items-baseline gap-1 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 font-mono font-bold text-sm">
                    <span>${service.priceUsd}</span>
                    <span className="text-[10px] text-slate-400 font-normal">USDC</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {service.priceAtomic} atomic units
                  </p>
                </div>
              </div>

              {/* Service Title & Description */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">
                {service.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                {service.description}
              </p>

              {/* Endpoint Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 mb-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    POST
                  </span>
                  <span className="truncate text-slate-300">{service.endpoint}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(service.endpoint)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Copy endpoint"
                >
                  {copiedEndpoint === service.endpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Parameter Tags */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Request Parameters:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {service.parameters.map((param) => (
                    <span
                      key={param.name}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      title={param.description}
                    >
                      {param.name}{param.required ? '*' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                Base Sepolia
              </span>

              <button
                onClick={() => onSelectService(service.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
              >
                <span>Try in Playground</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
