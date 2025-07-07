import { NextRequest, NextResponse } from 'next/server';
import { createFonnteAPI } from '../../../lib/fonnte';
import { createTokopayAPI } from '../../../lib/tokopay';

interface FonnteWebhookData {
  device: string;
  sender: string;
  message: string;
  member?: string;
  name?: string;
  location?: string;
  file?: string;
  filename?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FonnteWebhookData = await request.json();
    
    console.log('📱 Webhook received from Fonnte:', {
      device: body.device,
      sender: body.sender,
      message: body.message,
      name: body.name,
      timestamp: new Date().toISOString()
    });

    // Di sini kamu bisa tambahin logic buat proses pesan
    const response = await processMessage(body);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received successfully',
      response: response
    });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function processMessage(data: FonnteWebhookData) {
  const { sender, message, name } = data;
  
  // Simple auto-reply logic - kamu bisa customize ini
  let reply = '';
  
  if (message.toLowerCase().includes('halo') || message.toLowerCase().includes('hi')) {
    reply = `Halo ${name || sender}! 👋 Gimana kabarnya?`;
  } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('bantuan')) {
    reply = `Aku bisa bantu kamu dengan:\n• Info produk\n• Pembayaran (ketik "bayar")\n• Customer service\n• Pertanyaan umum\n\nKetik aja yang kamu butuhin!`;
  } else if (message.toLowerCase().includes('produk')) {
    reply = `📦 Produk kami:\n• Produk A - Rp 100.000\n• Produk B - Rp 150.000\n• Produk C - Rp 200.000\n\nMau tau lebih detail yang mana?`;
  } else if (message.toLowerCase().includes('bayar')) {
    // Generate payment link dengan Tokopay
    console.log('💳 Processing payment request from:', sender);
    
    try {
      const tokopayAPI = createTokopayAPI();
      
      // Generate unique reference ID
      const timestamp = Date.now();
      const refId = `payment_${sender}_${timestamp}`;
      
      // Create payment sesuai interface yang baru
      const paymentResult = await tokopayAPI.createPayment({
        refId: refId,
        amount: 25000, // Rp 25.000 (example amount)
        channel: 'QRIS' // QRIS untuk QR Code
      });
      
      if (paymentResult.status === 'Success' && paymentResult.data?.pay_url) {
        console.log('✅ Payment link created:', paymentResult.data.pay_url);
        
        reply = `💰 *Link Pembayaran Berhasil Dibuat!*

🔗 *Klik link untuk bayar:*
${paymentResult.data.pay_url}

📱 *Atau lihat QR code:*
${paymentResult.data.qr_link || 'QR code tersedia di link pembayaran'}

💳 *Detail Pembayaran:*
• Jumlah: Rp ${paymentResult.data.total_bayar?.toLocaleString() || '25,000'}
• Diterima: Rp ${paymentResult.data.total_diterima?.toLocaleString() || '24,725'}
• ID Transaksi: ${paymentResult.data.trx_id || refId}

⚠️ *Penting:*
• Setelah bayar, kamu akan dapat konfirmasi otomatis
• Pesanan akan diproses langsung
• Link berlaku sampai pembayaran selesai

Terima kasih! 😊`;

      } else {
        console.error('❌ Failed to create payment:', paymentResult);
        
        reply = `❌ *Maaf, ada masalah teknis*

Gagal membuat link pembayaran. Silakan coba lagi dalam beberapa menit atau hubungi customer service.

Error: ${paymentResult.error_msg || 'Unknown error'}`;
      }
      
    } catch (error) {
      console.error('❌ Tokopay API error:', error);
      
      reply = `❌ *Sistem sedang maintenance*

Maaf, sistem pembayaran sedang dalam perbaikan. Silakan coba lagi nanti atau hubungi customer service untuk bantuan.`;
    }
    
    console.log('💳 Payment response sent to:', sender);
    
  } else {
    reply = `Terima kasih pesannya: "${message}"\n\nAku sedang belajar jadi maaf kalo belum bisa jawab dengan baik. Coba ketik "help" untuk bantuan! 🤖`;
  }
  
  // Kirim balasan ke user via Fonnte API
  try {
    const fonnteAPI = createFonnteAPI();
    await fonnteAPI.sendMessage({
      target: sender,
      message: reply
    });
    
    console.log('✅ Reply sent successfully to:', sender);
  } catch (error) {
    console.error('❌ Failed to send reply:', error);
    // Kalo error kirim pesan, masih return reply buat log
  }
  
  return reply;
}

// GET method buat testing endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'WhatsApp Bot Webhook Endpoint Ready! 🚀',
    status: 'active',
    timestamp: new Date().toISOString()
  });
} 