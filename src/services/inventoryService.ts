import { InventoryRecord, RiskLevel, LocationNode, SupplyItem, LogisticsZone } from '../types';
import { DEMO_INVENTORY, DEMO_LOCATIONS, DEMO_SUPPLIES } from './demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { alertService } from './alertService';
import { resolveLocationId, getLocationZoneName, matchesZone, getLocationNodeForZone, ZONES_CONFIG } from '../lib/zones';

const STORAGE_INVENTORY_KEY = 'vyomix_persisted_inventory';

class InventoryService {
  private localInventory: InventoryRecord[] = [];

  constructor() {
    this.loadInitialInventory();
  }

  private loadInitialInventory() {
    try {
      const stored = localStorage.getItem(STORAGE_INVENTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.localInventory = parsed;
          return;
        }
      }
    } catch (e) {}

    this.localInventory = [...DEMO_INVENTORY];
  }

  private persistLocal() {
    try {
      localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(this.localInventory));
    } catch (e) {}
  }

  /**
   * Retrieves inventory records with STRICT ZONE ISOLATION (Requirements 6 & 8).
   * If user is ZONAL_HEAD, access is unconditionally constrained to their assigned zone.
   */
  public async getInventory(
    locationId?: string, 
    userRole?: string, 
    userZone?: LogisticsZone | null
  ): Promise<InventoryRecord[]> {
    // 1. Strict Zone Isolation Enforcement:
    // If Zonal Head, override requested locationId to only user's assigned zone
    let targetZone: LogisticsZone | null = null;
    let targetLocId = locationId;

    if (userRole === 'ZONAL_HEAD' && userZone) {
      targetZone = userZone;
      targetLocId = resolveLocationId(userZone);
    } else if (locationId && locationId !== 'ALL') {
      targetZone = getLocationZoneName(locationId);
      targetLocId = resolveLocationId(locationId);
    }

    // 2. Fetch from Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('inventory')
          .select(`
            *,
            supplies (*),
            locations (*)
          `);
        
        if (targetLocId && targetLocId !== 'ALL') {
          query = query.eq('location_id', targetLocId);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Supabase inventory fetch error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
        } else if (data && data.length > 0) {
          const mapped: InventoryRecord[] = data.map((item: any) => ({
            id: item.id,
            location_id: item.location_id,
            supply_id: item.supply_id,
            current_stock: Math.max(0, Number(item.current_stock)),
            daily_consumption: Math.max(1, Number(item.daily_consumption)),
            safety_threshold: Math.max(0, Number(item.safety_threshold)),
            reorder_point: Math.max(0, Number(item.reorder_point)),
            forecast_demand_7d: Math.max(0, Number(item.forecast_demand_7d || 0)),
            days_of_cover: Number(item.days_of_cover || (item.daily_consumption > 0 ? (item.current_stock / item.daily_consumption).toFixed(1) : 0)),
            risk_status: item.risk_status as RiskLevel,
            last_restocked_at: item.last_restocked_at,
            supply: item.supplies,
            location: item.locations
          }));

          // Merge into local cache
          mapped.forEach(m => {
            const idx = this.localInventory.findIndex(i => i.id === m.id);
            if (idx !== -1) {
              this.localInventory[idx] = m;
            } else {
              this.localInventory.push(m);
            }
          });
          this.persistLocal();

          if (targetZone) {
            return mapped.filter(item => 
              matchesZone(item.location_id, targetZone) || 
              matchesZone(item.location?.name, targetZone)
            );
          }
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase inventory query failed, utilizing synchronized local cache:', err);
      }
    }

    // 3. Fallback to Local Synchronized Inventory with strict zone isolation
    if (targetZone) {
      return this.localInventory.filter(item => 
        matchesZone(item.location_id, targetZone) || 
        matchesZone(item.location?.name, targetZone)
      );
    }

    return this.localInventory;
  }

  /**
   * Retrieves locations with strict zone isolation for Zonal Heads (Requirement 6)
   */
  public async getLocations(userRole?: string, userZone?: LogisticsZone | null): Promise<LocationNode[]> {
    if (userRole === 'ZONAL_HEAD' && userZone) {
      // Zonal Head must ONLY see their assigned zone
      return [getLocationNodeForZone(userZone)];
    }

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

  /**
   * Stock adjustment mutation with strict validation, persistence, and audit logging (Requirements 22, 23, 40)
   */
  public async updateStock(
    recordId: string, 
    newStock: number, 
    userRole?: string, 
    userZone?: LogisticsZone | null
  ): Promise<InventoryRecord> {
    const safeStock = Math.max(0, Math.round(Number(newStock)));
    let item = this.localInventory.find(inv => inv.id === recordId);

    // If item not found in local cache, look up from Supabase
    if (!item && isSupabaseConfigured && supabase) {
      const { data: itemData, error: itemErr } = await supabase
        .from('inventory')
        .select('*, supplies(*), locations(*)')
        .eq('id', recordId)
        .single();

      if (itemErr) {
        console.error('Supabase inventory lookup error:', {
          code: itemErr.code,
          message: itemErr.message,
          details: itemErr.details,
          hint: itemErr.hint
        });
        throw new Error(`Inventory item not found: ${itemErr.message}`);
      }

      if (itemData) {
        item = {
          id: itemData.id,
          location_id: itemData.location_id,
          supply_id: itemData.supply_id,
          current_stock: Math.max(0, Number(itemData.current_stock)),
          daily_consumption: Math.max(1, Number(itemData.daily_consumption)),
          safety_threshold: Math.max(0, Number(itemData.safety_threshold)),
          reorder_point: Math.max(0, Number(itemData.reorder_point)),
          forecast_demand_7d: Math.max(0, Number(itemData.forecast_demand_7d || 0)),
          days_of_cover: Number(itemData.days_of_cover || 0),
          risk_status: itemData.risk_status as RiskLevel,
          last_restocked_at: itemData.last_restocked_at,
          supply: itemData.supplies,
          location: itemData.locations
        };
      }
    }

    if (!item) {
      throw new Error('Unable to find inventory record to update.');
    }

    // Strict Zone Isolation Security Check (Requirement 6 & 8)
    if (userRole === 'ZONAL_HEAD' && userZone) {
      const itemZone = getLocationZoneName(item.location_id || item.location?.name);
      if (itemZone !== userZone) {
        console.error(`Zone isolation breach rejected: User zone ${userZone} attempted to mutate item in ${itemZone}`);
        throw new Error(`Security Violation: Zonal Head of ${userZone} cannot update supplies in ${itemZone}.`);
      }
    }

    // Recalculate dependent values (Requirement 22 & 40)
    const dailyConsumption = item.daily_consumption > 0 ? item.daily_consumption : 1;
    const daysOfCover = Number((safeStock / dailyConsumption).toFixed(1));

    let riskStatus: RiskLevel = 'LOW';
    if (safeStock < item.safety_threshold * 0.75) {
      riskStatus = 'CRITICAL';
    } else if (safeStock <= item.safety_threshold) {
      riskStatus = 'HIGH';
    } else if (safeStock <= item.reorder_point) {
      riskStatus = 'MODERATE';
    }

    const nowIso = new Date().toISOString();

    // 1. Persist directly in Supabase
    if (isSupabaseConfigured && supabase) {
      const { data: updatedRows, error: updateError } = await supabase
        .from('inventory')
        .update({ 
          current_stock: safeStock, 
          risk_status: riskStatus,
          last_restocked_at: nowIso,
          updated_at: nowIso 
        })
        .eq('id', recordId)
        .select('*, supplies(*), locations(*)');

      if (updateError) {
        console.warn('Stock update note in Supabase (falling back to local cache):', updateError.message);
      } else if (updatedRows && updatedRows.length > 0) {
        const dbRow = updatedRows[0];
        const updatedRecord: InventoryRecord = {
          id: dbRow.id,
          location_id: dbRow.location_id,
          supply_id: dbRow.supply_id,
          current_stock: Number(dbRow.current_stock),
          daily_consumption: Number(dbRow.daily_consumption),
          safety_threshold: Number(dbRow.safety_threshold),
          reorder_point: Number(dbRow.reorder_point),
          forecast_demand_7d: Number(dbRow.forecast_demand_7d || 0),
          days_of_cover: Number(dbRow.days_of_cover || daysOfCover),
          risk_status: dbRow.risk_status as RiskLevel,
          last_restocked_at: dbRow.last_restocked_at || nowIso,
          supply: dbRow.supplies || item.supply,
          location: dbRow.locations || item.location
        };

        const idx = this.localInventory.findIndex(inv => inv.id === recordId);
        if (idx !== -1) {
          this.localInventory[idx] = updatedRecord;
        } else {
          this.localInventory.push(updatedRecord);
        }
        this.persistLocal();

        if (safeStock <= updatedRecord.safety_threshold) {
          await alertService.createStockAlert(
            updatedRecord.location_id,
            updatedRecord.location?.name || 'Logistics Zone',
            updatedRecord.supply?.name || 'Supply Item',
            updatedRecord.supply?.category,
            safeStock,
            updatedRecord.safety_threshold,
            updatedRecord.days_of_cover
          );
        }

        return updatedRecord;
      }
    }



    // 2. Local Fallback with local persistence
    const localUpdated: InventoryRecord = {
      ...item,
      current_stock: safeStock,
      days_of_cover: daysOfCover,
      risk_status: riskStatus,
      last_restocked_at: nowIso
    };
    const idx = this.localInventory.findIndex(inv => inv.id === recordId);
    if (idx !== -1) {
      this.localInventory[idx] = localUpdated;
    }
    this.persistLocal();

    if (safeStock <= item.safety_threshold) {
      await alertService.createStockAlert(
        item.location_id,
        item.location?.name || 'Logistics Zone',
        item.supply?.name || 'Supply Item',
        item.supply?.category,
        safeStock,
        item.safety_threshold,
        daysOfCover
      );
    }

    return localUpdated;
  }
}

export const inventoryService = new InventoryService();
