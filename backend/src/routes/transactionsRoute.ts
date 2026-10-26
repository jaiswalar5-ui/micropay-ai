import { Router, Request, Response } from 'express';
import { TransactionStore } from '../services/transactionStore';

export const transactionsRouter = Router();

transactionsRouter.get('/', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string || '50', 10);
  const payer = req.query.payer as string | undefined;

  const records = TransactionStore.getAll(limit, payer);
  res.json({
    transactions: records,
    count: records.length,
    timestamp: new Date().toISOString()
  });
});

transactionsRouter.get('/stats', (req: Request, res: Response) => {
  const stats = TransactionStore.getStats();
  res.json({
    stats,
    timestamp: new Date().toISOString()
  });
});
