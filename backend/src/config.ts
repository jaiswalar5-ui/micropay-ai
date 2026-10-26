import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  network: string;
  paymentReceiverAddress: string;
  usdcAssetAddress: string;
  facilitatorUrl: string;
  geminiApiKey?: string;
  corsOrigins: string[];
  pricing: {
    summarizeUsd: string;
    summarizeAtomic: string;
    researchUsd: string;
    researchAtomic: string;
  };
}

const parseOrigins = (raw?: string): string[] => {
  if (!raw) return ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
};

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '4020', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  network: process.env.NETWORK || 'eip155:84532',
  paymentReceiverAddress: process.env.PAYMENT_RECEIVER_ADDRESS || '0xd407e409E34E0b9afb99EcCeb609bDbcD5e7f1bf',
  usdcAssetAddress: process.env.USDC_ASSET_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://x402.org/facilitator',
  geminiApiKey: process.env.GEMINI_API_KEY || undefined,
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  pricing: {
    // 0.002 USD = 2000 atomic units for 6-decimal USDC
    summarizeUsd: '0.002',
    summarizeAtomic: '2000',
    // 0.005 USD = 5000 atomic units
    researchUsd: '0.005',
    researchAtomic: '5000',
  }
};
