import { Router, Request, Response } from 'express';
import { config } from '../config';
import { AIServiceInfo } from '../types';

export const servicesRouter = Router();

const servicesList: AIServiceInfo[] = [
  {
    id: 'ai-text-summarizer',
    name: 'Executive Text Summarizer',
    description: 'Generates concise executive summaries, key bullet takeaways, and reading compression metrics from raw texts, whitepapers, earnings calls, or research papers.',
    endpoint: '/api/summarize',
    priceUsd: config.pricing.summarizeUsd,
    priceAtomic: config.pricing.summarizeAtomic,
    tokenSymbol: 'USDC',
    network: config.network,
    category: 'text',
    parameters: [
      {
        name: 'text',
        type: 'string',
        required: true,
        description: 'Input text content to analyze and summarize (20 - 50,000 characters).'
      },
      {
        name: 'mode',
        type: 'string',
        required: false,
        description: 'Target format: "executive", "key-points", "technical", or "brief" (default: "executive").'
      },
      {
        name: 'maxLengthWords',
        type: 'number',
        required: false,
        description: 'Approximate maximum target word count for generated summary.'
      }
    ],
    sampleRequest: {
      text: 'Ethereum Layer 2 networks have emerged as the primary scaling solution for high-throughput decentralized applications...',
      mode: 'executive'
    }
  },
  {
    id: 'ai-research-brief',
    name: 'Deep Strategic Research Brief',
    description: 'Autonomous research synthesis providing high-level executive briefs, core domain insights, strategic implications, and actionable recommendations.',
    endpoint: '/api/research',
    priceUsd: config.pricing.researchUsd,
    priceAtomic: config.pricing.researchAtomic,
    tokenSymbol: 'USDC',
    network: config.network,
    category: 'research',
    parameters: [
      {
        name: 'topic',
        type: 'string',
        required: true,
        description: 'Primary research topic or thesis question.'
      },
      {
        name: 'focusArea',
        type: 'string',
        required: false,
        description: 'Specific angle or subfield to emphasize (e.g. "Micro-transactions in AI Multi-Agent Systems").'
      },
      {
        name: 'depth',
        type: 'string',
        required: false,
        description: 'Depth of analysis: "standard" or "deep" (default: "standard").'
      }
    ],
    sampleRequest: {
      topic: 'Autonomous Agentic Micropayments with x402',
      focusArea: 'Machine-to-Machine API monetization',
      depth: 'deep'
    }
  }
];

servicesRouter.get('/', (req: Request, res: Response) => {
  res.json({
    services: servicesList,
    marketplaceMetadata: {
      version: '1.0.0',
      protocol: 'x402 V2 HTTP Payment Standard',
      network: config.network,
      currency: 'USDC (Base Sepolia)',
      receiverAddress: config.paymentReceiverAddress,
      totalServices: servicesList.length
    }
  });
});
