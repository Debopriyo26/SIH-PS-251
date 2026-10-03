import { TransportAsset, TransportAvailability, LogisticsZone } from '../types';
import { DEMO_TRANSPORTS } from './demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { matchesZone } from '../lib/zones';

class TransportService {
  private localTransports: TransportAsset[] = [...DEMO_TRANSPORTS];

  public async getTransports(userRole?: string, userZone?: LogisticsZone | null): Promise<TransportAsset[]> {
    let list: TransportAsset[] = this.localTransports;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('transport_assets')
          .select('*')
          .order('asset_code');
        
        if (!error && data && data.length > 0) {
          list = data as TransportAsset[];
        }
      } catch (err) {
        console.warn('Transport Supabase error, using demo transports:', err);
      }
    }

    // Strict Zone Isolation Enforcement (Requirement 6 & 8)
    if (userRole === 'ZONAL_HEAD' && userZone) {
      return list.filter(t => 
        matchesZone(t.current_location_id, userZone) ||
        matchesZone(t.destination_location_id, userZone) ||
        (t.assigned_route && t.assigned_route.toLowerCase().includes(userZone.toLowerCase()))
      );
    }

    return list;
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
