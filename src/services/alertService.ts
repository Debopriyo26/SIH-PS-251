import { AlertItem, AlertSeverity, AlertType } from '../types';
import { DEMO_ALERTS } from './demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class AlertService {
  private localAlerts: AlertItem[] = [...DEMO_ALERTS];

  public async getAlerts(filterSeverity?: AlertSeverity, filterType?: AlertType): Promise<AlertItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('alerts')
          .select('*, locations(name), supplies(name, category)')
          .order('created_at', { ascending: false });

        if (filterSeverity) query = query.eq('severity', filterSeverity);
        if (filterType) query = query.eq('alert_type', filterType);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((a: any) => ({
            id: a.id,
            alert_type: a.alert_type,
            severity: a.severity,
            location_id: a.location_id,
            location_name: a.locations?.name || 'Tactical Node',
            supply_id: a.supply_id,
            supply_name: a.supplies?.name,
            category: a.supplies?.category,
            title: a.title,
            message: a.message,
            root_cause: a.root_cause,
            recommendations: a.recommendations,
            is_acknowledged: a.is_acknowledged,
            status: a.status,
            created_at: a.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase alert fetch error, falling back to demo alerts:', err);
      }
    }

    let result = [...this.localAlerts];
    if (filterSeverity) result = result.filter(a => a.severity === filterSeverity);
    if (filterType) result = result.filter(a => a.alert_type === filterType);
    return result;
  }

  public async acknowledgeAlert(alertId: string): Promise<boolean> {
    const alert = this.localAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.is_acknowledged = true;
      alert.status = 'ACKNOWLEDGED';

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('alerts')
            .update({ is_acknowledged: true, status: 'ACKNOWLEDGED', updated_at: new Date().toISOString() })
            .eq('id', alertId);
        } catch (err) {
          console.error('Supabase alert update failed:', err);
        }
      }
      return true;
    }
    return false;
  }

  public async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.localAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'RESOLVED';

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('alerts')
            .update({ status: 'RESOLVED', updated_at: new Date().toISOString() })
            .eq('id', alertId);
        } catch (err) {
          console.error('Supabase alert resolve failed:', err);
        }
      }
      return true;
    }
    return false;
  }
}

export const alertService = new AlertService();
