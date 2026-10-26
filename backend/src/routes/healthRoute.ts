import { Router, Request, Response } from 'express';
import { config } from '../config';

export const healthRouter = Router();

const startedAt = new Date().toISOString();

healthRouter.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    protocol: 'x402 V2',
    network: config.network,
    paymentReceiver: config.paymentReceiverAddress,
    usdcAsset: config.usdcAssetAddress,
    facilitatorUrl: config.facilitatorUrl,
    aiProvider: {
      hasGeminiApiKey: Boolean(config.geminiApiKey),
      activeEngine: config.geminiApiKey ? 'Google Gemini 2.5 Flash' : 'MicroPay Fallback Extractive NLP'
    },
    uptimeSeconds: Math.floor(process.uptime()),
    startedAt,
    timestamp: new Date().toISOString()
  });
});
