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
  channel: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  expiredTime?: number; // dalam menit
}

interface TokopayResponse {
  status: boolean;
  error_code?: string;
  error_msg?: string;
  data?: Record<string, unknown>;
  reference_id?: string;
  redirect_url?: string;
  qr_string?: string;
  pay_url?: string;
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

  // Create payment transaction
  async createPayment(params: CreatePaymentParams): Promise<TokopayResponse> {
    const payload = {
      merchant_id: this.config.merchantId,
      ref_id: params.refId,
      amount: params.amount,
      channel: params.channel,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      expired_time: params.expiredTime || 60, // default 1 jam
    };

    // Generate signature
    const signatureString = `${this.config.merchantId}:${params.refId}:${params.amount}`;
    const signature = this.generateSignature(signatureString);

    console.log('💳 Creating Tokopay payment:', {
      ref_id: params.refId,
      amount: params.amount,
      channel: params.channel,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signature}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      console.log('📱 Tokopay payment response:', {
        status: result.status,
        reference_id: result.reference_id,
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

      return await response.json();
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