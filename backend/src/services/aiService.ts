import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { SummarizeRequest, SummarizeResponse, ResearchRequest, ResearchResponse } from '../types';
import { FallbackSummarizer } from './fallbackSummarizer';

export class AIService {
  private static geminiClient: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    if (!this.geminiClient && config.geminiApiKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
    }
    return this.geminiClient;
  }

  public static async summarize(
    req: SummarizeRequest,
    paymentMeta: { costUsd: string; payer: string; transactionHash?: string; receiptId: string }
  ): Promise<SummarizeResponse> {
    const rawText = req.text.trim();
    const originalWords = rawText.split(/\s+/).filter(Boolean).length;
    const mode = req.mode || 'executive';

    const client = this.getClient();

    if (!client) {
      console.log('[AI Service] GEMINI_API_KEY not configured. Using local extractive engine.');
      return FallbackSummarizer.summarize(req, paymentMeta);
    }

    try {
      console.log('[AI Service] Calling Google Gemini API with model: gemini-2.5-flash...');
      const prompt = `You are a high-performance summarization AI in MicroPay AI marketplace.
Analyze the following text and generate an optimal summary tailored to mode: "${mode}".
Format your response as valid JSON matching this schema:
{
  "summary": "Cohesive, executive-grade summary text...",
  "keyPoints": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ]
}

Text to summarize:
${rawText}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      const responseText = response.text?.trim() || '';
      let parsed: { summary: string; keyPoints: string[] };

      try {
        parsed = JSON.parse(responseText);
      } catch (parseErr) {
        // Fallback cleanup if model wraps in code fences
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const summaryWords = parsed.summary.split(/\s+/).filter(Boolean).length;
      const compression = Math.max(0, Math.round(((originalWords - summaryWords) / originalWords) * 100));
      const timeSaved = Math.max(0, Number(((originalWords - summaryWords) / 200).toFixed(1)));

      return {
        summary: parsed.summary,
        keyPoints: parsed.keyPoints || [],
        stats: {
          originalWords,
          summaryWords,
          compressionPercentage: compression,
          readingTimeSavedMinutes: timeSaved
        },
        modelUsed: 'Google Gemini 2.5 Flash',
        isFallback: false,
        payment: {
          costUsd: paymentMeta.costUsd,
          payer: paymentMeta.payer,
          transactionHash: paymentMeta.transactionHash,
          settlementTimestamp: new Date().toISOString(),
          receiptId: paymentMeta.receiptId
        }
      };
    } catch (err: any) {
      console.warn('[AI Service] Gemini API failed. Falling back gracefully to extractive engine:', err.message);
      const fallbackResult = FallbackSummarizer.summarize(req, paymentMeta);
      fallbackResult.providerNotice = `Provider Gemini API encountered an issue (${err.message}). Seamlessly delivered via MicroPay Fallback Engine.`;
      return fallbackResult;
    }
  }

  public static async research(
    req: ResearchRequest,
    paymentMeta: { costUsd: string; payer: string; transactionHash?: string; receiptId: string }
  ): Promise<ResearchResponse> {
    const client = this.getClient();

    if (!client) {
      console.log('[AI Service] GEMINI_API_KEY not configured. Using local research engine.');
      return FallbackSummarizer.research(req, paymentMeta);
    }

    try {
      console.log('[AI Service] Calling Google Gemini API for Deep Research on topic:', req.topic);
      const prompt = `You are an elite research analyst in MicroPay AI marketplace.
Conduct a structured research brief on the topic: "${req.topic}".
Focus Area: ${req.focusArea || 'General strategic & technical impact'}.
Depth: ${req.depth || 'standard'}.

Format your response strictly as valid JSON matching this schema:
{
  "executiveBrief": "2-3 paragraphs synthesizing the strategic state of this topic...",
  "coreInsights": [
    { "title": "Insight Title", "description": "Detailed explanation..." }
  ],
  "strategicImplications": [
    "Strategic implication 1",
    "Strategic implication 2"
  ],
  "suggestedNextSteps": [
    "Actionable step 1",
    "Actionable step 2"
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const responseText = response.text?.trim() || '';
      let parsed: any;
      try {
        parsed = JSON.parse(responseText);
      } catch (parseErr) {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      return {
        topic: req.topic,
        executiveBrief: parsed.executiveBrief,
        coreInsights: parsed.coreInsights || [],
        strategicImplications: parsed.strategicImplications || [],
        suggestedNextSteps: parsed.suggestedNextSteps || [],
        modelUsed: 'Google Gemini 2.5 Flash',
        isFallback: false,
        payment: {
          costUsd: paymentMeta.costUsd,
          payer: paymentMeta.payer,
          transactionHash: paymentMeta.transactionHash,
          settlementTimestamp: new Date().toISOString(),
          receiptId: paymentMeta.receiptId
        }
      };
    } catch (err: any) {
      console.warn('[AI Service] Gemini Research failed. Falling back gracefully:', err.message);
      const fallback = FallbackSummarizer.research(req, paymentMeta);
      fallback.providerNotice = `Provider Gemini API encountered an issue (${err.message}). Seamlessly delivered via MicroPay Fallback Research Engine.`;
      return fallback;
    }
  }
}
