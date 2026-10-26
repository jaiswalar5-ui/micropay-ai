import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { privateKeyToAccount } from 'viem/accounts';
import { app } from '../src/index';
import { config } from '../src/config';

let server: http.Server;
let baseUrl: string;

const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const testAccount = privateKeyToAccount(TEST_PRIVATE_KEY);

before(async () => {
  await new Promise<void>((resolve) => {
    // Start on random available port
    server = app.listen(0, () => {
      const addr = server.address() as { port: number };
      baseUrl = `http://127.0.0.1:${addr.port}`;
      console.log(`[Test Server] Started at ${baseUrl}`);
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('MicroPay AI Backend Test Suite', () => {
  it('GET /api/health returns 200 with protocol info', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(data.protocol, 'x402 V2');
    assert.strictEqual(data.network, config.network);
  });

  it('GET /api/services returns catalog with pricing', async () => {
    const res = await fetch(`${baseUrl}/api/services`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.services));
    assert.ok(data.services.length >= 2);
    assert.strictEqual(data.services[0].id, 'ai-text-summarizer');
    assert.strictEqual(data.services[1].id, 'ai-research-brief');
  });

  it('GET /api/transactions returns ledger and stats', async () => {
    const res = await fetch(`${baseUrl}/api/transactions`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.transactions));

    const statsRes = await fetch(`${baseUrl}/api/transactions/stats`);
    assert.strictEqual(statsRes.status, 200);
    const statsData = await statsRes.json();
    assert.ok(statsData.stats.totalRequests > 0);
  });

  it('POST /api/summarize WITHOUT payment returns HTTP 402 with PAYMENT-REQUIRED header', async () => {
    const res = await fetch(`${baseUrl}/api/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Decentralized artificial intelligence and micropayment infrastructure enable machine-to-machine value transfer.'
      })
    });

    assert.strictEqual(res.status, 402);
    const requiredHeader = res.headers.get('payment-required');
    assert.ok(requiredHeader, 'PAYMENT-REQUIRED header must be present');

    const decoded = JSON.parse(Buffer.from(requiredHeader, 'base64').toString('utf8'));
    assert.strictEqual(decoded.x402Version, 2);
    assert.strictEqual(decoded.error, 'Payment required');
    assert.strictEqual(decoded.accepts[0].amount, config.pricing.summarizeAtomic);
    assert.strictEqual(decoded.accepts[0].network, config.network);
    assert.strictEqual(decoded.accepts[0].payTo.toLowerCase(), config.paymentReceiverAddress.toLowerCase());
  });

  it('POST /api/summarize with MALFORMED or FAKE signature is rejected with HTTP 402', async () => {
    const fakePayload = {
      x402Version: 2,
      payload: {
        authorization: {
          from: testAccount.address,
          to: config.paymentReceiverAddress,
          value: config.pricing.summarizeAtomic,
          validAfter: '0',
          validBefore: '1893456000',
          nonce: '0x' + 'ff'.repeat(32)
        },
        signature: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b'
      }
    };

    const res = await fetch(`${baseUrl}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYMENT-SIGNATURE': Buffer.from(JSON.stringify(fakePayload)).toString('base64')
      },
      body: JSON.stringify({
        text: 'Decentralized artificial intelligence and micropayment infrastructure enable machine-to-machine value transfer.'
      })
    });

    assert.strictEqual(res.status, 402);
    const data = await res.json();
    assert.ok(data.error.includes('failed') || data.error.includes('signature'));
  });

  it('POST /api/summarize with VALID cryptographic EIP-712 payment returns HTTP 200 and PAYMENT-RESPONSE', async () => {
    // Generate valid EIP-712 authorization signature
    const domain = {
      name: 'USDC',
      version: '2',
      chainId: 84532,
      verifyingContract: config.usdcAssetAddress as `0x${string}`
    };

    const types = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' }
      ]
    };

    const authorization = {
      from: testAccount.address,
      to: config.paymentReceiverAddress as `0x${string}`,
      value: BigInt(config.pricing.summarizeAtomic),
      validAfter: 0n,
      validBefore: 1893456000n,
      nonce: ('0x' + 'aa'.repeat(32)) as `0x${string}`
    };

    const signature = await testAccount.signTypedData({
      domain,
      types,
      primaryType: 'TransferWithAuthorization',
      message: authorization
    });

    const paymentPayload = {
      x402Version: 2,
      payload: {
        authorization: {
          from: authorization.from,
          to: authorization.to,
          value: authorization.value.toString(),
          validAfter: authorization.validAfter.toString(),
          validBefore: authorization.validBefore.toString(),
          nonce: authorization.nonce
        },
        signature
      }
    };

    const res = await fetch(`${baseUrl}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYMENT-SIGNATURE': Buffer.from(JSON.stringify(paymentPayload)).toString('base64')
      },
      body: JSON.stringify({
        text: 'The x402 payment protocol defines a standardized mechanism for internet services to monetize APIs using HTTP status code 402. By incorporating gasless signatures and Layer 2 rails, AI agents can execute automated payments seamlessly without manual subscription billing.',
        mode: 'executive'
      })
    });

    assert.strictEqual(res.status, 200, `Expected 200, received ${res.status}`);
    const settlementHeader = res.headers.get('payment-response');
    assert.ok(settlementHeader, 'PAYMENT-RESPONSE header must be present on successful payment');

    const settlementData = JSON.parse(Buffer.from(settlementHeader, 'base64').toString('utf8'));
    assert.strictEqual(settlementData.success, true);
    assert.strictEqual(settlementData.payer.toLowerCase(), testAccount.address.toLowerCase());
    assert.strictEqual(settlementData.amount, config.pricing.summarizeAtomic);

    const body = await res.json();
    assert.ok(body.summary, 'Summary text must be present');
    assert.ok(Array.isArray(body.keyPoints), 'Key points must be an array');
    assert.ok(body.stats.originalWords > 0);
    assert.strictEqual(body.payment.payer.toLowerCase(), testAccount.address.toLowerCase());
  });

  it('POST /api/research with VALID payment returns HTTP 200 and research brief', async () => {
    const domain = {
      name: 'USDC',
      version: '2',
      chainId: 84532,
      verifyingContract: config.usdcAssetAddress as `0x${string}`
    };

    const types = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' }
      ]
    };

    const authorization = {
      from: testAccount.address,
      to: config.paymentReceiverAddress as `0x${string}`,
      value: BigInt(config.pricing.researchAtomic),
      validAfter: 0n,
      validBefore: 1893456000n,
      nonce: ('0x' + 'bb'.repeat(32)) as `0x${string}`
    };

    const signature = await testAccount.signTypedData({
      domain,
      types,
      primaryType: 'TransferWithAuthorization',
      message: authorization
    });

    const paymentPayload = {
      x402Version: 2,
      payload: {
        authorization: {
          from: authorization.from,
          to: authorization.to,
          value: authorization.value.toString(),
          validAfter: authorization.validAfter.toString(),
          validBefore: authorization.validBefore.toString(),
          nonce: authorization.nonce
        },
        signature
      }
    };

    const res = await fetch(`${baseUrl}/api/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYMENT-SIGNATURE': Buffer.from(JSON.stringify(paymentPayload)).toString('base64')
      },
      body: JSON.stringify({
        topic: 'Autonomous Multi-Agent Micropayments',
        focusArea: 'x402 protocol integration on Base Sepolia',
        depth: 'deep'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.topic, 'Autonomous Multi-Agent Micropayments');
    assert.ok(body.executiveBrief);
    assert.ok(Array.isArray(body.coreInsights));
    assert.ok(body.coreInsights.length >= 3);
  });
});
