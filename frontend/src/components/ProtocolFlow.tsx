import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldAlert,
  KeyRound,
  Send,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  Terminal,
  Cpu
} from 'lucide-react';

export const ProtocolFlow: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      title: '1. Initial Unpaid Request',
      actor: 'Client / Agent -> Resource Server',
      icon: Send,
      badge: 'HTTP POST /api/summarize',
      summary: 'Client requests the protected AI service without payment headers.',
      details: 'The user application or autonomous AI agent makes a standard HTTP POST call with the input body (e.g. text to summarize). No payment credentials or credit cards are passed.',
      sampleHeader: 'POST /api/summarize HTTP/1.1\nHost: api.micropay.ai\nContent-Type: application/json\n\n{ "text": "Ethereum L2 scalability...", "mode": "executive" }'
    },
    {
      id: 2,
      title: '2. HTTP 402 Challenge',
      actor: 'Resource Server -> Client',
      icon: ShieldAlert,
      badge: 'HTTP 402 Payment Required',
      summary: 'Server intercepts request and responds with structured payment requirements.',
      details: 'The server rejects the unpaid request with status code 402. It attaches the PAYMENT-REQUIRED header (base64 JSON) containing the required token ($0.002 USDC), target network (Base Sepolia), payTo address, and timeout.',
      sampleHeader: 'HTTP/1.1 402 Payment Required\nPAYMENT-REQUIRED: eyJ4NDAyVmVyc2lvbiI6MiwiYWNjZXB0cyI6W3sic2NoZW1lIjoiZXhhY3QiLCJuZXR3b3JrIjoiZWlwMTU1Ojg0NTMyIiwiYW1vdW50IjoiMjAwMCIsInBheVRvIjoiMHhkNDA3ZTQwOUUzNEUwYjlhZmI5OUVjQ2ViNjA5YkRiY0Q1ZTdmMWJmIiwiYXNzZXQiOiIweDAzNkNiRDUzODQyYzU0MjY2MzRlNzkyOTU0MWVDMjMxOGYzZENGN2UifV19\nContent-Type: application/json'
    },
    {
      id: 3,
      title: '3. Gasless Wallet Authorization',
      actor: 'Buyer Wallet / AI Agent Signer',
      icon: KeyRound,
      badge: 'EIP-712 / EIP-3009 Signature',
      summary: 'The client wallet or agent signs a cryptographic authorization payload.',
      details: 'Using the parameters from the 402 challenge, the client constructs a typed message (from, to, value, nonce, validBefore) and generates an ECDSA signature. This requires zero native gas for the user.',
      sampleHeader: '// EIP-712 Typed Data Domain\n{\n  "name": "USDC",\n  "version": "2",\n  "chainId": 84532,\n  "verifyingContract": "0x036CbD53842c5426634e7929541eC2318f3dCF7e"\n}\n// Signature: 0x7a7f07f79c0991dcdf97d9aae29c6a9c595e25b20353c6af86753e4da74f49ef40dba58977ecc25296a8b4ac06262ec133c4f22c4180680b54d7a321fc16d9221b'
    },
    {
      id: 4,
      title: '4. Retry with PAYMENT-SIGNATURE',
      actor: 'Client -> Resource Server',
      icon: Send,
      badge: 'PAYMENT-SIGNATURE Header',
      summary: 'Client resends the exact request with the authorization proof attached.',
      details: 'The client packs the signed authorization into the standard PAYMENT-SIGNATURE HTTP header and retries the exact same POST request.',
      sampleHeader: 'POST /api/summarize HTTP/1.1\nPAYMENT-SIGNATURE: eyJ4NDAyVmVyc2lvbiI6MiwicGF5bG9hZCI6eyJhdXRob3JpemF0aW9uIjp7ImZyb20iOiIweGYzOV..."}\nContent-Type: application/json\n\n{ "text": "Ethereum L2 scalability...", "mode": "executive" }'
    },
    {
      id: 5,
      title: '5. Verification & Settlement',
      actor: 'Resource Server & Facilitator',
      icon: Lock,
      badge: 'On-Chain Proof Verification',
      summary: 'The server verifies the cryptographic signature against the token requirements.',
      details: 'The resource server extracts the signature, recovers the signer address, validates amount, recipient, expiration, and submits or simulates settlement via the facilitator relayer.',
      sampleHeader: '// Server Verification Logic\nconst recovered = await recoverTypedDataAddress({ domain, types, message, signature });\nassert(recovered.toLowerCase() === payer.toLowerCase());\n// Verified: payer authorized 2000 atomic units to payTo'
    },
    {
      id: 6,
      title: '6. Protected Resource Fulfilled',
      actor: 'Resource Server -> Client',
      icon: CheckCircle2,
      badge: 'HTTP 200 OK + PAYMENT-RESPONSE',
      summary: 'Server delivers the AI summary alongside the settlement receipt.',
      details: 'The server invokes the AI engine (Gemini or Fallback Extractive), attaches the PAYMENT-RESPONSE header containing the receipt ID and transaction hash, and returns HTTP 200.',
      sampleHeader: 'HTTP/1.1 200 OK\nPAYMENT-RESPONSE: eyJ4NDAyVmVyc2lvbiI6Miwic3VjY2VzcyI6dHJ1ZSwicmVjZWlwdElkIjoicmNwdF85ZjA4YjJjM2Q0ZSIsInRyYW5zYWN0aW9uSGFzaCI6IjB4NWExYjNjN2Q5ZTBmMi4uLiJ9\nContent-Type: application/json\n\n{ "summary": "Executive summary...", "keyPoints": [...] }'
    }
  ];

  const current = steps.find(s => s.id === selectedStep) || steps[0];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>HTTP 402 Standard Specification</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          How the x402 Payment Loop Works
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          The HTTP 402 status code turns web requests into autonomous, programmatic micro-settlements.
          Click any step to inspect the protocol headers and cryptographic data.
        </p>
      </div>

      {/* Steps Progress Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          const isSelected = selectedStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setSelectedStep(step.id)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-slate-900 border-brand-500 shadow-md shadow-cyan-500/10 ring-1 ring-brand-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isSelected ? 'bg-brand-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step.id}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`} />
              </div>
              <p className={`text-xs font-semibold leading-tight line-clamp-1 ${
                isSelected ? 'text-white' : 'text-slate-300'
              }`}>
                {step.title.split('. ')[1]}
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{step.actor.split(' -> ')[0]}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Step Detailed Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 text-brand-300 font-mono text-xs border border-slate-700">
            {current.badge}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-1">{current.title}</h3>
            <p className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-400"></span>
              {current.actor}
            </p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{current.details}</p>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <Cpu className="w-3.5 h-3.5 text-brand-400" />
              <span>Why This Matters for AI Agents:</span>
            </div>
            <p>
              Autonomous software agents can read the structured 402 challenge, query their local keystore, sign the gasless EIP-712 authorization, and complete the transaction in under 200ms without user intervention.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              disabled={selectedStep === 1}
              onClick={() => setSelectedStep(s => Math.max(1, s - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-700 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              disabled={selectedStep === 6}
              onClick={() => setSelectedStep(s => Math.min(6, s + 1))}
              className="px-3 py-1.5 rounded-lg bg-brand-500 text-slate-950 font-semibold text-xs disabled:opacity-40 hover:bg-brand-400 flex items-center gap-1"
            >
              Next Step
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Code / Header Preview */}
        <div className="lg:col-span-7">
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-925 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                <span className="text-[11px] text-slate-400 ml-2">Protocol Payload Inspector</span>
              </div>
              <span className="text-[10px] text-brand-400 uppercase tracking-wider font-semibold">x402 V2 Spec</span>
            </div>
            <pre className="p-4 text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
              {current.sampleHeader}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
