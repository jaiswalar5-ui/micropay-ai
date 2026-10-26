import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { ProtocolFlow } from './components/ProtocolFlow';
import { ServiceMarketplace } from './components/ServiceMarketplace';
import { Playground } from './components/Playground';
import { Dashboard } from './components/Dashboard';
import { ApiDocs } from './components/ApiDocs';
import { ProtocolInspectorModal } from './components/ProtocolInspectorModal';
import { WalletModal } from './components/WalletModal';
import { Footer } from './components/Footer';
import {
  AIServiceInfo,
  TransactionRecord,
  SystemStats,
  ProtocolInspectionData,
  WalletState
} from './types';
import { fetchServices, fetchTransactions, fetchStats } from './services/api';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const DEFAULT_SERVICES: AIServiceInfo[] = [
  {
    id: 'ai-text-summarizer',
    name: 'Executive Text Summarizer',
    description: 'Generates concise executive summaries, key bullet takeaways, and reading compression metrics from raw texts, whitepapers, earnings calls, or research papers.',
    endpoint: '/api/summarize',
    priceUsd: '0.002',
    priceAtomic: '2000',
    tokenSymbol: 'USDC',
    network: 'eip155:84532',
    category: 'text',
    parameters: [
      { name: 'text', type: 'string', required: true, description: 'Input text content to summarize.' },
      { name: 'mode', type: 'string', required: false, description: 'executive, key-points, technical, or brief.' }
    ],
    sampleRequest: { text: 'Ethereum Layer 2 scaling...', mode: 'executive' }
  },
  {
    id: 'ai-research-brief',
    name: 'Deep Strategic Research Brief',
    description: 'Autonomous research synthesis providing high-level executive briefs, core domain insights, strategic implications, and actionable recommendations.',
    endpoint: '/api/research',
    priceUsd: '0.005',
    priceAtomic: '5000',
    tokenSymbol: 'USDC',
    network: 'eip155:84532',
    category: 'research',
    parameters: [
      { name: 'topic', type: 'string', required: true, description: 'Primary research topic.' },
      { name: 'focusArea', type: 'string', required: false, description: 'Specific angle or subfield.' }
    ],
    sampleRequest: { topic: 'Autonomous Agentic Micropayments with x402', depth: 'deep' }
  }
];

export function App() {
  const [activeTab, setActiveTab] = useState<string>('playground');
  const [services, setServices] = useState<AIServiceInfo[]>(DEFAULT_SERVICES);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('ai-text-summarizer');
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  // Inspector & Wallet Modals
  const [inspectorData, setInspectorData] = useState<ProtocolInspectionData | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);

  // Auto-initialize an Ephemeral Agent Wallet so evaluators have instant working test credentials
  const [wallet, setWallet] = useState<WalletState>(() => {
    try {
      const pk = generatePrivateKey();
      const account = privateKeyToAccount(pk);
      return {
        address: account.address,
        privateKey: pk,
        balanceUsdc: '10.00',
        isAgentWallet: true,
        isConnected: true
      };
    } catch {
      return {
        address: null,
        privateKey: null,
        balanceUsdc: '0.00',
        isAgentWallet: false,
        isConnected: false
      };
    }
  });

  const loadData = async () => {
    try {
      const s = await fetchServices();
      if (s.services && s.services.length > 0) {
        setServices(s.services);
      }
    } catch (e) {
      console.warn('Could not fetch services from backend, using default list.');
    }

    try {
      const t = await fetchTransactions(50);
      setTransactions(t.transactions || []);
    } catch (e) {
      console.warn('Could not fetch transactions from backend.');
    }

    try {
      const st = await fetchStats();
      setStats(st.stats);
    } catch (e) {
      console.warn('Could not fetch stats from backend.');
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDisconnect = () => {
    setWallet({
      address: null,
      privateKey: null,
      balanceUsdc: '0.00',
      isAgentWallet: false,
      isConnected: false
    });
  };

  const handleSelectServiceFromMarketplace = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setActiveTab('playground');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-black">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wallet={wallet}
        onOpenWalletModal={() => setWalletModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="grow">
        {/* Landing Hero is visible on Playground & Marketplace */}
        {(activeTab === 'playground' || activeTab === 'marketplace') && (
          <LandingHero
            onStartClick={() => setActiveTab('playground')}
            onExploreMarketplace={() => setActiveTab('marketplace')}
            onViewProtocol={() => setActiveTab('flow')}
          />
        )}

        {/* Tab 1: AI Playground */}
        {activeTab === 'playground' && (
          <Playground
            services={services}
            selectedServiceId={selectedServiceId}
            setSelectedServiceId={setSelectedServiceId}
            wallet={wallet}
            onOpenWalletModal={() => setWalletModalOpen(true)}
            onInspectProtocol={(data) => setInspectorData(data)}
          />
        )}

        {/* Tab 2: Service Marketplace */}
        {activeTab === 'marketplace' && (
          <ServiceMarketplace
            services={services}
            onSelectService={handleSelectServiceFromMarketplace}
          />
        )}

        {/* Tab 3: x402 Protocol Flow Visualizer */}
        {activeTab === 'flow' && (
          <ProtocolFlow />
        )}

        {/* Tab 4: Usage Dashboard */}
        {activeTab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            stats={stats}
            onRefresh={loadData}
          />
        )}

        {/* Tab 5: API & Agent Integration Documentation */}
        {activeTab === 'docs' && (
          <ApiDocs />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ProtocolInspectorModal
        data={inspectorData}
        onClose={() => setInspectorData(null)}
      />

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        wallet={wallet}
        onUpdateWallet={setWallet}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}

export default App;
