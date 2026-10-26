import React, { useState } from 'react';
import {
  FileCode,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Cpu,
  Shield,
  Layers,
  Code
} from 'lucide-react';

export const ApiDocs: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'typescript' | 'python' | 'curl'>('typescript');
  const [copiedCode, setCopiedCode] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const codeSnippets = {
    typescript: `import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

// 1. Initialize your autonomous agent's EVM wallet
const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as \`0x\${string}\`);

// 2. Register the exact EVM payment scheme
const client = new x402Client();
registerExactEvmScheme(client, { signer: account });

// 3. Wrap native fetch to intercept 402, sign gasless EIP-3009, and retry seamlessly
const paidFetch = wrapFetchWithPayment(globalThis.fetch, client);

async function runAutonomousTask() {
  console.log("Calling payment-gated AI summarizer...");
  const response = await paidFetch("http://localhost:4020/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "Ethereum Layer 2 networks provide high-throughput scalability...",
      mode: "executive"
    })
  });

  const settlementHeader = response.headers.get("payment-response");
  if (settlementHeader) {
    const receipt = JSON.parse(Buffer.from(settlementHeader, "base64").toString("utf8"));
    console.log("Settlement Receipt ID:", receipt.receiptId);
  }

  const result = await response.json();
  console.log("AI Summary Output:", result.summary);
}

runAutonomousTask();`,

    python: `import os
import time
import json
import base64
import requests
from eth_account import Account
from eth_account.messages import encode_typed_data

# 1. Load Agent Account
private_key = os.getenv("AGENT_PRIVATE_KEY", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
account = Account.from_key(private_key)
url = "http://localhost:4020/api/summarize"

payload = {
    "text": "The x402 protocol enables autonomous machine-to-machine micropayments...",
    "mode": "executive"
}

# Step 1: Send initial request (Expect HTTP 402)
res = requests.post(url, json=payload)
if res.status_code == 402:
    req_header = res.headers.get("PAYMENT-REQUIRED")
    challenge = json.loads(base64.b64decode(req_header).decode("utf-8"))
    accept = challenge["accepts"][0]
    
    # Step 2: Construct and sign EIP-712 TransferWithAuthorization
    domain = {
        "name": "USDC",
        "version": "2",
        "chainId": 84532,
        "verifyingContract": accept["asset"]
    }
    types = {
        "TransferWithAuthorization": [
            {"name": "from", "type": "address"},
            {"name": "to", "type": "address"},
            {"name": "value", "type": "uint256"},
            {"name": "validAfter", "type": "uint256"},
            {"name": "validBefore", "type": "uint256"},
            {"name": "nonce", "type": "bytes32"}
        ]
    }
    nonce = os.urandom(32).hex()
    msg = {
        "from": account.address,
        "to": accept["payTo"],
        "value": int(accept["amount"]),
        "validAfter": 0,
        "validBefore": int(time.time()) + 300,
        "nonce": "0x" + nonce
    }
    
    signable = encode_typed_data(domain_data=domain, message_types=types, message_data=msg)
    signed = account.sign_message(signable)
    
    # Step 3: Resend request with PAYMENT-SIGNATURE
    payment_sig = {
        "x402Version": 2,
        "payload": {
            "authorization": {
                "from": msg["from"],
                "to": msg["to"],
                "value": str(msg["value"]),
                "validAfter": str(msg["validAfter"]),
                "validBefore": str(msg["validBefore"]),
                "nonce": msg["nonce"]
            },
            "signature": signed.signature.hex()
        }
    }
    b64_sig = base64.b64encode(json.dumps(payment_sig).encode("utf-8")).decode("utf-8")
    paid_res = requests.post(url, json=payload, headers={"PAYMENT-SIGNATURE": b64_sig})
    print("Protected AI Result:", paid_res.json()["summary"])`,

    curl: `# 1. Make initial request (Receive HTTP 402)
curl -i -X POST http://localhost:4020/api/summarize \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Decentralized AI agents require machine payments...", "mode": "executive"}'

# 2. Extract PAYMENT-REQUIRED base64 header from response
# Decode the requirements:
# echo "<PAYMENT-REQUIRED-BASE64>" | base64 -d

# 3. Sign the authorization with your wallet and resend with PAYMENT-SIGNATURE
curl -X POST http://localhost:4020/api/summarize \\
  -H "Content-Type: application/json" \\
  -H "PAYMENT-SIGNATURE: <PAYMENT-SIGNATURE-BASE64>" \\
  -d '{"text": "Decentralized AI agents require machine payments...", "mode": "executive"}'`
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono font-medium mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Developer & Agent Integration</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          API Documentation & Agentic Tooling
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          How autonomous AI agents, multi-agent frameworks (LangChain, AutoGen, CrewAI), and backend scripts consume MicroPay AI endpoints.
        </p>
      </div>

      {/* Code Snippets Section */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden mb-12 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {(['typescript', 'python', 'curl'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeLang === lang
                    ? 'bg-brand-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {lang === 'typescript' ? 'TypeScript (SDK)' : lang === 'python' ? 'Python (Agent)' : 'cURL'}
              </button>
            ))}
          </div>

          <button
            onClick={() => copyCode(codeSnippets[activeLang])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Snippet'}</span>
          </button>
        </div>

        <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed bg-slate-950">
          {codeSnippets[activeLang]}
        </pre>
      </div>

      {/* Protocol Headers Specification Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 mb-12">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-400" />
          <span>x402 V2 Header Specification</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          MicroPay AI strictly implements the official x402 HTTP payment protocol headers.
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-yellow-400">PAYMENT-REQUIRED</span>
              <span className="text-[10px] uppercase font-mono text-slate-400">Server → Client (HTTP 402)</span>
            </div>
            <p className="text-slate-300">
              Base64-encoded JSON payload detailing pricing, network (`eip155:84532`), accepted asset (Base Sepolia USDC), and payout destination (`payTo`).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-cyan-400">PAYMENT-SIGNATURE</span>
              <span className="text-[10px] uppercase font-mono text-slate-400">Client → Server (HTTP Retry)</span>
            </div>
            <p className="text-slate-300">
              Base64-encoded JSON containing the signed EIP-712 TransferWithAuthorization payload and cryptographic signature authorizing the transfer.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-400">PAYMENT-RESPONSE</span>
              <span className="text-[10px] uppercase font-mono text-slate-400">Server → Client (HTTP 200)</span>
            </div>
            <p className="text-slate-300">
              Base64-encoded settlement confirmation with receipt ID, transaction proof hash, and on-chain verification timestamp.
            </p>
          </div>
        </div>
      </div>

      {/* Network & Contracts Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 text-xs space-y-3">
          <h4 className="font-bold text-white text-sm">Network Configuration</h4>
          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Chain:</span>
              <span className="text-slate-200">Base Sepolia Testnet</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">CAIP-2 Identifier:</span>
              <span className="text-brand-300">eip155:84532</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">USDC Token:</span>
              <span className="text-slate-300">0x036CbD53842c5426634e7929541eC2318f3dCF7e</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Public Facilitator:</span>
              <span className="text-slate-300">https://x402.org/facilitator</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-800 text-xs space-y-3">
          <h4 className="font-bold text-white text-sm">Testnet Faucets & Funding</h4>
          <p className="text-slate-400 text-xs">
            To fund an external wallet for live Base Sepolia testnet execution:
          </p>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline flex items-center gap-1.5"
              >
                <span>Circle Testnet Faucet (Free Base Sepolia USDC)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline flex items-center gap-1.5"
              >
                <span>Coinbase Base Sepolia Faucet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
          <p className="text-[11px] text-slate-500 italic mt-2">
            Tip: You can also generate an Ephemeral Agent Wallet in MicroPay AI for instant 1-click testing!
          </p>
        </div>
      </div>
    </div>
  );
};
