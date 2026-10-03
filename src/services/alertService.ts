import { AlertItem, AlertSeverity, AlertType } from '../types';
import { DEMO_ALERTS } from './demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sortAlertsBySeverity } from '../lib/utils';
import { alertSoundService } from '../lib/sound';
import { resolveLocationId, getLocationZoneName, matchesZone } from '../lib/zones';

const STORAGE_ALERTS_KEY = 'vyomix_persisted_alerts';

class AlertService {
  private localAlerts: AlertItem[] = [];

  constructor() {
    this.loadInitialAlerts();
  }

  private loadInitialAlerts() {
    // Check if there is stored local state for alerts
    try {
      const stored = localStorage.getItem(STORAGE_ALERTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.localAlerts = parsed;
          return;
        }
      }
    } catch (e) {
      // fallback
    }

    this.localAlerts = [...DEMO_ALERTS];
  }

  private persistLocal() {
    try {
      localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(this.localAlerts));
    } catch (e) {}
  }

  public async getAlerts(
    locationId?: string,
    filterSeverity?: AlertSeverity | 'ALL',
    filterType?: AlertType | 'ALL',
    filterStatus?: string,
    userRole?: string,
    userZone?: string | null
  ): Promise<AlertItem[]> {
    let list: AlertItem[] = [];

    // Strict Zone Isolation Enforcement (Requirement 6 & 8)
    let effectiveLocId = locationId;
    if (userRole === 'ZONAL_HEAD' && userZone) {
      effectiveLocId = resolveLocationId(userZone);
    } else if (locationId && locationId !== 'ALL') {
      effectiveLocId = resolveLocationId(locationId);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('alerts')
          .select('*, locations(name), supplies(name, category)')
          .order('created_at', { ascending: false });

        if (effectiveLocId && effectiveLocId !== 'ALL') {
          query = query.eq('location_id', effectiveLocId);
        }
        if (filterSeverity && filterSeverity !== 'ALL') {
          query = query.eq('severity', filterSeverity);
        }
        if (filterType && filterType !== 'ALL') {
          query = query.eq('alert_type', filterType);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Supabase alert query error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
        } else if (data && data.length > 0) {
          list = data.map((a: any) => {
            const rawStatus = (a.status || 'ACTIVE').toUpperCase();
            const status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' = 
              rawStatus === 'RESOLVED' ? 'RESOLVED' : (rawStatus === 'ACKNOWLEDGED' || a.is_acknowledged ? 'ACKNOWLEDGED' : 'ACTIVE');

            return {
              id: a.id,
              alert_type: a.alert_type as AlertType,
              severity: a.severity as AlertSeverity,
              location_id: a.location_id,
              location_name: a.locations?.name || 'Logistics Zone',
              supply_id: a.supply_id,
              supply_name: a.supplies?.name,
              category: a.supplies?.category,
              title: a.title,
              message: a.message,
              root_cause: a.root_cause,
              recommendations: a.recommendations,
              is_acknowledged: status === 'ACKNOWLEDGED' || status === 'RESOLVED',
              status: status,
              created_at: a.created_at,
              acknowledged_at: a.acknowledged_at || (status === 'ACKNOWLEDGED' || status === 'RESOLVED' ? a.updated_at : undefined),
              resolved_at: a.resolved_at || (status === 'RESOLVED' ? a.updated_at : undefined),
              updated_at: a.updated_at
            };
          });

          // Sync local storage with latest verified database alerts
          this.localAlerts = list;
          this.persistLocal();
        }
      } catch (err) {
        console.warn('Supabase alert fetch error, falling back to local storage alerts:', err);
      }
    }

    if (list.length === 0) {
      list = [...this.localAlerts];
    }

    // Apply filters with strict zone isolation (Requirement 6 & 8)
    if (userRole === 'ZONAL_HEAD' && userZone) {
      list = list.filter(a => matchesZone(a.location_id, userZone) || matchesZone(a.location_name, userZone));
    } else if (effectiveLocId && effectiveLocId !== 'ALL') {
      const targetZ = getLocationZoneName(effectiveLocId);
      list = list.filter(a => matchesZone(a.location_id, targetZ) || matchesZone(a.location_name, targetZ));
    }
    if (filterSeverity && filterSeverity !== 'ALL') {
      list = list.filter(a => a.severity === filterSeverity);
    }
    if (filterType && filterType !== 'ALL') {
      list = list.filter(a => a.alert_type === filterType);
    }
    if (filterStatus && filterStatus !== 'ALL') {
      const matchStatus = filterStatus.toUpperCase();
      list = list.filter(a => a.status?.toUpperCase() === matchStatus);
    }

    // Apply strict severity ordering (Requirement 7):
    // 1. CRITICAL (4), 2. HIGH (3), 3. MEDIUM (2), 4. LOW (1). Newest first within same severity.
    const sorted = sortAlertsBySeverity(list);

    // Audio chime trigger for genuinely new alerts
    alertSoundService.checkAndNotifyNewAlerts(sorted);

    return sorted;
  }

  public async acknowledgeAlert(alertId: string): Promise<boolean> {
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('alerts')
        .update({
          is_acknowledged: true,
          status: 'ACKNOWLEDGED',
          updated_at: nowIso
        })
        .eq('id', alertId)
        .select();

      if (error) {
        console.error('Supabase error on acknowledgeAlert:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(error.message || 'Database update failed');
      }

      if (!data || data.length === 0) {
        console.warn('Supabase alert update matched 0 rows. Check user authentication / RLS permissions.');
        throw new Error('Database permission denied or alert record not found. Please ensure you are signed in.');
      }
    }

    const alert = this.localAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.is_acknowledged = true;
      alert.status = 'ACKNOWLEDGED';
      alert.acknowledged_at = alert.acknowledged_at || nowIso;
      alert.updated_at = nowIso;
      this.persistLocal();
    }

    return true;
  }

  public async resolveAlert(alertId: string): Promise<boolean> {
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('alerts')
        .update({
          is_acknowledged: true,
          status: 'RESOLVED',
          updated_at: nowIso
        })
        .eq('id', alertId)
        .select();

      if (error) {
        console.error('Supabase error on resolveAlert:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(error.message || 'Database update failed');
      }

      if (!data || data.length === 0) {
        console.warn('Supabase alert resolve matched 0 rows. Check user authentication / RLS permissions.');
        throw new Error('Database permission denied or alert record not found. Please ensure you are signed in.');
      }
    }

    const alert = this.localAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolved_at = alert.resolved_at || nowIso;
      alert.updated_at = nowIso;
      this.persistLocal();
    }

    return true;
  }

  /**
   * Automatically generate an alert if inventory adjustment breaches safety floor
   */
  public async createStockAlert(
    locationId: string,
    locationName: string,
    supplyName: string,
    category: any,
    currentStock: number,
    safetyThreshold: number,
    daysOfCover: number
  ): Promise<AlertItem | null> {
    // Check if an active alert for this item already exists
    const existing = this.localAlerts.find(
      a => a.location_id === locationId && a.supply_name === supplyName && a.status === 'ACTIVE'
    );
    if (existing) return existing;

    const severity: AlertSeverity = currentStock < safetyThreshold * 0.7 ? 'CRITICAL' : 'HIGH';
    const nowIso = new Date().toISOString();
    const newAlert: AlertItem = {
      id: `alt-${Date.now()}`,
      alert_type: 'Predictive Shortage',
      severity,
      location_id: locationId,
      location_name: locationName,
      category,
      title: `${supplyName} Below Mandatory Safety Threshold`,
      message: `Current stock at ${locationName} adjusted to ${currentStock.toLocaleString()} (Threshold: ${safetyThreshold.toLocaleString()}). Days of cover degraded to ${daysOfCover} days.`,
      root_cause: 'Manual on-hand inventory drawdown / audit adjustment below safety reserve floor.',
      recommendations: 'Prioritize urgent reserve replenishment dispatch from regional support hub.',
      is_acknowledged: false,
      status: 'ACTIVE',
      created_at: nowIso
    };

    this.localAlerts.unshift(newAlert);
    this.persistLocal();

    // Trigger chime for this genuinely new critical alert
    alertSoundService.checkAndNotifyNewAlerts([newAlert]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('alerts').insert([{
          alert_type: 'PREDICTIVE SHORTAGE',
          severity,
          location_id: locationId,
          title: newAlert.title,
          message: newAlert.message,
          root_cause: newAlert.root_cause,
          recommendations: newAlert.recommendations,
          status: 'ACTIVE'
        }]);
      } catch (e) {}
    }

    return newAlert;
  }
}

export const alertService = new AlertService();
