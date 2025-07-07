interface FonnteConfig {
  token: string;
  device?: string;
}

interface SendMessageParams {
  target: string;
  message: string;
  countryCode?: string;
}

export class FonnteAPI {
  private token: string;
  private device?: string;
  private baseURL = 'https://api.fonnte.com';

  constructor(config: FonnteConfig) {
    this.token = config.token;
    this.device = config.device;
  }

  async sendMessage(params: SendMessageParams): Promise<any> {
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

  async getDeviceStatus(): Promise<any> {
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