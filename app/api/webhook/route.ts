import { NextRequest, NextResponse } from 'next/server';
import { createFonnteAPI } from '../../../lib/fonnte';

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
    // Kirim QR code untuk pembayaran
    try {
      const fonnteAPI = createFonnteAPI();
      await fonnteAPI.sendImage({
        target: sender,
        file: 'https://play-lh.googleusercontent.com/Byl6BHzEv7tWDGa5QUgztneq8C8TGYelu8ywVMTTRUH2e9keboyLqL4YhmzaU3vjgA',
        caption: '💰 QR Code Pembayaran\n\nSilakan scan QR code di atas untuk melakukan pembayaran.\n\nSetelah transfer, konfirmasi ke kami ya! 😊'
      });
      
      reply = 'QR Code pembayaran sudah dikirim! 📱';
      console.log('✅ QR Code sent successfully to:', sender);
      
      // Return early karena udah kirim image, ga perlu kirim text lagi
      return reply;
    } catch (error) {
      console.error('❌ Failed to send QR code:', error);
      reply = 'Maaf, ada masalah saat mengirim QR code. Coba lagi nanti ya! 😅';
    }
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