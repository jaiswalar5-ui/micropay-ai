import React from 'react';
import { Zap, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              </div>
              <span className="font-bold text-white text-sm">MicroPay AI</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Pay-per-use AI service marketplace powered by the x402 HTTP Payment Standard and Base Sepolia.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>x402 V2 Protocol Ready</span>
            </div>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Protocol</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.x402.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Official x402 Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/coinbase/x402"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Coinbase / x402 GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://x402.org/facilitator/supported"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Facilitator Supported Kinds</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Base Sepolia Network */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Testnet & Rails</h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li>
                <a
                  href="https://sepolia.basescan.org/token/0x036CbD53842c5426634e7929541eC2318f3dCF7e"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-300 transition-colors flex items-center gap-1"
                >
                  <span>USDC on BaseScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-300 transition-colors flex items-center gap-1"
                >
                  <span>Circle USDC Faucet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-300 transition-colors flex items-center gap-1"
                >
                  <span>Coinbase Base Faucet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Architecture */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Hackathon Architecture</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Built with Node.js, Express, TypeScript, Viem, React, and official @x402 SDK packages. Full EIP-712 cryptographic settlement verification.
            </p>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
              <span>Base Sepolia</span>
              <span>•</span>
              <span>EIP-3009</span>
              <span>•</span>
              <span>Gemini 2.5</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 MicroPay AI. Open source under Apache 2.0 License.</p>
          <p className="font-mono">Submission Ready for x402 Hackathon</p>
        </div>
      </div>
    </footer>
  );
};
