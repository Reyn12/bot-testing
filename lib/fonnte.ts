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
      
      // Coba method 1: JSON payload dengan parameter lengkap
      const payload = {
        target: target,
        message: caption || 'Image', // Fonnte butuh parameter message, bukan caption
        file: file,
        url: file, // Tambah parameter url juga buat kompatibilitas
        countryCode: countryCode,
        ...(this.device && { device: this.device })
      };

      console.log('📸 Sending image to Fonnte (Method 1):', {
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
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      console.log('📸 Fonnte image response (Method 1):', {
        success: result.status || false,
        detail: result.detail || result.message || 'Unknown',
        fullResponse: result,
        timestamp: new Date().toISOString()
      });

      // Kalau method 1 gagal, coba method 2 dengan form-data
      if (!result.status) {
        console.log('🔄 Trying alternative method (Form-Data)...');
        return await this.sendImageFormData(params);
      }

      return result as FonnteResponse;
    } catch (error) {
      console.error('❌ Error sending image via Fonnte:', error);
      // Coba method 2 sebagai fallback
      try {
        console.log('🔄 Trying fallback method...');
        return await this.sendImageFormData(params);
      } catch (fallbackError) {
        console.error('❌ Fallback method also failed:', fallbackError);
        throw new Error(`Failed to send image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // Alternative method dengan form-data
  async sendImageFormData(params: SendImageParams): Promise<FonnteResponse> {
    try {
      const { target, file, caption = '', countryCode = '62' } = params;
      
      const formData = new FormData();
      formData.append('target', target);
      formData.append('message', caption || 'Image');
      formData.append('file', file);
      formData.append('countryCode', countryCode);
      if (this.device) formData.append('device', this.device);

      console.log('📸 Sending image via Form-Data method');

      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      const result = await response.json();
      
      console.log('📸 Fonnte Form-Data response:', {
        success: result.status || false,
        detail: result.detail || result.message || 'Unknown',
        fullResponse: result,
        timestamp: new Date().toISOString()
      });

      return result as FonnteResponse;
    } catch (error) {
      console.error('❌ Error with Form-Data method:', error);
      throw new Error(`Form-Data method failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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