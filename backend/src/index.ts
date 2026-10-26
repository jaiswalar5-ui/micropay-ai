import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { rateLimiter } from './middleware/rateLimit';
import { healthRouter } from './routes/healthRoute';
import { servicesRouter } from './routes/servicesRoute';
import { summarizeRouter } from './routes/summarizeRoute';
import { researchRouter } from './routes/researchRoute';
import { transactionsRouter } from './routes/transactionsRoute';

export const app = express();

// Middleware: CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server agents)
    if (!origin) return callback(null, true);
    if (config.corsOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly permissive CORS for hackathon evaluation
  },
  exposedHeaders: ['PAYMENT-REQUIRED', 'PAYMENT-RESPONSE', 'Content-Type', 'Retry-After'],
  credentials: true
}));

// Middleware: Body parsing
app.use(express.json({ limit: '2mb' }));

// Middleware: General rate limiter (120 requests per minute per IP)
app.use(rateLimiter({ maxRequests: 120, windowMs: 60 * 1000 }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount Routes
app.use('/api/health', healthRouter);
app.use('/api/services', servicesRouter);
app.use('/api/summarize', summarizeRouter);
app.use('/api/research', researchRouter);
app.use('/api/transactions', transactionsRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/services',
      'POST /api/summarize (x402 payment-gated)',
      'POST /api/research (x402 payment-gated)',
      'GET /api/transactions',
      'GET /api/transactions/stats'
    ]
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Global Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred.'
  });
});

// Start Server only when executed directly (not when imported for tests)
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`
=====================================================
  MicroPay AI Server Running on port ${config.port}
  x402 Payment Protocol: V2 Enabled
  Network: ${config.network}
  Receiver Address: ${config.paymentReceiverAddress}
  USDC Contract: ${config.usdcAssetAddress}
  AI Engine: ${config.geminiApiKey ? 'Google Gemini 2.5 Flash' : 'MicroPay Fallback Extractive Engine'}
=====================================================
    `);
  });
}
