import { createWalletClient, custom, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { API_BASE } from './api';
import { ProtocolInspectionData, WalletState } from '../types';

export type PaymentFlowStep =
  | 'idle'
  | 'initiating'
  | 'challenged_402'
  | 'signing_authorization'
  | 'submitting_payment'
  | 'settled_200'
  | 'error';

export interface X402ExecutionResult<T> {
  data: T;
  inspection: ProtocolInspectionData;
  settlement: any;
}

export async function executeWithX402Payment<T>(
  endpoint: string,
  body: any,
  wallet: WalletState,
  callbacks?: {
    onStepChange?: (step: PaymentFlowStep, message?: string) => void;
    onInspectionData?: (data: ProtocolInspectionData) => void;
  }
): Promise<X402ExecutionResult<T>> {
  const url = `${API_BASE}${endpoint}`;
  callbacks?.onStepChange?.('initiating', 'Sending initial request without payment credentials...');

  // STEP 1: Send initial request (Expect HTTP 402)
  const initialRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (initialRes.status !== 402) {
    if (initialRes.ok) {
      const data = await initialRes.json();
      return { data, inspection: {} as any, settlement: null };
    }
    const errText = await initialRes.text();
    throw new Error(`Expected HTTP 402 challenge from server, got ${initialRes.status}: ${errText}`);
  }

  // Parse PAYMENT-REQUIRED challenge
  callbacks?.onStepChange?.('challenged_402', 'Received HTTP 402: Parsing payment requirements...');
  const paymentRequiredHeader = initialRes.headers.get('payment-required');
  if (!paymentRequiredHeader) {
    throw new Error('Server returned 402 Payment Required but omitted the standard PAYMENT-REQUIRED header.');
  }

  let paymentRequiredParsed: any;
  try {
    paymentRequiredParsed = JSON.parse(atob(paymentRequiredHeader));
  } catch (e) {
    throw new Error('Failed to decode base64 PAYMENT-REQUIRED header from server.');
  }

  const requirement = paymentRequiredParsed.accepts?.[0];
  if (!requirement) {
    throw new Error('Payment challenge accepts array is empty.');
  }

  // Check if wallet is available
  if (!wallet.address) {
    callbacks?.onStepChange?.('error', 'Wallet not connected. Connect a wallet or generate an agent wallet to pay.');
    throw new Error('Please connect a Web3 wallet or generate an Ephemeral Agent Wallet to pay for this request.');
  }

  // STEP 2: Sign Payment Authorization (EIP-712 gasless TransferWithAuthorization)
  callbacks?.onStepChange?.(
    'signing_authorization',
    `Authorizing payment of ${requirement.amount} atomic units ($${(Number(requirement.amount) / 1e6).toFixed(4)} USDC) on Base Sepolia...`
  );

  const nonce = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const nowUnix = Math.floor(Date.now() / 1000);
  const validBefore = BigInt(nowUnix + (requirement.maxTimeoutSeconds || 300));

  const domain = {
    name: 'USDC',
    version: '2',
    chainId: 84532,
    verifyingContract: getAddress(requirement.asset)
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

  const authorizationMessage = {
    from: getAddress(wallet.address),
    to: getAddress(requirement.payTo),
    value: BigInt(requirement.amount),
    validAfter: 0n,
    validBefore,
    nonce: nonce as `0x${string}`
  };

  let signature: string;

  if (wallet.privateKey) {
    // Ephemeral Agent Wallet (Viem Signer)
    const account = privateKeyToAccount(wallet.privateKey as `0x${string}`);
    signature = await account.signTypedData({
      domain,
      types,
      primaryType: 'TransferWithAuthorization',
      message: authorizationMessage
    });
  } else if ((window as any).ethereum) {
    // Injected Browser Wallet (MetaMask / Coinbase Wallet)
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom((window as any).ethereum)
    });

    signature = await walletClient.signTypedData({
      account: getAddress(wallet.address),
      domain,
      types,
      primaryType: 'TransferWithAuthorization',
      message: authorizationMessage
    });
  } else {
    throw new Error('No cryptographic signer available in current environment.');
  }

  // Construct standard x402 PAYMENT-SIGNATURE payload
  const paymentPayload = {
    x402Version: 2,
    payload: {
      authorization: {
        from: authorizationMessage.from,
        to: authorizationMessage.to,
        value: authorizationMessage.value.toString(),
        validAfter: authorizationMessage.validAfter.toString(),
        validBefore: authorizationMessage.validBefore.toString(),
        nonce: authorizationMessage.nonce
      },
      signature
    },
    resource: paymentRequiredParsed.resource,
    accepted: requirement
  };

  const paymentSignatureHeaderRaw = btoa(JSON.stringify(paymentPayload));

  // STEP 3: Resend Request with PAYMENT-SIGNATURE
  callbacks?.onStepChange?.('submitting_payment', 'Submitting request with PAYMENT-SIGNATURE to resource server...');

  const paidRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PAYMENT-SIGNATURE': paymentSignatureHeaderRaw
    },
    body: JSON.stringify(body)
  });

  if (!paidRes.ok) {
    const errData = await paidRes.json().catch(() => ({ error: paidRes.statusText }));
    callbacks?.onStepChange?.('error', errData.error || 'Payment rejected by server');
    throw new Error(errData.error || `Payment verification failed with HTTP ${paidRes.status}`);
  }

  // STEP 4: Parse PAYMENT-RESPONSE settlement header
  const paymentResponseHeader = paidRes.headers.get('payment-response');
  let settlementParsed: any = null;
  if (paymentResponseHeader) {
    try {
      settlementParsed = JSON.parse(atob(paymentResponseHeader));
    } catch (e) {
      console.warn('Could not parse PAYMENT-RESPONSE header JSON');
    }
  }

  const resultData = await paidRes.json();
  callbacks?.onStepChange?.('settled_200', 'Payment verified! Protected AI response fulfilled.');

  const inspection: ProtocolInspectionData = {
    endpoint,
    method: 'POST',
    step1: {
      status: 402,
      paymentRequiredHeaderRaw: paymentRequiredHeader,
      paymentRequiredHeaderParsed: paymentRequiredParsed
    },
    step2: {
      payer: wallet.address,
      authorization: paymentPayload.payload.authorization,
      signature,
      paymentSignatureHeaderRaw
    },
    step3: {
      status: paidRes.status,
      paymentResponseHeaderRaw: paymentResponseHeader || '',
      paymentResponseHeaderParsed: settlementParsed
    }
  };

  callbacks?.onInspectionData?.(inspection);

  return {
    data: resultData as T,
    inspection,
    settlement: settlementParsed
  };
}
