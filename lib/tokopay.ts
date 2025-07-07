// Tokopay API Client
import { createHmac } from 'crypto';

interface TokopayConfig {
  merchantId: string;
  secretKey: string;
  baseUrl: string;
}

interface CreatePaymentParams {
  refId: string;
  amount: number;
  channel: string; // QRIS, BRIVA, BNIK, dll
}

interface TokopayResponse {
  status: string; // "Success" atau "Failed"
  error_code?: string;
  error_msg?: string;
  data?: {
    pay_url?: string;
    qr_link?: string;
    qr_string?: string;
    total_bayar?: number;
    total_diterima?: number;
    trx_id?: string;
    other?: string;
    panduan_pembayaran?: string;
  };
}

interface WebhookData {
  reference_id: string;
  merchant_id: string;
  amount: number;
  fee: number;
  status: string;
  paid_at: string;
  signature: string;
}

export class TokopayAPI {
  private config: TokopayConfig;

  constructor(config: TokopayConfig) {
    this.config = config;
  }

  // Generate signature untuk request
  private generateSignature(data: string): string {
    return createHmac('sha256', this.config.secretKey)
      .update(data)
      .digest('hex');
  }

  // Create payment transaction sesuai dokumentasi resmi Tokopay
  async createPayment(params: CreatePaymentParams): Promise<TokopayResponse> {
    // Format sesuai docs: GET /v1/order?merchant=XXX&secret=XXX&ref_id=XXX&nominal=XXX&metode=XXX
    const queryParams = new URLSearchParams({
      merchant: this.config.merchantId,
      secret: this.config.secretKey,
      ref_id: params.refId,
      nominal: params.amount.toString(),
      metode: params.channel // QRIS, BRIVA, dll
    });

    console.log('💳 Creating Tokopay payment:', {
      ref_id: params.refId,
      amount: params.amount,
      channel: params.channel,
      timestamp: new Date().toISOString()
    });

    try {
      const url = `${this.config.baseUrl}/v1/order?${queryParams.toString()}`;
      
      console.log('🔗 Tokopay request URL:', url.replace(this.config.secretKey, 'SECRET_HIDDEN'));

      const response = await fetch(url, {
        method: 'GET', // Sesuai dokumentasi: GET request
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json() as TokopayResponse;
      
      console.log('📱 Tokopay payment response:', {
        status: result.status,
        trx_id: result.data?.trx_id,
        response: result
      });

      return result;
    } catch (error) {
      console.error('❌ Tokopay payment error:', error);
      throw new Error('Failed to create payment');
    }
  }

  // Check payment status
  async checkPayment(refId: string): Promise<TokopayResponse> {
    const signatureString = `${this.config.merchantId}:${refId}`;
    const signature = this.generateSignature(signatureString);

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/payment/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signature}`,
        },
        body: JSON.stringify({
          merchant_id: this.config.merchantId,
          ref_id: refId,
        }),
      });

      return await response.json() as TokopayResponse;
    } catch (error) {
      console.error('❌ Tokopay check payment error:', error);
      throw new Error('Failed to check payment status');
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(data: WebhookData): boolean {
    const signatureString = `${data.merchant_id}:${data.reference_id}:${data.amount}:${data.status}`;
    const expectedSignature = this.generateSignature(signatureString);
    
    return data.signature === expectedSignature;
  }
}

// Factory function
export function createTokopayAPI(): TokopayAPI {
  const config: TokopayConfig = {
    merchantId: process.env.TOKOPAY_MERCHANT_ID || '',
    secretKey: process.env.TOKOPAY_SECRET_KEY || '',
    baseUrl: process.env.TOKOPAY_BASE_URL || 'https://api.tokopay.id',
  };

  if (!config.merchantId || !config.secretKey) {
    throw new Error('Tokopay credentials not found in environment variables');
  }

  return new TokopayAPI(config);
} 