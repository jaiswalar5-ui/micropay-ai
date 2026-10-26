import React from 'react';
import {
  Zap,
  ShieldCheck,
  Cpu,
  Coins,
  ArrowRight,
  Sparkles,
  Layers,
  Code2
} from 'lucide-react';

interface LandingHeroProps {
  onStartClick: () => void;
  onExploreMarketplace: () => void;
  onViewProtocol: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartClick,
  onExploreMarketplace,
  onViewProtocol
}) => {
  return (
    <div className="relative overflow-hidden py-14 sm:py-20 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6 backdrop-blur-sm animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>x402 Hackathon Official Submission — Machine-to-Machine HTTP Payments</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Pay-Per-Use AI Services via the{' '}
          <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            x402 Payment Protocol
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Unlock executive text summarization and deep research utilities with small, gasless micropayments.
          No recurring SaaS subscriptions, no credit card lock-ins, and native support for autonomous AI agents.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onStartClick}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Launch Interactive Playground</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreMarketplace}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-sm font-semibold transition-all"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Browse AI Marketplace</span>
          </button>

          <button
            onClick={onViewProtocol}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-brand-400 border border-brand-500/20 text-sm font-medium transition-all"
          >
            <Code2 className="w-4 h-4" />
            <span>Inspect 402 Handshake</span>
          </button>
        </div>

        {/* Value Proposition Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
          <div className="p-4 sm:p-5 rounded-2xl glass-panel-interactive">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Zero Subscriptions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay $0.002 per summary or $0.005 per research brief in USDC. Save over 98% compared to $20/month flat subscriptions.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl glass-panel-interactive">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Native Agentic Economy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous AI agents and LLM tools can consume and pay for endpoints directly via HTTP 402 without human intervention.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl glass-panel-interactive">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Gasless Cryptographic Proof</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Utilizes EIP-712 and EIP-3009 signatures on Base Sepolia. Verifiable receipts with zero client gas costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
