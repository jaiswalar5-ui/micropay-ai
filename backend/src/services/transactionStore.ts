import { TransactionRecord } from '../types';

export class TransactionStore {
  private static transactions: TransactionRecord[] = [];

  static {
    // Seed with initial realistic demo transactions for dashboard visualization
    const now = Date.now();
    const demoRecords: TransactionRecord[] = [
      {
        id: 'tx_rec_01jm90a1b2c3d4e5f6',
        timestamp: new Date(now - 1000 * 60 * 42).toISOString(),
        serviceId: 'ai-text-summarizer',
        endpoint: '/api/summarize',
        payer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        payee: '0xd407e409E34E0b9afb99EcCeb609bDbcD5e7f1bf',
        amountAtomic: '2000',
        amountUsd: '0.002',
        asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        network: 'eip155:84532',
        status: 'settled',
        signatureSnippet: '0x7a7f07f79c0991dcdf97...16d9221b',
        transactionHash: '0x5a1b3c7d9e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b',
        latencyMs: 342
      },
      {
        id: 'tx_rec_01jm90b2c3d4e5f6a7',
        timestamp: new Date(now - 1000 * 60 * 28).toISOString(),
        serviceId: 'ai-research-brief',
        endpoint: '/api/research',
        payer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        payee: '0xd407e409E34E0b9afb99EcCeb609bDbcD5e7f1bf',
        amountAtomic: '5000',
        amountUsd: '0.005',
        asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        network: 'eip155:84532',
        status: 'settled',
        signatureSnippet: '0x4b8e8af8646f8a047d...397b8e11',
        transactionHash: '0x8f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a',
        latencyMs: 820
      },
      {
        id: 'tx_rec_01jm90c3d4e5f6a7b8',
        timestamp: new Date(now - 1000 * 60 * 11).toISOString(),
        serviceId: 'ai-text-summarizer',
        endpoint: '/api/summarize',
        payer: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        payee: '0xd407e409E34E0b9afb99EcCeb609bDbcD5e7f1bf',
        amountAtomic: '2000',
        amountUsd: '0.002',
        asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        network: 'eip155:84532',
        status: 'settled',
        signatureSnippet: '0x9a7e0543bf03fd9bff...9654be63',
        transactionHash: '0x2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f',
        latencyMs: 298
      }
    ];
    this.transactions.push(...demoRecords);
  }

  public static add(record: TransactionRecord): void {
    this.transactions.unshift(record);
    // Keep max 200 records in memory
    if (this.transactions.length > 200) {
      this.transactions.pop();
    }
  }

  public static getAll(limit = 50, payer?: string): TransactionRecord[] {
    let list = this.transactions;
    if (payer) {
      const normalizedPayer = payer.toLowerCase();
      list = list.filter(t => t.payer.toLowerCase() === normalizedPayer);
    }
    return list.slice(0, limit);
  }

  public static getStats() {
    const totalRequests = this.transactions.length;
    const settled = this.transactions.filter(t => t.status === 'settled');
    const totalUsd = settled.reduce((acc, t) => acc + parseFloat(t.amountUsd || '0'), 0);
    const avgLatency = totalRequests > 0
      ? Math.round(this.transactions.reduce((acc, t) => acc + t.latencyMs, 0) / totalRequests)
      : 0;

    const byService = this.transactions.reduce((acc, t) => {
      acc[t.serviceId] = (acc[t.serviceId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cost comparison vs $20 flat subscription
    // Assuming 50 API calls: 50 * $0.002 = $0.10 vs $20.00 = 99.5% savings
    const estimatedSavingsUsd = Math.max(0, 20.00 - totalUsd);

    return {
      totalRequests,
      settledTransactions: settled.length,
      totalVolumeUsd: totalUsd.toFixed(4),
      averageLatencyMs: avgLatency,
      byService,
      costSavingsVsSubscriptionUsd: estimatedSavingsUsd.toFixed(2),
      network: 'Base Sepolia (eip155:84532)'
    };
  }
}
