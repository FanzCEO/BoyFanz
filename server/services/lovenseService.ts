import { 
  LovenseDevice, 
  LovenseDeviceAction, 
  LovenseIntegrationSettings,
  InsertLovenseDevice,
  InsertLovenseDeviceAction,
  InsertLovenseIntegrationSettings,
  UpdateLovenseIntegrationSettings,
  LovenseDeviceControl 
} from '@shared/schema';
import { storage } from '../storage';
import { WebSocket } from 'ws';

interface LovenseConnectResponse {
  result: boolean;
  message?: string;
  code?: number;
  data?: any;
}

interface LovenseDeviceInfo {
  id: string;
  name: string;
  type: string;
  battery: number;
  status: 'connected' | 'disconnected';
}

interface LovenseToyCommand {
  command: 'Vibrate' | 'Rotate' | 'Pump' | 'Stop';
  action: string;
  timeSec?: number;
  loopRunningSec?: number;
  loopPauseSec?: number;
  toy?: string;
  apiVer?: number;
}

class LovenseService {
  private baseUrl = 'https://api.lovense.com/api/lan';
  private defaultTimeout = 30000; // 30 seconds
  
  /**
   * Get creator's Lovense integration settings
   */
  async getCreatorSettings(creatorId: string): Promise<LovenseIntegrationSettings | null> {
    try {
      const settings = await storage.getLovenseIntegrationSettings(creatorId);
      return settings || null;
    } catch (error) {
      console.error(`Error getting Lovense settings for creator ${creatorId}:`, error);
      return null;
    }
  }

  /**
   * Update creator's Lovense integration settings
   */
  async updateCreatorSettings(
    creatorId: string, 
    settings: UpdateLovenseIntegrationSettings
  ): Promise<LovenseIntegrationSettings> {
    try {
      const updated = await storage.updateLovenseIntegrationSettings(creatorId, settings);
      return updated;
    } catch (error) {
      console.error(`Error updating Lovense settings for creator ${creatorId}:`, error);
      throw error;
    }
  }

  /**
   * Get all devices for a creator
   */
  async getCreatorDevices(creatorId: string): Promise<LovenseDevice[]> {
    try {
      const devices = await storage.getLovenseDevices(creatorId);
      return devices;
    } catch (error) {
      console.error(`Error getting devices for creator ${creatorId}:`, error);
      return [];
    }
  }

  /**
   * Sync devices from Lovense Connect app
   */
  async syncDevices(creatorId: string): Promise<{ success: boolean; devices: LovenseDevice[] }> {
    try {
      const settings = await this.getCreatorSettings(creatorId);
      if (!settings?.connectAppToken || !settings.isEnabled) {
        throw new Error('Lovense integration not configured or disabled');
      }

      // Get devices from Lovense Connect
      const devices = await this.getDevicesFromConnect(settings.connectAppToken);
      const syncedDevices: LovenseDevice[] = [];

      for (const deviceInfo of devices) {
        // Check if device already exists
        const existingDevice = await storage.getLovenseDeviceByDeviceId(creatorId, deviceInfo.id);
        
        if (existingDevice) {
          // Update existing device
          const updated = await storage.updateLovenseDevice(existingDevice.id, {
            deviceName: deviceInfo.name,
            deviceType: deviceInfo.type,
            status: deviceInfo.status,
            batteryLevel: deviceInfo.battery,
            lastConnected: new Date()
          });
          syncedDevices.push(updated);
        } else {
          // Add new device
          const newDevice: InsertLovenseDevice = {
            deviceId: deviceInfo.id,
            deviceName: deviceInfo.name,
            deviceType: deviceInfo.type,
            isEnabled: true
          };
          const created = await storage.createLovenseDevice(creatorId, newDevice);
          syncedDevices.push(created);
        }
      }

      // Note: Last sync time will be tracked in the future

      return { success: true, devices: syncedDevices };
    } catch (error) {
      console.error(`Error syncing devices for creator ${creatorId}:`, error);
      return { success: false, devices: [] };
    }
  }

  /**
   * Control a specific device
   */
  async controlDevice(
    creatorId: string,
    deviceId: string,
    control: LovenseDeviceControl,
    triggeredByUserId?: string,
    streamId?: string,
    tipAmount?: number
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const settings = await this.getCreatorSettings(creatorId);
      if (!settings?.connectAppToken || !settings.isEnabled) {
        throw new Error('Lovense integration not configured or disabled');
      }

      const device = await storage.getLovenseDevice(deviceId);
      if (!device || device.creatorId !== creatorId || !device.isEnabled) {
        throw new Error('Device not found or not accessible');
      }

      // Build Lovense command
      const command = this.buildLovenseCommand(control, device.deviceType);
      
      // Send command to Lovense Connect
      const response = await this.sendCommandToConnect(settings.connectAppToken, command);
      
      if (response.result) {
        // Log the action
        const action: InsertLovenseDeviceAction = {
          deviceId: device.id,
          streamId,
          actionType: tipAmount ? 'tip' : 'manual',
          intensity: control.intensity,
          duration: control.duration,
          pattern: control.pattern,
          tipAmount,
          metadata: { command, response }
        };
        await storage.createLovenseDeviceAction(action);

        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Failed to control device' };
      }
    } catch (error) {
      console.error(`Error controlling device ${deviceId}:`, error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Process tip and trigger device vibration
   */
  async processTipVibration(
    creatorId: string,
    tipAmountCents: number,
    triggeredByUserId: string,
    streamId?: string
  ): Promise<{ success: boolean; actions: number }> {
    try {
      const settings = await this.getCreatorSettings(creatorId);
      if (!settings?.isEnabled) {
        return { success: false, actions: 0 };
      }

      // Check if tip meets minimum threshold
      if (tipAmountCents < (settings.tipMinimum || 100)) {
        return { success: false, actions: 0 };
      }

      // Get active devices for creator
      const devices = await storage.getActiveLovenseDevices(creatorId);
      if (devices.length === 0) {
        return { success: false, actions: 0 };
      }

      // Calculate vibration intensity based on tip amount
      const intensity = this.calculateIntensityFromTip(tipAmountCents, settings);
      const duration = this.calculateDurationFromTip(tipAmountCents, settings);

      let successfulActions = 0;

      // Control each device
      for (const device of devices) {
        const control: LovenseDeviceControl = {
          action: 'vibrate',
          intensity,
          duration
        };

        const result = await this.controlDevice(
          creatorId,
          device.id,
          control,
          triggeredByUserId,
          streamId,
          tipAmountCents
        );

        if (result.success) {
          successfulActions++;
        }
      }

      return { success: successfulActions > 0, actions: successfulActions };
    } catch (error) {
      console.error(`Error processing tip vibration for creator ${creatorId}:`, error);
      return { success: false, actions: 0 };
    }
  }

  /**
   * Test device connectivity
   */
  async testDevice(creatorId: string, deviceId: string): Promise<{ success: boolean; battery?: number; message?: string }> {
    try {
      const settings = await this.getCreatorSettings(creatorId);
      if (!settings?.connectAppToken) {
        throw new Error('Lovense integration not configured');
      }

      const device = await storage.getLovenseDevice(deviceId);
      if (!device || device.creatorId !== creatorId) {
        throw new Error('Device not found or not accessible');
      }

      // Test with a gentle vibration
      const testCommand: LovenseToyCommand = {
        command: 'Vibrate',
        action: 'Vibrate:5;',
        timeSec: 2,
        toy: device.deviceId,
        apiVer: 1
      };

      const response = await this.sendCommandToConnect(settings.connectAppToken, testCommand);
      
      if (response.result) {
        // Update device status
        await storage.updateLovenseDevice(device.id, {
          status: 'connected',
          batteryLevel: response.data?.battery || device.batteryLevel,
          lastConnected: new Date()
        });

        return { 
          success: true, 
          battery: response.data?.battery,
          message: 'Device test successful' 
        };
      } else {
        await storage.updateLovenseDevice(device.id, { status: 'error' });
        return { success: false, message: response.message || 'Device test failed' };
      }
    } catch (error) {
      console.error(`Error testing device ${deviceId}:`, error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get devices from Lovense Connect app
   */
  private async getDevicesFromConnect(token: string): Promise<LovenseDeviceInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/getToys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        signal: AbortSignal.timeout(this.defaultTimeout)
      });

      const data: LovenseConnectResponse = await response.json();
      
      if (data.result && data.data?.toys) {
        return Object.values(data.data.toys).map((toy: any) => ({
          id: toy.id,
          name: toy.name,
          type: toy.type,
          battery: toy.battery || 0,
          status: toy.status === 1 ? 'connected' : 'disconnected'
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching devices from Lovense Connect:', error);
      return [];
    }
  }

  /**
   * Send command to Lovense Connect app
   */
  private async sendCommandToConnect(token: string, command: LovenseToyCommand): Promise<LovenseConnectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...command }),
        signal: AbortSignal.timeout(this.defaultTimeout)
      });

      return await response.json();
    } catch (error) {
      console.error('Error sending command to Lovense Connect:', error);
      return { result: false, message: 'Connection timeout or network error' };
    }
  }

  /**
   * Build Lovense command from control object
   */
  private buildLovenseCommand(control: LovenseDeviceControl, deviceType: string): LovenseToyCommand {
    const { action, intensity = 10, duration = 5, pattern } = control;
    
    let command: LovenseToyCommand;
    
    switch (action) {
      case 'vibrate':
        command = {
          command: 'Vibrate',
          action: pattern ? `Vibrate:${pattern};` : `Vibrate:${Math.min(intensity, 20)};`,
          timeSec: duration
        };
        break;
      case 'rotate':
        command = {
          command: 'Rotate',
          action: `Rotate:${Math.min(intensity, 20)};`,
          timeSec: duration
        };
        break;
      case 'pump':
        command = {
          command: 'Pump',
          action: `Pump:${Math.min(intensity, 3)};`,
          timeSec: duration
        };
        break;
      case 'stop':
      default:
        command = {
          command: 'Stop',
          action: 'Stop;'
        };
        break;
    }

    return { ...command, apiVer: 1 };
  }

  /**
   * Calculate vibration intensity based on tip amount
   */
  private calculateIntensityFromTip(tipCents: number, settings: LovenseIntegrationSettings): number {
    const { tipMinimum, tipMaximum, intensityMapping } = settings;
    
    // Use custom mapping if available
    if (intensityMapping && typeof intensityMapping === 'object') {
      const mapping = intensityMapping as Record<string, number>;
      const tipDollar = Math.floor(tipCents / 100);
      
      if (mapping[tipDollar.toString()]) {
        return Math.min(mapping[tipDollar.toString()], 20);
      }
    }

    // Default linear mapping
    const minTip = tipMinimum || 100;
    const maxTip = tipMaximum || 10000;
    const ratio = Math.min((tipCents - minTip) / (maxTip - minTip), 1);
    return Math.max(1, Math.round(ratio * 20));
  }

  /**
   * Calculate vibration duration based on tip amount
   */
  private calculateDurationFromTip(tipCents: number, settings: LovenseIntegrationSettings): number {
    const tipDollars = tipCents / 100;
    
    // Duration ranges from 2 seconds (small tips) to 30 seconds (large tips)
    if (tipDollars < 1) return 2;
    if (tipDollars < 5) return 5;
    if (tipDollars < 10) return 10;
    if (tipDollars < 25) return 15;
    if (tipDollars < 50) return 20;
    return 30;
  }
}

export const lovenseService = new LovenseService();