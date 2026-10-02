import { InventoryRecord, RiskLevel, LocationNode, SupplyItem } from '../types';
import { DEMO_INVENTORY, DEMO_LOCATIONS, DEMO_SUPPLIES } from './demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class InventoryService {
  private localInventory: InventoryRecord[] = [...DEMO_INVENTORY];

  public async getInventory(locationId?: string): Promise<InventoryRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('inventory')
          .select(`
            *,
            supplies (*),
            locations (*)
          `);
        
        if (locationId && locationId !== 'ALL') {
          query = query.eq('location_id', locationId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            location_id: item.location_id,
            supply_id: item.supply_id,
            current_stock: Number(item.current_stock),
            daily_consumption: Number(item.daily_consumption),
            safety_threshold: Number(item.safety_threshold),
            reorder_point: Number(item.reorder_point),
            forecast_demand_7d: Number(item.forecast_demand_7d || 0),
            days_of_cover: Number(item.days_of_cover || (item.daily_consumption > 0 ? item.current_stock / item.daily_consumption : 0)),
            risk_status: item.risk_status as RiskLevel,
            last_restocked_at: item.last_restocked_at,
            supply: item.supplies,
            location: item.locations
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to demonstration inventory:', err);
      }
    }

    if (locationId && locationId !== 'ALL') {
      return this.localInventory.filter(item => item.location_id === locationId);
    }
    return this.localInventory;
  }

  public async getLocations(): Promise<LocationNode[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('locations').select('*');
        if (!error && data && data.length > 0) {
          return data as LocationNode[];
        }
      } catch (err) {
        console.warn('Using demo locations:', err);
      }
    }
    return DEMO_LOCATIONS;
  }

  public async getSupplies(): Promise<SupplyItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('supplies').select('*');
        if (!error && data && data.length > 0) {
          return data as SupplyItem[];
        }
      } catch (err) {
        console.warn('Using demo supplies:', err);
      }
    }
    return DEMO_SUPPLIES;
  }

  public async updateStock(recordId: string, newStock: number): Promise<InventoryRecord | null> {
    const itemIndex = this.localInventory.findIndex(inv => inv.id === recordId);
    if (itemIndex !== -1) {
      const item = this.localInventory[itemIndex];
      const daysOfCover = item.daily_consumption > 0 ? Number((newStock / item.daily_consumption).toFixed(1)) : 999;
      let riskStatus: RiskLevel = 'LOW';
      if (newStock < item.safety_threshold * 0.75) {
        riskStatus = 'CRITICAL';
      } else if (newStock <= item.safety_threshold) {
        riskStatus = 'HIGH';
      } else if (newStock <= item.reorder_point) {
        riskStatus = 'MODERATE';
      }

      const updated: InventoryRecord = {
        ...item,
        current_stock: newStock,
        days_of_cover: daysOfCover,
        risk_status: riskStatus,
        last_restocked_at: new Date().toISOString()
      };

      this.localInventory[itemIndex] = updated;

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('inventory')
            .update({ current_stock: newStock, risk_status: riskStatus, updated_at: new Date().toISOString() })
            .eq('id', recordId);
        } catch (err) {
          console.error('Supabase update failed:', err);
        }
      }

      return updated;
    }
    return null;
  }
}

export const inventoryService = new InventoryService();
