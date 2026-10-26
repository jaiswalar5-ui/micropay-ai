import React, { useState } from 'react';
import {
  Zap,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Code2,
  FileText,
  Clock,
  TrendingDown,
  Layers,
  Cpu,
  Info
} from 'lucide-react';
import {
  AIServiceInfo,
  SummarizeResponse,
  ResearchResponse,
  WalletState,
  ProtocolInspectionData
} from '../types';
import { executeWithX402Payment, PaymentFlowStep } from '../services/x402Client';
import { shortenAddress } from '../utils/formatters';

interface PlaygroundProps {
  services: AIServiceInfo[];
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  wallet: WalletState;
  onOpenWalletModal: () => void;
  onInspectProtocol: (data: ProtocolInspectionData) => void;
}

const PRESET_TEXTS = {
  whitepaper: `A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending. We propose a solution to the double-spending problem using a peer-to-peer network. The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work. The longest chain not only serves as the proof of the sequence of events witnessed, but proof that it came from the largest pool of CPU power. As long as a majority of CPU power is controlled by nodes that are not cooperating to attack the network, they will generate the longest chain and outpace attackers. The network itself requires minimal structure. Messages are broadcast on a best effort basis, and nodes can leave and rejoin the network at will, accepting the longest proof-of-work chain as proof of what happened while they were gone.`,
  earnings: `Good afternoon, and welcome to our Third Quarter Fiscal 2026 Financial Results Conference Call. Today, we delivered another quarter of accelerating revenue growth, driven by enterprise adoption of autonomous agentic workflows and real-time inference monetization. Total revenue reached $48.2 billion, up 34% year-over-year, with operating margins expanding by 420 basis points to 38.6%. Our Cloud and AI Infrastructure segment surged 52% to $19.4 billion as enterprise customers transitioned from preliminary experimentation to production deployments. Notably, programmatic API micropayment transactions grew fivefold as machine-to-machine integrations eliminated manual billing overhead. Free cash flow for the quarter was $14.1 billion, representing a free cash flow margin of 29%. Looking forward to Q4, we anticipate continued demand for high-efficiency inferencing pipelines and expect revenue between $51.0 billion and $52.5 billion. We remain committed to disciplined capital allocation and returning surplus value to shareholders.`,
  agentRfc: `RFC-4020: Standardized Machine-to-Machine Value Exchange in Autonomous Agent Swarms. Current Web2 monetization architectures rely almost exclusively on user-based recurring subscription credentials (API keys linked to corporate credit cards). In decentralized autonomous agent systems where thousands of specialized subagents collaborate dynamically, static credentials introduce catastrophic single-points-of-failure, security surface sprawl, and excessive pre-committed overhead. This specification proposes an HTTP-native micropayment loop building upon HTTP status 402. When an agent tool issues a task invocation, the endpoint issues a deterministic cryptographic challenge outlining exact price constraints in Layer 2 stablecoins (such as Base Sepolia USDC). The consuming agent authorizes an atomic transfer authorization via EIP-3009/EIP-712 without incurring user gas. Facilitator relayers settle the authorization on-chain, unlocking instantaneous sub-second response delivery while preserving auditable cryptographic provenance.`
};

export const Playground: React.FC<PlaygroundProps> = ({
  services,
  selectedServiceId,
  setSelectedServiceId,
  wallet,
  onOpenWalletModal,
  onInspectProtocol
}) => {
  // Input states
  const [summarizeText, setSummarizeText] = useState(PRESET_TEXTS.whitepaper);
  const [summarizeMode, setSummarizeMode] = useState<'executive' | 'key-points' | 'technical' | 'brief'>('executive');

  const [researchTopic, setResearchTopic] = useState('Autonomous Agent Micropayments with x402');
  const [researchFocus, setResearchFocus] = useState('Machine-to-machine API monetization on Base Sepolia');
  const [researchDepth, setResearchDepth] = useState<'standard' | 'deep'>('deep');

  // Execution & loading states
  const [flowStep, setFlowStep] = useState<PaymentFlowStep>('idle');
  const [flowMessage, setFlowMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result states
  const [summarizeResult, setSummarizeResult] = useState<SummarizeResponse | null>(null);
  const [researchResult, setResearchResult] = useState<ResearchResponse | null>(null);
  const [lastInspection, setLastInspection] = useState<ProtocolInspectionData | null>(null);
  const [copied, setCopied] = useState(false);

  const isSummarizer = selectedServiceId === 'ai-text-summarizer';
  const currentService = services.find(s => s.id === selectedServiceId) || services[0];

  const handleExecute = async () => {
    setErrorMessage(null);
    setFlowStep('initiating');

    try {
      if (isSummarizer) {
        if (summarizeText.trim().length < 20) {
          throw new Error('Please enter at least 20 characters of text to summarize.');
        }

        const res = await executeWithX402Payment<SummarizeResponse>(
          '/api/summarize',
          { text: summarizeText, mode: summarizeMode },
          wallet,
          {
            onStepChange: (step, msg) => {
              setFlowStep(step);
              if (msg) setFlowMessage(msg);
            },
            onInspectionData: (data) => {
              setLastInspection(data);
            }
          }
        );

        setSummarizeResult(res.data);
      } else {
        if (researchTopic.trim().length < 3) {
          throw new Error('Please enter a research topic of at least 3 characters.');
        }

        const res = await executeWithX402Payment<ResearchResponse>(
          '/api/research',
          {
            topic: researchTopic,
            focusArea: researchFocus,
            depth: researchDepth
          },
          wallet,
          {
            onStepChange: (step, msg) => {
              setFlowStep(step);
              if (msg) setFlowMessage(msg);
            },
            onInspectionData: (data) => {
              setLastInspection(data);
            }
          }
        );

        setResearchResult(res.data);
      }
    } catch (err: any) {
      console.error('Playground execution error:', err);
      setFlowStep('error');
      setErrorMessage(err.message || 'Payment execution failed');
    }
  };

  const handleCopyResult = () => {
    const textToCopy = isSummarizer
      ? `${summarizeResult?.summary}\n\nKey Takeaways:\n${summarizeResult?.keyPoints.map(p => `• ${p}`).join('\n')}`
      : `${researchResult?.executiveBrief}\n\nCore Insights:\n${researchResult?.coreInsights.map(c => `• ${c.title}: ${c.description}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const content = isSummarizer
      ? `# MicroPay AI Summary\n\n**Mode:** ${summarizeMode}\n**Model:** ${summarizeResult?.modelUsed}\n**Settlement:** ${summarizeResult?.payment.costUsd} USDC\n\n## Executive Summary\n${summarizeResult?.summary}\n\n## Key Takeaways\n${summarizeResult?.keyPoints.map(p => `- ${p}`).join('\n')}\n`
      : `# MicroPay AI Research Brief: ${researchResult?.topic}\n\n**Focus Area:** ${researchFocus}\n**Depth:** ${researchDepth}\n**Settlement:** ${researchResult?.payment.costUsd} USDC\n\n## Executive Brief\n${researchResult?.executiveBrief}\n\n## Core Insights\n${researchResult?.coreInsights.map(c => `### ${c.title}\n${c.description}\n`).join('\n')}\n`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isSummarizer ? 'micropay-summary.md' : 'micropay-research.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isExecuting = flowStep === 'initiating' || flowStep === 'challenged_402' || flowStep === 'signing_authorization' || flowStep === 'submitting_payment';

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Service Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setSelectedServiceId('ai-text-summarizer');
              setFlowStep('idle');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              isSummarizer
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Executive Text Summarizer</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono">$0.002</span>
          </button>

          <button
            onClick={() => {
              setSelectedServiceId('ai-research-brief');
              setFlowStep('idle');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              !isSummarizer
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Deep Strategic Research</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono">$0.005</span>
          </button>
        </div>

        {/* Live Wallet & Payment Info */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Payer Account:</span>
            <p className="text-xs font-mono font-semibold text-slate-200">
              {wallet.isConnected ? shortenAddress(wallet.address) : 'No Wallet Connected'}
            </p>
          </div>
          {!wallet.isConnected && (
            <button
              onClick={onOpenWalletModal}
              className="px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold hover:bg-brand-500/20"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form & Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            {isSummarizer ? (
              // Summarizer Input
              <>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                    <span>Input Text to Summarize</span>
                  </label>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">Presets:</span>
                    <button
                      onClick={() => setSummarizeText(PRESET_TEXTS.whitepaper)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      Whitepaper
                    </button>
                    <button
                      onClick={() => setSummarizeText(PRESET_TEXTS.earnings)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      Earnings
                    </button>
                    <button
                      onClick={() => setSummarizeText(PRESET_TEXTS.agentRfc)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      Agent RFC
                    </button>
                  </div>
                </div>

                <textarea
                  value={summarizeText}
                  onChange={(e) => setSummarizeText(e.target.value)}
                  placeholder="Paste article, technical document, report, or message here..."
                  rows={9}
                  className="w-full rounded-xl bg-slate-925 border border-slate-800 px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-sans leading-relaxed resize-y"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 mb-4 font-mono">
                  <span>{summarizeText.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{summarizeText.length} characters</span>
                </div>

                {/* Mode Selectors */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                    Summary Output Style:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'executive', label: 'Executive' },
                      { id: 'key-points', label: 'Key Points' },
                      { id: 'technical', label: 'Technical' },
                      { id: 'brief', label: 'Brief tl;dr' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSummarizeMode(m.id as any)}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-medium border transition-all ${
                          summarizeMode === m.id
                            ? 'bg-slate-800 border-brand-500 text-white font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // Research Input
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 block">
                      Research Topic / Query:
                    </label>
                    <input
                      type="text"
                      value={researchTopic}
                      onChange={(e) => setResearchTopic(e.target.value)}
                      placeholder="e.g. Autonomous Agent Micropayments with x402"
                      className="w-full rounded-xl bg-slate-925 border border-slate-800 px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 block">
                      Specific Focus Area (Optional):
                    </label>
                    <input
                      type="text"
                      value={researchFocus}
                      onChange={(e) => setResearchFocus(e.target.value)}
                      placeholder="e.g. Machine-to-machine API monetization on Base Sepolia"
                      className="w-full rounded-xl bg-slate-925 border border-slate-800 px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                      Research Depth:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setResearchDepth('standard')}
                        className={`py-2 px-3 text-center rounded-xl text-xs font-medium border transition-all ${
                          researchDepth === 'standard'
                            ? 'bg-slate-800 border-brand-500 text-white font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Standard Synthesis
                      </button>
                      <button
                        onClick={() => setResearchDepth('deep')}
                        className={`py-2 px-3 text-center rounded-xl text-xs font-medium border transition-all ${
                          researchDepth === 'deep'
                            ? 'bg-slate-800 border-brand-500 text-white font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Deep Strategic Brief
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Price Pill & Run Button */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Total Due:</span>
                <span className="text-sm font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                  ${currentService.priceUsd} USDC
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({currentService.priceAtomic} atomic)
                </span>
              </div>

              <button
                disabled={isExecuting}
                onClick={handleExecute}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing x402 Loop...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Pay ${currentService.priceUsd} & Run</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-Time x402 Handshake Stepper */}
          <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Cpu className="w-4 h-4 text-brand-400" />
                <span>Live x402 Payment Handshake</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {flowStep === 'idle' ? 'Ready' : flowStep}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
              <div className={`p-2 rounded-lg border ${
                flowStep === 'initiating' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 animate-pulse' :
                flowStep !== 'idle' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                1. Initial Call
              </div>
              <div className={`p-2 rounded-lg border ${
                flowStep === 'challenged_402' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 animate-pulse' :
                ['signing_authorization', 'submitting_payment', 'settled_200'].includes(flowStep) ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                2. HTTP 402
              </div>
              <div className={`p-2 rounded-lg border ${
                flowStep === 'signing_authorization' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 animate-pulse' :
                ['submitting_payment', 'settled_200'].includes(flowStep) ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                3. EIP-712 Sign
              </div>
              <div className={`p-2 rounded-lg border ${
                flowStep === 'settled_200' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' :
                flowStep === 'submitting_payment' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                4. 200 Settled
              </div>
            </div>

            {flowMessage && (
              <p className="mt-2 text-xs text-brand-300 font-mono text-center">
                {flowMessage}
              </p>
            )}

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Payment Challenge Issue</p>
                  <p className="text-[11px] text-red-400 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Protected AI Output & Settlement Receipt */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 min-h-[480px] flex flex-col justify-between">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Protected AI Output
                </span>
              </div>

              {(summarizeResult || researchResult) && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs"
                    title="Download as Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save .md</span>
                  </button>
                  {lastInspection && (
                    <button
                      onClick={() => onInspectProtocol(lastInspection)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500/20 text-xs font-mono font-medium"
                      title="Inspect HTTP 402 Headers"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Inspect 402</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Result Content */}
            <div className="grow">
              {isSummarizer && summarizeResult ? (
                // Summarizer Output
                <div className="space-y-4">
                  {/* Executive Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1.5">
                      Executive Summary
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed bg-slate-925 p-4 rounded-xl border border-slate-800/80">
                      {summarizeResult.summary}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  {summarizeResult.keyPoints?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Key Takeaways
                      </h4>
                      <ul className="space-y-2">
                        {summarizeResult.keyPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0"></span>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Compression Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400">Words</span>
                      <p className="text-xs font-bold text-slate-200">
                        {summarizeResult.stats.originalWords} → {summarizeResult.stats.summaryWords}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Compression</span>
                      <p className="text-xs font-bold text-emerald-400">
                        {summarizeResult.stats.compressionPercentage}% reduction
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Time Saved</span>
                      <p className="text-xs font-bold text-brand-400">
                        ~{summarizeResult.stats.readingTimeSavedMinutes} min
                      </p>
                    </div>
                  </div>
                </div>
              ) : !isSummarizer && researchResult ? (
                // Research Output
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1.5">
                      Executive Research Brief
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed bg-slate-925 p-4 rounded-xl border border-slate-800/80">
                      {researchResult.executiveBrief}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Core Domain Insights
                    </h4>
                    <div className="space-y-2">
                      {researchResult.coreInsights.map((insight, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                        >
                          <span className="font-bold text-brand-300 block mb-0.5">
                            {insight.title}
                          </span>
                          <span className="text-slate-300 leading-relaxed">{insight.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Strategic Implications
                    </h4>
                    <ul className="space-y-1.5">
                      {researchResult.strategicImplications.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-1">
                    Ready for x402 Execution
                  </h4>
                  <p className="text-xs max-w-sm text-slate-400 mb-4">
                    Configure your input text on the left, then click "Pay & Run". The request will initiate an HTTP 402 payment challenge and settle instantly.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-brand-400/80 font-mono bg-brand-500/5 px-3 py-1 rounded-full border border-brand-500/10">
                    <CheckCircle2 className="w-3 h-3 text-brand-400" />
                    <span>Fixed per-request billing • Base Sepolia</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Payment Receipt Badge */}
            {(summarizeResult || researchResult) && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-300">Verified x402 Payment</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {(summarizeResult?.payment || researchResult?.payment)?.receiptId}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Payer: {shortenAddress((summarizeResult?.payment || researchResult?.payment)?.payer)} • Cost: ${(summarizeResult?.payment || researchResult?.payment)?.costUsd} USDC
                      </p>
                    </div>
                  </div>

                  {/* Model tag */}
                  <div className="text-right self-end sm:self-auto">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 block">
                      {(summarizeResult || researchResult)?.modelUsed}
                    </span>
                    {(summarizeResult || researchResult)?.isFallback && (
                      <span className="text-[9px] text-yellow-400 font-mono">
                        Extractive Fallback
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
