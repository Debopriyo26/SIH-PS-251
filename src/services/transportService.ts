import { TransportAsset, TransportAvailability } from '../types';
import { DEMO_TRANSPORTS } from './demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class TransportService {
  private localTransports: TransportAsset[] = [...DEMO_TRANSPORTS];

  public async getTransports(): Promise<TransportAsset[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('transport_assets')
          .select('*')
          .order('asset_code');
        
        if (!error && data && data.length > 0) {
          return data as TransportAsset[];
        }
      } catch (err) {
        console.warn('Transport Supabase error, using demo transports:', err);
      }
    }
    return this.localTransports;
  }

  public async updateAvailability(assetId: string, availability: TransportAvailability, status: string): Promise<TransportAsset | null> {
    const idx = this.localTransports.findIndex(t => t.id === assetId || t.asset_code === assetId);
    if (idx !== -1) {
      this.localTransports[idx] = {
        ...this.localTransports[idx],
        availability,
        status,
        last_updated: 'Just now'
      };

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('transport_assets')
            .update({ availability, status, updated_at: new Date().toISOString() })
            .eq('id', assetId);
        } catch (err) {
          console.error('Supabase update transport error:', err);
        }
      }

      return this.localTransports[idx];
    }
    return null;
  }
}

export const transportService = new TransportService();
