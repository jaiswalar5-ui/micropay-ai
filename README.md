# ⚡ MicroPay AI

> **Pay-Per-Use AI Microservices Marketplace powered by the x402 HTTP Payment Protocol**  
> *Built for the x402 Hackathon — Enabling Machine-to-Machine Value Exchange on Base Sepolia*

---

## 📌 Executive Summary & Problem Statement

Modern AI monetization relies almost exclusively on **rigid, recurring monthly SaaS subscriptions** ($20–$50/month per tool) or complex enterprise API contracts linked to traditional corporate credit cards.

This model breaks down in two critical scenarios:
1. **Casual & On-Demand Users:** Paying a $20 monthly subscription just to summarize two research papers or audit a snippet of code creates severe subscription fatigue and economic deadweight loss.
2. **Autonomous AI Agents & Swarms:** Autonomous multi-agent systems (e.g. LangChain, AutoGen, CrewAI) lack human identities, bank accounts, and credit cards. When an AI agent needs to dynamically invoke an external tool or data source mid-task, it cannot navigate a human checkout form.

### The Solution: MicroPay AI with x402
**MicroPay AI** transforms HTTP into a native payment rail. Leveraging the open **x402 V2 payment protocol** on **Base Sepolia (Layer 2)**, users and autonomous agents pay negligible micropayments (e.g. **$0.002 per summary**, **$0.005 per research brief**) directly over standard HTTP headers:
- **No accounts, credit cards, or passwords.**
- **No lock-ins:** Pay only for the exact inference you consume.
- **Gasless for clients:** Utilizes cryptographic **EIP-712 / EIP-3009** (`transferWithAuthorization`) signatures.
- **Agentic-Ready:** Any autonomous script can read the `402 Payment Required` challenge, sign the authorization payload with its keystore, and unlock the protected response in sub-second latency.

---

## 🚀 Key Features

- **Executive Text Summarizer (`POST /api/summarize`):**
  - Gated at **$0.002 USDC** (2,000 atomic units).
  - Generates executive-grade summaries, bullet takeaways, compression statistics, and estimated reading time saved.
  - Multi-style output: `executive`, `key-points`, `technical`, and `brief tl;dr`.

- **Deep Strategic Research Brief (`POST /api/research`):**
  - Gated at **$0.005 USDC** (5,000 atomic units).
  - Delivers structured research syntheses: Executive Brief, Core Domain Insights, Strategic Implications, and Actionable Next Steps.

- **Dual-Mode AI Engine (Real Provider + Verifiable Fallback):**
  - Integrated with **Google Gemini 2.5 Flash** when `GEMINI_API_KEY` is provided.
  - Features an intelligent, built-in **Heuristic Extractive NLP Engine** when credentials are omitted.
  - **100% Documentation Integrity:** Never pretends fallback output came from Gemini. Explicitly badges model provenance and fallback notices on every response.

- **Real-Time x402 Protocol Inspector:**
  - Interactive modal displaying the full 3-step handshake:
    1. **HTTP 402 Challenge:** Decodes the `PAYMENT-REQUIRED` base64 header into accepted network, asset, and price specifications.
    2. **EIP-712 Signature:** Displays the client's `PAYMENT-SIGNATURE` authorization.
    3. **HTTP 200 Settlement:** Inspects the `PAYMENT-RESPONSE` settlement receipt ID and transaction proof hash.

- **1-Click Ephemeral Agent Wallet:**
  - Built-in wallet manager capable of generating an in-memory autonomous agent wallet with a single click.
  - Pre-funded with simulated testnet balance for seamless evaluation by hackathon judges without requiring MetaMask or wallet extensions.
  - Also natively supports browser extension wallets (MetaMask / Coinbase Wallet) on Base Sepolia.

- **Auditable Transaction Ledger & Analytics Dashboard:**
  - Tracks total requests, cumulative volume in USDC, average response latency, and cost savings compared to flat subscriptions.
  - Filterable by transaction status (`settled`, `challenged`, `failed`) and searchable by payer address.
  - Individual cryptographic receipt modal for each settled request.

---

## 🏗️ Architecture & Protocol Flow

```
┌────────────────────────┐                   ┌────────────────────────┐                   ┌────────────────────────┐
│  Client / AI Agent     │                   │  MicroPay AI Server    │                   │   x402 Facilitator /   │
│  (Human or Autonomous) │                   │  (Resource Server)     │                   │   Base Sepolia L2      │
└───────────┬────────────┘                   └───────────┬────────────┘                   └───────────┬────────────┘
            │                                            │                                            │
            │  1. HTTP POST /api/summarize               │                                            │
            │  (Body: text to summarize, no headers)     │                                            │
            ├───────────────────────────────────────────>│                                            │
            │                                            │                                            │
            │  2. HTTP 402 Payment Required              │                                            │
            │  Header: PAYMENT-REQUIRED (Base64 JSON)    │                                            │
            │  Price: $0.002, Asset: USDC, Base Sepolia  │                                            │
            │<───────────────────────────────────────────┤                                            │
            │                                            │                                            │
            │  [Agent signs EIP-712 authorization        │                                            │
            │   using local private key or wallet]       │                                            │
            │                                            │                                            │
            │  3. HTTP POST /api/summarize (Retry)       │                                            │
            │  Header: PAYMENT-SIGNATURE (Base64 JSON)   │                                            │
            ├───────────────────────────────────────────>│                                            │
            │                                            │                                            │
            │                                            │  4. Verify Signature & Settle              │
            │                                            │  (recoverTypedDataAddress & L2 check)      │
            │                                            │───────────────────────────────────────────>│
            │                                            │<───────────────────────────────────────────┤
            │                                            │                                            │
            │                                            │  5. Execute AI Generation                  │
            │                                            │  (Gemini 2.5 Flash / Extractive NLP)       │
            │                                            │                                            │
            │  6. HTTP 200 OK + Protected Result         │                                            │
            │  Header: PAYMENT-RESPONSE (Receipt ID)     │                                            │
            │<───────────────────────────────────────────┤                                            │
            │                                            │                                            │
```

---

## 🛠️ Technologies Used & Technical Rationale

| Layer | Technologies | Rationale |
|---|---|---|
| **Protocol** | `@x402/core`, `@x402/express`, `@x402/fetch`, `@x402/evm` | Official x402 V2 specification implementation standardizing HTTP 402 micro-settlements. |
| **Backend** | Node.js, Express, TypeScript | High concurrency, native asynchronous stream processing, type-safe API routing. |
| **Blockchain Rails** | Base Sepolia (Chain ID `84532`), Viem | Low Layer-2 transaction fees, sub-second block times, native Circle USDC testnet availability, type-safe EIP-712 signature verification. |
| **AI Provider** | `@google/genai` (Gemini 2.5 Flash) + Fallback NLP | Ultra-fast multimodal inference with guaranteed uptime through graceful extractive fallback. |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide | Modern developer-tool aesthetic, responsive layout, sub-millisecond hot-reloading, zero-dependency icon rendering. |
| **Testing** | Node.js Native Test Runner (`node:test`, `assert`) | Fast, native, dependency-free automated integration test execution. |

---

## 📁 Repository Structure

```
c:\Internship\
├── backend/
│   ├── src/
│   │   ├── config.ts                    # Safe environment configuration & defaults
│   │   ├── types.ts                     # Protocol interfaces, settlement receipts, AI schemas
│   │   ├── index.ts                     # Express server setup, CORS, error handling
│   │   ├── middleware/
│   │   │   ├── x402Payment.ts           # x402 challenge & EIP-712 verification middleware
│   │   │   ├── rateLimit.ts             # In-memory IP rate limiting
│   │   │   └── validation.ts            # Zod request body validation
│   │   ├── routes/
│   │   │   ├── healthRoute.ts           # GET /api/health
│   │   │   ├── servicesRoute.ts         # GET /api/services (Marketplace catalog)
│   │   │   ├── summarizeRoute.ts        # POST /api/summarize (Payment-gated)
│   │   │   ├── researchRoute.ts         # POST /api/research (Payment-gated)
│   │   │   └── transactionsRoute.ts     # GET /api/transactions & stats
│   │   └── services/
│   │       ├── aiService.ts             # Gemini 2.5 Flash integration + fallback switch
│   │       ├── fallbackSummarizer.ts    # Extractive NLP & research synthesis engine
│   │       └── transactionStore.ts      # In-memory transaction ledger & statistics
│   ├── test/
│   │   └── api.test.ts                  # Automated integration test suite
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                      # Root application layout & state
│   │   ├── index.css                    # Tailwind CSS directives & glassmorphism
│   │   ├── types.ts                     # Frontend interfaces
│   │   ├── components/
│   │   │   ├── Navbar.tsx               # Header, network indicator, wallet connection
│   │   │   ├── LandingHero.tsx          # Problem, solution, CTA hero banner
│   │   │   ├── ProtocolFlow.tsx         # Interactive visual 402 lifecycle stepper
│   │   │   ├── ServiceMarketplace.tsx   # Per-request pricing & service catalog
│   │   │   ├── Playground.tsx           # Interactive AI tool with real-time 402 execution
│   │   │   ├── Dashboard.tsx            # Transaction ledger & usage analytics
│   │   │   ├── ApiDocs.tsx              # Code examples (TypeScript, Python, cURL)
│   │   │   ├── ProtocolInspectorModal.tsx # Header inspector (402, Signature, 200)
│   │   │   ├── WalletModal.tsx          # 1-Click Agent wallet & MetaMask connector
│   │   │   └── Footer.tsx               # Protocol links & network details
│   │   ├── services/
│   │   │   ├── api.ts                   # REST API client
│   │   │   └── x402Client.ts            # Client-side 2-step x402 payment handler
│   │   └── utils/
│   │       └── formatters.ts            # Address & balance formatting
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── scripts/
│   └── dev.js                           # Unified full-stack development launcher
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js:** v18.0.0 or later (v24+ supported)
- **npm:** v9.0.0 or later
- **Git**

### 1. Installation
Clone the repository and install all dependencies for both backend and frontend:

```bash
# Clone the repository
git clone https://github.com/<your-username>/micropay-ai.git
cd micropay-ai

# Install root, backend, and frontend dependencies
npm run install:all
```

*(Alternatively, run `npm install` inside both `backend/` and `frontend/` directories).*

### 2. Environment Configuration
Copy the provided `.env.example` file to create your backend `.env`:

```bash
cp .env.example backend/.env
```

The default values are pre-configured for **Base Sepolia**:
```ini
PORT=4020
NODE_ENV=development
NETWORK=eip155:84532
PAYMENT_RECEIVER_ADDRESS=0xd407e409E34E0b9afb99EcCeb609bDbcD5e7f1bf
USDC_ASSET_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
FACILITATOR_URL=https://x402.org/facilitator
GEMINI_API_KEY=
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

> **Note on AI Key:**  
> Setting `GEMINI_API_KEY` is optional. If left blank, MicroPay AI seamlessly runs its high-performance local extractive engine with clear attribution badges.

### 3. Build & Run Tests
Verify the entire codebase, compilation, and integration test suite:

```bash
# Compile and run the backend automated test suite
npm test

# Expected Output:
# ▶ MicroPay AI Backend Test Suite
#   ✔ GET /api/health returns 200 with protocol info
#   ✔ GET /api/services returns catalog with pricing
#   ✔ GET /api/transactions returns ledger and stats
#   ✔ POST /api/summarize WITHOUT payment returns HTTP 402 with PAYMENT-REQUIRED header
#   ✔ POST /api/summarize with MALFORMED or FAKE signature is rejected with HTTP 402
#   ✔ POST /api/summarize with VALID cryptographic EIP-712 payment returns HTTP 200 and PAYMENT-RESPONSE
#   ✔ POST /api/research with VALID payment returns HTTP 200 and research brief
# ℹ pass 7 | fail 0
```

### 4. Launch Full Application
Start both backend and frontend with a single command:

```bash
npm run dev
```

- **Backend API:** `http://localhost:4020`
- **Frontend App:** `http://localhost:5173`

Open `http://localhost:5173` in your browser. An **Ephemeral AI Agent Wallet** is automatically created on first load so you can click **"Pay & Run"** immediately!

---

## 🤖 Programmatic AI Agent Integration

Autonomous AI agents can consume paid endpoints directly without a browser or UI.

### TypeScript / Node.js Agent (using `@x402/fetch`)

```typescript
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
const client = new x402Client();
registerExactEvmScheme(client, { signer: account });

// Wrap standard fetch to automatically handle 402 challenge & signature retry
const paidFetch = wrapFetchWithPayment(globalThis.fetch, client);

async function summarizeArticle() {
  const response = await paidFetch("http://localhost:4020/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "Autonomous multi-agent systems coordinate over decentralized rails...",
      mode: "executive"
    })
  });

  const data = await response.json();
  console.log("Summary:", data.summary);
  console.log("Cost Paid:", data.payment.costUsd, "USDC");
}

summarizeArticle();
```

### Python Agent (`requests` + `eth_account`)

```python
import os, time, json, base64, requests
from eth_account import Account
from eth_account.messages import encode_typed_data

account = Account.from_key(os.getenv("AGENT_PRIVATE_KEY", "0xac09..."))
url = "http://localhost:4020/api/summarize"
payload = {"text": "Decentralized AI agents coordinate via HTTP...", "mode": "executive"}

# 1. Initial request -> 402 Challenge
res = requests.post(url, json=payload)
if res.status_code == 402:
    req_header = json.loads(base64.b64decode(res.headers.get("PAYMENT-REQUIRED")).decode("utf-8"))
    accept = req_header["accepts"][0]
    
    # 2. Sign EIP-712 Authorization
    domain = {"name": "USDC", "version": "2", "chainId": 84532, "verifyingContract": accept["asset"]}
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
    msg = {
        "from": account.address,
        "to": accept["payTo"],
        "value": int(accept["amount"]),
        "validAfter": 0,
        "validBefore": int(time.time()) + 300,
        "nonce": "0x" + os.urandom(32).hex()
    }
    signed = account.sign_message(encode_typed_data(domain_data=domain, message_types=types, message_data=msg))
    
    # 3. Resend with PAYMENT-SIGNATURE
    payment_sig = {
        "x402Version": 2,
        "payload": {
            "authorization": {k: str(v) for k, v in msg.items()},
            "signature": signed.signature.hex()
        }
    }
    b64_sig = base64.b64encode(json.dumps(payment_sig).encode("utf-8")).decode("utf-8")
    paid_res = requests.post(url, json=payload, headers={"PAYMENT-SIGNATURE": b64_sig})
    print("Protected AI Result:", paid_res.json()["summary"])
```

---

## 📸 Screenshots & Visual Walkthrough

To capture screenshots of the running application for your submission:
1. Start the project: `npm run dev`
2. Open `http://localhost:5173`
3. Capture the following recommended views:

| View | Description | Suggested File Name |
|---|---|---|
| **Landing & Hero** | Hero banner with problem statement, x402 badge, value proposition cards | `docs/screenshots/01-landing-hero.png` |
| **Interactive Playground** | Text input, preset selection, live 402 handshake stepper | `docs/screenshots/02-ai-playground.png` |
| **Protected Output & Receipt** | Generated summary with word metrics, token reduction %, and settlement badge | `docs/screenshots/03-protected-output.png` |
| **Protocol Inspector** | 3-tab modal showing raw base64 and decoded `PAYMENT-REQUIRED` & `PAYMENT-SIGNATURE` headers | `docs/screenshots/04-protocol-inspector.png` |
| **Service Marketplace** | Card grid of available AI tools with per-request pricing and endpoints | `docs/screenshots/05-service-marketplace.png` |
| **Dashboard Ledger** | Audit table of settled requests, latencies, and total volume paid | `docs/screenshots/06-dashboard-ledger.png` |

---

## 🛡️ Security, Reliability & Disclaimers

- **Never Exposes Private Keys:** Client private keys remain strictly in browser memory or external wallet keystores. The server only receives the authorization message and signature.
- **No Fabricated Confirmations:** Unpaid or tampered requests are strictly rejected with HTTP 402. Responses are never unlocked without valid cryptographic proof.
- **Rate Limiting:** Protects against denial-of-service via an IP-based sliding window rate limiter (120 req/min).
- **Testnet Scope:** Operating on **Base Sepolia (Layer 2)** with Circle Testnet USDC (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`). Testnet tokens carry no real financial value and are intended strictly for evaluation.

---

## 📜 License

Licensed under the [Apache License, Version 2.0](LICENSE).
