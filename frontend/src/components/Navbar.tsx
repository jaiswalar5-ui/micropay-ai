import React, { useState } from 'react';
import {
  Zap,
  Wallet,
  Bot,
  Activity,
  Layers,
  FileCode,
  Menu,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { WalletState } from '../types';
import { shortenAddress } from '../utils/formatters';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wallet: WalletState;
  onOpenWalletModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  wallet,
  onOpenWalletModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'playground', label: 'AI Playground', icon: Zap },
    { id: 'marketplace', label: 'Services', icon: Layers },
    { id: 'flow', label: 'x402 Protocol', icon: Activity },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'docs', label: 'API & Agents', icon: FileCode },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('playground')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">MicroPay</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 font-mono">x402 HTTP Pay-Per-Use</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Network Pill & Wallet */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Base Sepolia Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-slate-400">Base Sepolia</span>
            </div>

            {/* Wallet Button */}
            <button
              onClick={onOpenWalletModal}
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                wallet.isConnected
                  ? 'bg-slate-900/90 border-brand-500/30 text-white hover:border-brand-500/60'
                  : 'bg-gradient-to-r from-brand-500 to-cyan-400 text-slate-950 font-semibold hover:opacity-95 shadow-lg shadow-cyan-500/15'
              }`}
            >
              {wallet.isConnected ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center">
                    {wallet.isAgentWallet ? <Bot className="w-3.5 h-3.5" /> : <Wallet className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-slate-200 font-semibold">{shortenAddress(wallet.address)}</span>
                    <span className="text-[10px] text-brand-400 ml-1.5">${wallet.balanceUsdc} USDC</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Connect / Agent Wallet</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenWalletModal}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-brand-400"
            >
              <Wallet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-4 space-y-1">
          <div className="flex items-center justify-between py-2 px-3 mb-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400">Network:</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Base Sepolia (eip155:84532)
            </span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-brand-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
