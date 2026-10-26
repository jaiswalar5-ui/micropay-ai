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
}

export interface SystemStats {
  totalRequests: number;
  settledTransactions: number;
  totalVolumeUsd: string;
  averageLatencyMs: number;
  byService: Record<string, number>;
  costSavingsVsSubscriptionUsd: string;
  network: string;
}

export interface ProtocolInspectionData {
  endpoint: string;
  method: string;
  step1: {
    status: number;
    paymentRequiredHeaderRaw: string;
    paymentRequiredHeaderParsed: any;
  };
  step2: {
    payer: string;
    authorization: any;
    signature: string;
    paymentSignatureHeaderRaw: string;
  };
  step3: {
    status: number;
    paymentResponseHeaderRaw: string;
    paymentResponseHeaderParsed: any;
  };
}

export interface WalletState {
  address: string | null;
  privateKey: string | null;
  balanceUsdc: string;
  isAgentWallet: boolean;
  isConnected: boolean;
}
