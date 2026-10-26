export type PaymentScheme = 'exact' | 'upto';

export interface X402PaymentRequirement {
  scheme: PaymentScheme;
  network: string;
  amount: string; // in atomic units e.g. "2000" (0.002 USDC)
  asset: string; // token contract
  payTo: string; // receiver address
  maxTimeoutSeconds?: number;
  extra?: {
    name?: string;
    version?: string;
    assetTransferMethod?: string;
    [key: string]: any;
  };
}

export interface X402PaymentRequiredPayload {
  x402Version: number;
  error: string;
  resource: {
    url: string;
    description: string;
    mimeType: string;
  };
  accepts: X402PaymentRequirement[];
}

export interface X402AuthorizationData {
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string;
}

export interface X402PaymentPayload {
  x402Version: number;
  payload: {
    authorization: X402AuthorizationData;
    signature: string;
  };
  resource?: {
    url: string;
    description?: string;
    mimeType?: string;
  };
  accepted?: X402PaymentRequirement;
}

export interface X402SettlementResponse {
  x402Version: number;
  success: boolean;
  settledAt: string;
  transactionHash?: string;
  payer: string;
  payee: string;
  amount: string;
  asset: string;
  network: string;
  scheme: string;
  receiptId: string;
  note?: string;
}

export interface AIServiceInfo {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  priceUsd: string;
  priceAtomic: string;
  tokenSymbol: string;
  network: string;
  category: 'text' | 'research' | 'code';
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  sampleRequest: Record<string, any>;
}

export interface SummarizeRequest {
  text: string;
  mode?: 'executive' | 'key-points' | 'technical' | 'brief';
  maxLengthWords?: number;
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  stats: {
    originalWords: number;
    summaryWords: number;
    compressionPercentage: number;
    readingTimeSavedMinutes: number;
  };
  modelUsed: string;
  isFallback: boolean;
  providerNotice?: string;
  payment: {
    costUsd: string;
    payer: string;
    transactionHash?: string;
    settlementTimestamp: string;
    receiptId: string;
  };
}

export interface ResearchRequest {
  topic: string;
  focusArea?: string;
  depth?: 'standard' | 'deep';
}

export interface ResearchResponse {
  topic: string;
  executiveBrief: string;
  coreInsights: {
    title: string;
    description: string;
  }[];
  strategicImplications: string[];
  suggestedNextSteps: string[];
  modelUsed: string;
  isFallback: boolean;
  providerNotice?: string;
  payment: {
    costUsd: string;
    payer: string;
    transactionHash?: string;
    settlementTimestamp: string;
    receiptId: string;
  };
}

export interface TransactionRecord {
  id: string;
  timestamp: string;
  serviceId: string;
  endpoint: string;
  payer: string;
  payee: string;
  amountAtomic: string;
  amountUsd: string;
  asset: string;
  network: string;
  status: 'settled' | 'verified' | 'failed' | 'challenged';
  signatureSnippet: string;
  transactionHash?: string;
  latencyMs: number;
  ipHash?: string;
}
