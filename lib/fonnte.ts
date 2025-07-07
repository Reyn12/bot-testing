interface FonnteConfig {
  token: string;
  device?: string;
}

interface SendMessageParams {
  target: string;
  message: string;
  countryCode?: string;
}

// Tambah interface untuk send image
interface SendImageParams {
  target: string;
  file: string; // URL gambar
  caption?: string;
  countryCode?: string;
}

// Tambah interface untuk response
interface FonnteResponse {
  status: boolean;
  message?: string;
  id?: string;
  reason?: string;
}

interface DeviceStatusResponse {
  device_status: string;
  device_id: string;
  webhook: string;
  expired?: string;
}

export class FonnteAPI {
  private token: string;
  private device?: string;
  private baseURL = 'https://api.fonnte.com';

  constructor(config: FonnteConfig) {
    this.token = config.token;
    this.device = config.device;
  }

  // Ubah dari Promise<any> jadi Promise<FonnteResponse>
  async sendMessage(params: SendMessageParams): Promise<FonnteResponse> {
    try {
      const { target, message, countryCode = '62' } = params;
      
      const payload = {
        target: target,
        message: message,
        countryCode: countryCode,
        ...(this.device && { device: this.device })
      };

      console.log('📤 Sending message to Fonnte:', {
        target: target,
        message: message.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Fonnte API Error: ${result.reason || 'Unknown error'}`);
      }

      console.log('✅ Message sent successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  // Ubah dari Promise<any> jadi Promise<DeviceStatusResponse>
  async getDeviceStatus(): Promise<DeviceStatusResponse> {
    try {
      const response = await fetch(`${this.baseURL}/device`, {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('❌ Failed to get device status:', error);
      throw error;
    }
  }

  // Method baru buat kirim gambar
  async sendImage(params: SendImageParams): Promise<FonnteResponse> {
    try {
      const { target, file, caption = '', countryCode = '62' } = params;
      
      const payload = {
        target: target,
        message: caption || 'Image', // Fonnte butuh parameter message, bukan caption
        file: file,
        countryCode: countryCode,
        ...(this.device && { device: this.device })
      };

      console.log('📸 Sending image to Fonnte:', {
        target: target,
        file: file,
        message: payload.message,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Fonnte API Error: ${result.reason || 'Unknown error'}`);
      }

      console.log('✅ Image sent successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send image:', error);
      throw error;
    }
  }
}

// Helper function buat inisialisasi Fonnte API
export function createFonnteAPI() {
  const token = process.env.FONNTE_TOKEN;
  const device = process.env.FONNTE_DEVICE;
  
  if (!token) {
    throw new Error('FONNTE_TOKEN environment variable is required');
  }
  
  return new FonnteAPI({ token, device });
} 