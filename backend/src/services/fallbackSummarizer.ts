import { SummarizeRequest, SummarizeResponse, ResearchRequest, ResearchResponse } from '../types';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll',
  'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with',
  'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours'
]);

export class FallbackSummarizer {
  private static tokenizeSentences(text: string): string[] {
    return text
      .replace(/\r\n/g, '\n')
      .split(/(?<=[.?!])\s+(?=[A-Z0-9"'])/)
      .map(s => s.trim())
      .filter(s => s.length > 20);
  }

  private static tokenizeWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  }

  public static summarize(
    req: SummarizeRequest,
    paymentMeta: { costUsd: string; payer: string; transactionHash?: string; receiptId: string }
  ): SummarizeResponse {
    const rawText = req.text.trim();
    const originalWords = rawText.split(/\s+/).filter(Boolean).length;
    const mode = req.mode || 'executive';

    const sentences = this.tokenizeSentences(rawText);

    if (sentences.length <= 2) {
      // Short text fallback
      return {
        summary: rawText,
        keyPoints: [rawText],
        stats: {
          originalWords,
          summaryWords: originalWords,
          compressionPercentage: 0,
          readingTimeSavedMinutes: 0
        },
        modelUsed: 'MicroPay Fallback Extractive NLP Engine (v1.2)',
        isFallback: true,
        providerNotice: 'Summarized via local extractive NLP engine because GEMINI_API_KEY is not configured or in fallback mode.',
        payment: {
          costUsd: paymentMeta.costUsd,
          payer: paymentMeta.payer,
          transactionHash: paymentMeta.transactionHash,
          settlementTimestamp: new Date().toISOString(),
          receiptId: paymentMeta.receiptId
        }
      };
    }

    // Compute word frequencies
    const wordFreq: Record<string, number> = {};
    for (const sentence of sentences) {
      const words = this.tokenizeWords(sentence);
      for (const w of words) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }

    // Score sentences
    const scored = sentences.map((sentence, index) => {
      const words = this.tokenizeWords(sentence);
      let score = 0;
      for (const w of words) {
        score += wordFreq[w] || 0;
      }
      // Position boost: first and last sentences often contain core thesis
      if (index === 0) score *= 1.4;
      if (index === sentences.length - 1) score *= 1.2;
      // Normalize by word count to prevent bias towards overly long sentences
      const normalizedScore = words.length > 0 ? score / Math.sqrt(words.length) : 0;
      return { sentence, index, score: normalizedScore };
    });

    // Select top sentences based on mode
    let targetSentenceCount = 3;
    if (mode === 'brief') targetSentenceCount = Math.min(2, sentences.length);
    else if (mode === 'executive') targetSentenceCount = Math.max(3, Math.min(5, Math.ceil(sentences.length * 0.35)));
    else if (mode === 'technical') targetSentenceCount = Math.max(4, Math.min(7, Math.ceil(sentences.length * 0.45)));
    else if (mode === 'key-points') targetSentenceCount = Math.max(4, Math.min(6, Math.ceil(sentences.length * 0.4)));

    const topSentences = [...scored]
      .sort((a, b) => b.score - a.score)
      .slice(0, targetSentenceCount)
      .sort((a, b) => a.index - b.index) // Preserve original chronological narrative
      .map(item => item.sentence);

    const summaryText = topSentences.join(' ');
    const summaryWords = summaryText.split(/\s+/).filter(Boolean).length;
    const compression = Math.max(0, Math.round(((originalWords - summaryWords) / originalWords) * 100));
    // Avg reading speed: ~200 words per minute
    const timeSaved = Math.max(0, Number(((originalWords - summaryWords) / 200).toFixed(1)));

    // Extract distinct bullet points
    const keyPoints = topSentences.map(s => {
      // Clean leading conjunctions
      return s.replace(/^(however|furthermore|additionally|moreover|consequently|therefore|in addition|also),?\s+/i, '');
    });

    return {
      summary: summaryText,
      keyPoints,
      stats: {
        originalWords,
        summaryWords,
        compressionPercentage: compression,
        readingTimeSavedMinutes: timeSaved
      },
      modelUsed: 'MicroPay Fallback Extractive NLP Engine (v1.2)',
      isFallback: true,
      providerNotice: 'Summarized via local extractive NLP engine because GEMINI_API_KEY is not configured or in fallback mode.',
      payment: {
        costUsd: paymentMeta.costUsd,
        payer: paymentMeta.payer,
        transactionHash: paymentMeta.transactionHash,
        settlementTimestamp: new Date().toISOString(),
        receiptId: paymentMeta.receiptId
      }
    };
  }

  public static research(
    req: ResearchRequest,
    paymentMeta: { costUsd: string; payer: string; transactionHash?: string; receiptId: string }
  ): ResearchResponse {
    const topic = req.topic.trim();
    const focus = req.focusArea ? ` with specific focus on ${req.focusArea}` : '';
    const isDeep = req.depth === 'deep';

    const executiveBrief = `Comprehensive briefing on "${topic}"${focus}. In autonomous agentic architectures and modern Web3 infrastructure, ${topic} represents a high-impact domain requiring automated micropayment settlement, protocol standardization, and resilient execution pipelines.`;

    const coreInsights = [
      {
        title: 'Decentralized Value Exchange & M2M Dynamics',
        description: `Autonomous systems interacting with ${topic} require frictionless settlement rails (HTTP 402 / EIP-3009) to avoid rigid subscription commitments and prevent platform counterparty lock-in.`
      },
      {
        title: 'Architectural Resilience & Fallbacks',
        description: `Implementing verifiable multi-tier fallback architectures ensures uninterrupted operation when external model APIs or distributed relayers encounter transient network latency.`
      },
      {
        title: 'Economic Efficiency & Cost Compression',
        description: `Shifting compute and data access for ${topic} to streaming, per-request micro-settlement lowers barrier to entry and yields an estimated 65-85% cost saving compared to flat-rate enterprise tiers.`
      }
    ];

    if (isDeep) {
      coreInsights.push({
        title: 'Scalability & Protocol Interoperability',
        description: `Multi-chain support (Base Sepolia, Ethereum L2s, and Solana) combined with gasless authorizations enables scalable agent-to-agent transactional ecosystems.`
      });
    }

    const strategicImplications = [
      `Enables autonomous AI workers to dynamically budget and pay for ${topic} without human credit card interventions.`,
      'Reduces overhead by matching resource consumption directly with programmatic demand.',
      'Establishes cryptographically signed receipts for all micro-transactions, providing verifiable audit trails.'
    ];

    const suggestedNextSteps = [
      `Integrate @x402/fetch client into your autonomous workflow for automated resource procurement.`,
      `Configure spending thresholds and balance monitor hooks on Base Sepolia.`,
      `Benchmark latency and cost per token for continuous optimization.`
    ];

    return {
      topic,
      executiveBrief,
      coreInsights,
      strategicImplications,
      suggestedNextSteps,
      modelUsed: 'MicroPay Fallback Research Synthesis Engine (v1.2)',
      isFallback: true,
      providerNotice: 'Generated via local heuristic research engine because GEMINI_API_KEY is not configured or in fallback mode.',
      payment: {
        costUsd: paymentMeta.costUsd,
        payer: paymentMeta.payer,
        transactionHash: paymentMeta.transactionHash,
        settlementTimestamp: new Date().toISOString(),
        receiptId: paymentMeta.receiptId
      }
    };
  }
}
