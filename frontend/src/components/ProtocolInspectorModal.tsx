import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  X
} from 'lucide-react';
import { ProtocolInspectionData } from '../types';

interface ProtocolInspectorModalProps {
  data: ProtocolInspectionData | null;
  onClose: () => void;
}

export const ProtocolInspectorModal: React.FC<ProtocolInspectorModalProps> = ({
  data,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!data) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-925 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">x402 Protocol Inspector</h3>
              <p className="text-xs text-slate-400 font-mono">
                {data.method} {data.endpoint} • Base Sepolia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center gap-2 my-4 border-b border-slate-800/80 pb-3 font-mono text-xs">
          <button
            onClick={() => setActiveTab('step1')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'step1'
                ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>1. 402 Challenge</span>
          </button>

          <button
            onClick={() => setActiveTab('step2')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'step2'
                ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>2. Signed Authorization</span>
          </button>

          <button
            onClick={() => setActiveTab('step3')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'step3'
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. 200 Settlement</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="grow overflow-y-auto font-mono text-xs space-y-4 pr-1">
          {activeTab === 'step1' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Server Response Header: PAYMENT-REQUIRED</span>
                <button
                  onClick={() => handleCopy(data.step1.paymentRequiredHeaderRaw)}
                  className="flex items-center gap-1 text-[11px] text-brand-400 hover:underline"
                >
                  {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Base64</span>
                </button>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Raw Base64 Header Value:</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-yellow-300/90 break-all max-h-24 overflow-y-auto">
                  {data.step1.paymentRequiredHeaderRaw}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Decoded PaymentRequired JSON:</p>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(data.step1.paymentRequiredHeaderParsed, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'step2' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Client Request Header: PAYMENT-SIGNATURE</span>
                <button
                  onClick={() => handleCopy(data.step2.paymentSignatureHeaderRaw)}
                  className="flex items-center gap-1 text-[11px] text-brand-400 hover:underline"
                >
                  {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Base64</span>
                </button>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">EIP-712 Signature:</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300/90 break-all">
                  {data.step2.signature}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Decoded PaymentPayload JSON:</p>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify({
                    authorization: data.step2.authorization,
                    signature: data.step2.signature
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'step3' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Server Response Header: PAYMENT-RESPONSE</span>
                {data.step3.paymentResponseHeaderRaw && (
                  <button
                    onClick={() => handleCopy(data.step3.paymentResponseHeaderRaw)}
                    className="flex items-center gap-1 text-[11px] text-brand-400 hover:underline"
                  >
                    {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Base64</span>
                  </button>
                )}
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Raw Base64 Settlement Header:</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400/90 break-all">
                  {data.step3.paymentResponseHeaderRaw || 'None (In-session delivery)'}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Decoded SettlementResponse JSON:</p>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(data.step3.paymentResponseHeaderParsed, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
