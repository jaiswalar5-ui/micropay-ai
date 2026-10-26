import { Router, Request, Response } from 'express';
import { config } from '../config';
import { requireX402Payment } from '../middleware/x402Payment';
import { validateBody, summarizeSchema } from '../middleware/validation';
import { AIService } from '../services/aiService';
import { SummarizeRequest } from '../types';

export const summarizeRouter = Router();

summarizeRouter.post(
  '/',
  requireX402Payment({
    serviceId: 'ai-text-summarizer',
    serviceName: 'Executive Text Summarizer',
    priceUsd: config.pricing.summarizeUsd,
    priceAtomic: config.pricing.summarizeAtomic
  }),
  validateBody(summarizeSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = req.x402Payment!;
      const result = await AIService.summarize(req.body as SummarizeRequest, {
        costUsd: payment.amountUsd,
        payer: payment.payer,
        transactionHash: payment.transactionHash,
        receiptId: payment.receiptId
      });

      res.json(result);
    } catch (err: any) {
      console.error('[Summarize Route Error]:', err);
      res.status(500).json({
        error: 'Failed to process AI summarization request.',
        details: err.message
      });
    }
  }
);
