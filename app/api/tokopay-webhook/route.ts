import { NextRequest, NextResponse } from 'next/server';
import { createTokopayAPI } from '../../../lib/tokopay';
import { createFonnteAPI } from '../../../lib/fonnte';

interface TokopayWebhookData {
  reference_id: string;
  merchant_id: string;
  amount: number;
  fee: number;
  status: string; // SUCCESS, FAILED, PENDING
  paid_at: string;
  signature: string;
  customer_name?: string;
  customer_phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const webhookData: TokopayWebhookData = await request.json();
    
    console.log('🔔 Tokopay webhook received:', {
      reference_id: webhookData.reference_id,
      status: webhookData.status,
      amount: webhookData.amount,
      timestamp: new Date().toISOString()
    });

    // Verify webhook signature
    const tokopayAPI = createTokopayAPI();
    const isValidSignature = tokopayAPI.verifyWebhookSignature(webhookData);
    
    if (!isValidSignature) {
      console.error('❌ Invalid Tokopay webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Process payment notification
    await processPaymentNotification(webhookData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });
    
  } catch (error) {
    console.error('❌ Error processing Tokopay webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function processPaymentNotification(data: TokopayWebhookData) {
  const fonnteAPI = createFonnteAPI();
  
  // Extract phone number dari reference_id (format: payment_PHONENUMBER_timestamp)
  const phoneNumber = extractPhoneFromRefId(data.reference_id);
  
  if (!phoneNumber) {
    console.error('❌ Cannot extract phone number from reference_id:', data.reference_id);
    return;
  }

  if (data.status === 'SUCCESS') {
    // Payment berhasil
    console.log('✅ Payment successful for:', phoneNumber);
    
    const successMessage = `🎉 *Pembayaran Berhasil!*

✅ Terima kasih sudah melakukan pembayaran
💰 Jumlah: Rp ${data.amount.toLocaleString('id-ID')}
🔗 ID Transaksi: ${data.reference_id}
⏰ Dibayar: ${formatDateTime(data.paid_at)}

📦 *Status Pesanan:*
🔄 Sedang diproses...

Kami akan segera memproses pesanan kamu. Terima kasih sudah berbelanja! 😊`;

    await fonnteAPI.sendMessage({
      target: phoneNumber,
      message: successMessage
    });

    // Tunggu 3 detik, lalu kirim update proses pesanan
    setTimeout(async () => {
      const processMessage = `📦 *Update Pesanan*

🔄 Pesanan kamu sedang dalam proses pengemasan...
⏱️ Estimasi selesai: 10-15 menit

Harap tunggu ya! 😊`;

      await fonnteAPI.sendMessage({
        target: phoneNumber,
        message: processMessage
      });

      // Tunggu 5 detik lagi, kirim pesanan selesai
      setTimeout(async () => {
        const completeMessage = `✅ *Pesanan Selesai!*

🎊 Yeay! Pesanan kamu sudah selesai diproses
📦 Status: Siap untuk diambil/dikirim
🚀 Terima kasih sudah berbelanja dengan kami!

Semoga puas dengan pelayanan kami! 🙏`;

        await fonnteAPI.sendMessage({
          target: phoneNumber,
          message: completeMessage
        });

      }, 5000);

    }, 3000);

  } else if (data.status === 'FAILED') {
    // Payment gagal
    console.log('❌ Payment failed for:', phoneNumber);
    
    const failedMessage = `❌ *Pembayaran Gagal*

Maaf, pembayaran kamu gagal diproses.
💰 Jumlah: Rp ${data.amount.toLocaleString('id-ID')}
🔗 ID Transaksi: ${data.reference_id}

Silakan coba lagi atau hubungi customer service jika butuh bantuan.
Ketik "bayar" untuk mencoba pembayaran lagi.`;

    await fonnteAPI.sendMessage({
      target: phoneNumber,
      message: failedMessage
    });

  } else if (data.status === 'PENDING') {
    // Payment masih pending
    console.log('⏳ Payment pending for:', phoneNumber);
    
    const pendingMessage = `⏳ *Menunggu Pembayaran*

Pembayaran kamu sedang diproses...
💰 Jumlah: Rp ${data.amount.toLocaleString('id-ID')}
🔗 ID Transaksi: ${data.reference_id}

Harap tunggu sebentar ya! 🙏`;

    await fonnteAPI.sendMessage({
      target: phoneNumber,
      message: pendingMessage
    });
  }
}

// Helper function untuk extract phone number dari reference_id
function extractPhoneFromRefId(refId: string): string | null {
  // Format: payment_PHONENUMBER_timestamp
  const match = refId.match(/payment_(\d+)_\d+/);
  return match ? match[1] : null;
}

// Helper function untuk format datetime
function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

// GET method untuk testing endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Tokopay Webhook Endpoint Ready! 🚀',
    status: 'active',
    timestamp: new Date().toISOString()
  });
} 