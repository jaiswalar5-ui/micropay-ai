import React, { useState } from 'react';
import {
  Wallet,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { WalletState } from '../types';
import { shortenAddress } from '../utils/formatters';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onUpdateWallet: (state: WalletState) => void;
  onDisconnect: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onUpdateWallet,
  onDisconnect
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Option 1: Generate Ephemeral AI Agent Wallet
  const handleGenerateAgentWallet = () => {
    try {
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);

      onUpdateWallet({
        address: account.address,
        privateKey,
        balanceUsdc: '10.00',
        isAgentWallet: true,
        isConnected: true
      });
      setError(null);
      onClose();
    } catch (e: any) {
      setError(`Failed to generate agent wallet: ${e.message}`);
    }
  };

  // Option 2: Use Benchmark Test Account
  const handleUseBenchmarkAccount = () => {
    const testKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const account = privateKeyToAccount(testKey);

    onUpdateWallet({
      address: account.address,
      privateKey: testKey,
      balanceUsdc: '50.00',
      isAgentWallet: true,
      isConnected: true
    });
    setError(null);
    onClose();
  };

  // Option 3: Connect Browser Wallet (MetaMask)
  const handleConnectBrowserWallet = async () => {
    setError(null);
    if (!(window as any).ethereum) {
      setError('No Ethereum browser wallet found. Please install MetaMask or use the 1-Click Agent Wallet below.');
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts'
      });
      if (accounts && accounts.length > 0) {
        onUpdateWallet({
          address: accounts[0],
          privateKey: null,
          balanceUsdc: '5.00',
          isAgentWallet: false,
          isConnected: true
        });
        onClose();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to connect browser wallet.');
    }
  };

  const copyPrivateKey = () => {
    if (wallet.privateKey) {
      navigator.clipboard.writeText(wallet.privateKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-white text-base">
              {wallet.isConnected ? 'Connected Wallet' : 'Connect / Setup Wallet'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {wallet.isConnected ? (
          // Connected View
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="text-brand-300 font-semibold">
                  {wallet.isAgentWallet ? 'Autonomous Agent Keystore' : 'Browser Web3 Wallet'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="text-slate-200">{shortenAddress(wallet.address)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Simulated Balance:</span>
                <span className="text-emerald-400 font-bold">${wallet.balanceUsdc} USDC</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Network:</span>
                <span className="text-slate-300">Base Sepolia (84532)</span>
              </div>

              {wallet.privateKey && (
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">Private Key:</span>
                  <button
                    onClick={copyPrivateKey}
                    className="flex items-center gap-1 text-[11px] text-brand-400 hover:underline"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerateAgentWallet}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
              <button
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
                className="w-1/2 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-500/20 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        ) : (
          // Disconnected View: Options
          <div className="space-y-3">
            {/* Option A: Ephemeral Agent Wallet (Recommended) */}
            <button
              onClick={handleGenerateAgentWallet}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-brand-500/10 to-cyan-500/10 border border-brand-500/30 hover:border-brand-500 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-brand-400" />
                  <span className="font-bold text-white text-xs sm:text-sm">
                    Generate Ephemeral AI Agent Wallet
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500 text-slate-950">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Creates an ephemeral in-memory wallet funded with simulated testnet USDC. Instant 1-click testing with zero browser extensions required.
              </p>
            </button>

            {/* Option B: Benchmark Test Account */}
            <button
              onClick={handleUseBenchmarkAccount}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="font-bold text-slate-200 text-xs sm:text-sm">
                  Use Standard Benchmark Account
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
              </p>
            </button>

            {/* Option C: Browser Extension */}
            <button
              onClick={handleConnectBrowserWallet}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-slate-300" />
                <span className="font-bold text-slate-200 text-xs sm:text-sm">
                  Connect Browser Wallet (MetaMask)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connect your personal wallet configured on the Base Sepolia testnet.
              </p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
