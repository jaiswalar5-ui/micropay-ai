import { Router, Request, Response } from 'express';
import { config } from '../config';
import { requireX402Payment } from '../middleware/x402Payment';
import { validateBody, researchSchema } from '../middleware/validation';
import { AIService } from '../services/aiService';
import { ResearchRequest } from '../types';

export const researchRouter = Router();

researchRouter.post(
  '/',
  requireX402Payment({
    serviceId: 'ai-research-brief',
    serviceName: 'Deep Strategic Research Brief',
    priceUsd: config.pricing.researchUsd,
    priceAtomic: config.pricing.researchAtomic
  }),
  validateBody(researchSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = req.x402Payment!;
      const result = await AIService.research(req.body as ResearchRequest, {
        costUsd: payment.amountUsd,
        payer: payment.payer,
        transactionHash: payment.transactionHash,
        receiptId: payment.receiptId
      });

      res.json(result);
    } catch (err: any) {
      console.error('[Research Route Error]:', err);
      res.status(500).json({
        error: 'Failed to process AI research request.',
        details: err.message
      });
    }
  }
);
