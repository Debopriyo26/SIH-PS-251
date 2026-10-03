import { 
  LogisticsRequest, 
  RequestHistoryItem, 
  ZonalNotification, 
  UserRole, 
  LogisticsZone, 
  RequestType, 
  RequestPriority, 
  RequestStatus, 
  AlertItem,
  AIRequirementItem
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { alertSoundService } from '../lib/sound';

const STORAGE_REQUESTS_KEY = 'vyomix_logistics_requests';
const STORAGE_HISTORY_KEY = 'vyomix_request_history';
const STORAGE_NOTIFICATIONS_KEY = 'vyomix_zonal_notifications';

// Priority weights (Requirement 11)
export const REQUEST_PRIORITY_WEIGHT: Record<RequestPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

// Initial demonstration requests (Requirement 5 & 8)
const INITIAL_DEMO_REQUESTS: LogisticsRequest[] = [
  {
    id: 'req-001-sxr',
    request_number: 'REQ-1041',
    created_by_name: 'Col. K. Verma',
    created_by_role: 'ZONAL_HEAD',
    zone: 'Srinagar',
    request_type: 'Emergency Requirement',
    priority: 'CRITICAL',
    title: 'Emergency Trauma Kit Replenishment for High Passes',
    description: 'Trauma kit buffer depleted due to recent harsh weather casualties along high-altitude transport corridor. Immediate express courier consignment required.',
    requested_supply: 'Emergency Medical & Trauma Kits',
    requested_quantity: 120,
    unit: 'Kits',
    status: 'IN_PROGRESS',
    main_head_response: 'Express airlift courier authorized from Central Reserve Base. Consignment en route via TR-005 cold-chain.',
    acknowledged_at: '2026-10-02T06:15:00Z',
    in_progress_at: '2026-10-02T07:30:00Z',
    created_at: '2026-10-02T05:45:00Z',
    updated_at: '2026-10-02T07:30:00Z'
  },
  {
    id: 'req-002-sxr',
    request_number: 'REQ-1042',
    created_by_name: 'Col. K. Verma',
    created_by_role: 'ZONAL_HEAD',
    zone: 'Srinagar',
    request_type: 'Supply Request',
    priority: 'HIGH',
    title: 'High-Altitude Winter Fuel Stock Augmentation',
    description: 'Forecasted severe precipitation is expected to close mountain corridors within 72 hours. Additional POL reserves required to maintain heating generator buffers.',
    requested_supply: 'High-Altitude Diesel & Fuel (POL)',
    requested_quantity: 6500,
    unit: 'Liters',
    status: 'ACKNOWLEDGED',
    main_head_response: 'Corridor dispatch scheduled from Ahmedabad hub before weather deterioration.',
    acknowledged_at: '2026-10-02T08:20:00Z',
    created_at: '2026-10-02T08:00:00Z',
    updated_at: '2026-10-02T08:20:00Z'
  },
  {
    id: 'req-003-kut',
    request_number: 'REQ-1039',
    created_by_name: 'Lt. Col. P. Rawat',
    created_by_role: 'ZONAL_HEAD',
    zone: 'Kutch',
    request_type: 'Transport Requirement',
    priority: 'MEDIUM',
    title: 'Heavy Logistics Transporter Re-allocation',
    description: 'Fleet unit TR-006 scheduled for maintenance overhaul. Requesting temporary allocation of 1 Heavy Transport from Ahmedabad Base.',
    requested_supply: 'Heavy Transport Vehicle (8T)',
    requested_quantity: 1,
    unit: 'Vehicle',
    status: 'PENDING',
    created_at: '2026-10-02T09:10:00Z',
    updated_at: '2026-10-02T09:10:00Z'
  },
  {
    id: 'req-004-jsa',
    request_number: 'REQ-1035',
    created_by_name: 'Col. S. Rathore',
    created_by_role: 'ZONAL_HEAD',
    zone: 'Jaisalmer',
    request_type: 'Supply Request',
    priority: 'LOW',
    title: 'Routine MRE Composite Rations Rotation',
    description: 'Quarterly shelf-life rotation for desert staging depot. Consignment ready for intake.',
    requested_supply: 'Composite MRE Rations',
    requested_quantity: 1800,
    unit: 'Packs',
    status: 'RESOLVED',
    main_head_response: 'Rotation consignment verified and logged at Western Sector depot.',
    acknowledged_at: '2026-10-01T10:00:00Z',
    in_progress_at: '2026-10-01T11:30:00Z',
    resolved_at: '2026-10-01T16:00:00Z',
    created_at: '2026-10-01T09:30:00Z',
    updated_at: '2026-10-01T16:00:00Z'
  }
];

const INITIAL_DEMO_HISTORY: RequestHistoryItem[] = [
  {
    id: 'hist-001',
    request_id: 'req-001-sxr',
    action: 'REQUEST_CREATED',
    performed_by: 'Col. K. Verma',
    performed_by_role: 'ZONAL_HEAD',
    message: 'Emergency request submitted by Srinagar Zonal Head.',
    created_at: '2026-10-02T05:45:00Z'
  },
  {
    id: 'hist-002',
    request_id: 'req-001-sxr',
    action: 'ACKNOWLEDGED',
    performed_by: 'Maj. Gen. A. Singhal',
    performed_by_role: 'MAIN_HEAD',
    message: 'Request reviewed and acknowledged by Main Head.',
    created_at: '2026-10-02T06:15:00Z'
  },
  {
    id: 'hist-003',
    request_id: 'req-001-sxr',
    action: 'IN_PROGRESS',
    performed_by: 'Maj. Gen. A. Singhal',
    performed_by_role: 'MAIN_HEAD',
    message: 'Action initiated: Express airlift courier authorized from Central Reserve Base. Consignment en route via TR-005 cold-chain.',
    created_at: '2026-10-02T07:30:00Z'
  },
  {
    id: 'hist-004',
    request_id: 'req-002-sxr',
    action: 'REQUEST_CREATED',
    performed_by: 'Col. K. Verma',
    performed_by_role: 'ZONAL_HEAD',
    message: 'Supply request submitted by Srinagar Zonal Head.',
    created_at: '2026-10-02T08:00:00Z'
  },
  {
    id: 'hist-005',
    request_id: 'req-002-sxr',
    action: 'ACKNOWLEDGED',
    performed_by: 'Maj. Gen. A. Singhal',
    performed_by_role: 'MAIN_HEAD',
    message: 'Acknowledged: Corridor dispatch scheduled from Ahmedabad hub before weather deterioration.',
    created_at: '2026-10-02T08:20:00Z'
  }
];

class RequestService {
  private localRequests: LogisticsRequest[] = [];
  private localHistory: RequestHistoryItem[] = [];
  private localNotifications: ZonalNotification[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedReq = localStorage.getItem(STORAGE_REQUESTS_KEY);
      this.localRequests = storedReq ? JSON.parse(storedReq) : [...INITIAL_DEMO_REQUESTS];
    } catch {
      this.localRequests = [...INITIAL_DEMO_REQUESTS];
    }

    try {
      const storedHist = localStorage.getItem(STORAGE_HISTORY_KEY);
      this.localHistory = storedHist ? JSON.parse(storedHist) : [...INITIAL_DEMO_HISTORY];
    } catch {
      this.localHistory = [...INITIAL_DEMO_HISTORY];
    }

    try {
      const storedNotif = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      this.localNotifications = storedNotif ? JSON.parse(storedNotif) : [];
    } catch {
      this.localNotifications = [];
    }
  }

  private persistState() {
    try {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(this.localRequests));
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(this.localHistory));
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(this.localNotifications));
    } catch (e) {
      console.warn('Storage persistence warning:', e);
    }
  }

  /**
   * Sort requests strictly by Priority (CRITICAL=4, HIGH=3, MEDIUM=2, LOW=1), newest first.
   */
  public sortRequests(requests: LogisticsRequest[]): LogisticsRequest[] {
    return [...requests].sort((a, b) => {
      const weightA = REQUEST_PRIORITY_WEIGHT[a.priority] || 1;
      const weightB = REQUEST_PRIORITY_WEIGHT[b.priority] || 1;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  /**
   * Get requests with role-based filtering (Requirement 8, 9, 20, 21)
   */
  public async getRequests(
    userRole: UserRole | string,
    userZone?: LogisticsZone | null,
    filterZone?: string,
    filterPriority?: string,
    filterStatus?: string
  ): Promise<LogisticsRequest[]> {
    let requests = [...this.localRequests];

    // If Supabase table exists, query it
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('logistics_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: LogisticsRequest[] = data.map((d: any) => ({
            id: d.id,
            request_number: d.request_number,
            created_by: d.created_by,
            created_by_name: d.created_by_name || 'Zonal Officer',
            created_by_role: d.created_by_role || 'ZONAL_HEAD',
            zone: d.zone as LogisticsZone,
            request_type: d.request_type as RequestType,
            priority: d.priority as RequestPriority,
            title: d.title,
            description: d.description,
            requested_supply: d.requested_supply,
            requested_quantity: d.requested_quantity ? Number(d.requested_quantity) : undefined,
            unit: d.unit,
            status: d.status as RequestStatus,
            main_head_response: d.main_head_response,
            acknowledged_at: d.acknowledged_at,
            in_progress_at: d.in_progress_at,
            resolved_at: d.resolved_at,
            created_at: d.created_at,
            updated_at: d.updated_at
          }));
          this.localRequests = mapped;
          this.persistState();
          requests = mapped;
        }
      } catch (err) {
        // Table not migrated yet; fallback to local synced store
      }
    }

    // Role-based visibility enforcement (Requirement 20: Zonal Head can ONLY see their assigned zone!)
    if (userRole === 'ZONAL_HEAD' && userZone) {
      requests = requests.filter(r => r.zone.toLowerCase() === userZone.toLowerCase());
    } else if (filterZone && filterZone !== 'ALL') {
      requests = requests.filter(r => r.zone.toLowerCase() === filterZone.toLowerCase());
    }

    if (filterPriority && filterPriority !== 'ALL') {
      requests = requests.filter(r => r.priority === filterPriority);
    }

    if (filterStatus && filterStatus !== 'ALL') {
      requests = requests.filter(r => r.status === filterStatus);
    }

    return this.sortRequests(requests);
  }

  public getRequestById(requestId: string): LogisticsRequest | undefined {
    return this.localRequests.find(r => r.id === requestId);
  }

  public getRequestHistory(requestId: string): RequestHistoryItem[] {
    return this.localHistory
      .filter(h => h.request_id === requestId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  /**
   * Submit a new supply/alert request (Requirement 6 & 7)
   */
  public async createRequest(data: {
    zone: LogisticsZone;
    request_type: RequestType;
    priority: RequestPriority;
    title: string;
    description: string;
    requested_supply?: string;
    requested_quantity?: number;
    unit?: string;
    created_by_name: string;
    created_by_role?: string;
  }): Promise<LogisticsRequest> {
    const nowIso = new Date().toISOString();
    const reqNum = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `req-${Date.now()}`;

    const newRequest: LogisticsRequest = {
      id: newId,
      request_number: reqNum,
      created_by_name: data.created_by_name,
      created_by_role: data.created_by_role || 'ZONAL_HEAD',
      zone: data.zone,
      request_type: data.request_type,
      priority: data.priority,
      title: data.title,
      description: data.description,
      requested_supply: data.requested_supply,
      requested_quantity: data.requested_quantity,
      unit: data.unit,
      status: 'PENDING',
      created_at: nowIso,
      updated_at: nowIso
    };

    // 1. Update in-memory & local cache
    this.localRequests.unshift(newRequest);

    // 2. Add history record (Requirement 25)
    const historyItem: RequestHistoryItem = {
      id: `hist-${Date.now()}`,
      request_id: newId,
      action: 'REQUEST_CREATED',
      performed_by: data.created_by_name,
      performed_by_role: 'ZONAL_HEAD',
      message: `Request created by ${data.zone} Zonal Head`,
      created_at: nowIso
    };
    this.localHistory.push(historyItem);

    // 3. Create notification for Main Head (Requirement 17)
    const notification: ZonalNotification = {
      id: `notif-${Date.now()}`,
      recipient_role: 'MAIN_HEAD',
      recipient_zone: null,
      request_id: newId,
      request_number: reqNum,
      title: `NEW ${data.priority} REQUEST: ${data.zone} Zone`,
      message: `${data.title} (#${reqNum})`,
      priority: data.priority,
      is_read: false,
      created_at: nowIso
    };
    this.localNotifications.unshift(notification);

    this.persistState();

    // Trigger subtle chime for Critical/High new request
    if (data.priority === 'CRITICAL' || data.priority === 'HIGH') {
      alertSoundService.playChime();
    }

    // 4. Persist to Supabase if connected
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('logistics_requests').insert([{
          request_number: reqNum,
          created_by_name: data.created_by_name,
          created_by_role: 'ZONAL_HEAD',
          zone: data.zone,
          request_type: data.request_type,
          priority: data.priority,
          title: data.title,
          description: data.description,
          requested_supply: data.requested_supply,
          requested_quantity: data.requested_quantity,
          unit: data.unit,
          status: 'PENDING'
        }]);
      } catch (err) {
        // Fallback: Also insert as a system alert in Supabase alerts table to ensure live persistence
        try {
          await supabase.from('alerts').insert([{
            alert_type: 'SYSTEM ALERT',
            severity: data.priority,
            title: `[${reqNum}] ${data.title} (${data.zone})`,
            message: data.description,
            root_cause: JSON.stringify({
              request_id: newId,
              request_number: reqNum,
              zone: data.zone,
              supply: data.requested_supply,
              qty: data.requested_quantity,
              unit: data.unit,
              status: 'PENDING'
            }),
            status: 'ACTIVE'
          }]);
        } catch (e) {}
      }
    }

    return newRequest;
  }

  /**
   * Main Head acknowledges request (Requirement 12)
   */
  public async acknowledgeRequest(requestId: string, responderName: string): Promise<boolean> {
    const req = this.localRequests.find(r => r.id === requestId);
    if (!req) return false;

    const nowIso = new Date().toISOString();
    req.status = 'ACKNOWLEDGED';
    req.acknowledged_at = nowIso;
    req.updated_at = nowIso;

    // Timeline event
    const historyItem: RequestHistoryItem = {
      id: `hist-${Date.now()}`,
      request_id: requestId,
      action: 'ACKNOWLEDGED',
      performed_by: responderName || 'Main Head of Logistics',
      performed_by_role: 'MAIN_HEAD',
      message: 'Acknowledged by Main Head',
      created_at: nowIso
    };
    this.localHistory.push(historyItem);

    // Notification for Originating Zonal Head (Requirement 16)
    const notification: ZonalNotification = {
      id: `notif-${Date.now()}`,
      recipient_role: 'ZONAL_HEAD',
      recipient_zone: req.zone,
      request_id: req.id,
      request_number: req.request_number,
      title: `Request #${req.request_number} Acknowledged`,
      message: `Your request #${req.request_number} has been acknowledged by the Main Head.`,
      priority: req.priority,
      is_read: false,
      created_at: nowIso
    };
    this.localNotifications.unshift(notification);

    this.persistState();

    // Supabase update
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('logistics_requests')
          .update({
            status: 'ACKNOWLEDGED',
            acknowledged_at: nowIso,
            updated_at: nowIso
          })
          .eq('id', requestId);
      } catch (e) {}
    }

    return true;
  }

  /**
   * Main Head takes action / marks In Progress (Requirement 13)
   */
  public async takeActionRequest(requestId: string, actionNote: string, responderName: string): Promise<boolean> {
    const req = this.localRequests.find(r => r.id === requestId);
    if (!req) return false;

    const nowIso = new Date().toISOString();
    req.status = 'IN_PROGRESS';
    req.in_progress_at = nowIso;
    req.main_head_response = actionNote;
    req.updated_at = nowIso;

    const historyItem: RequestHistoryItem = {
      id: `hist-${Date.now()}`,
      request_id: requestId,
      action: 'IN_PROGRESS',
      performed_by: responderName || 'Main Head of Logistics',
      performed_by_role: 'MAIN_HEAD',
      message: `Action initiated: ${actionNote}`,
      created_at: nowIso
    };
    this.localHistory.push(historyItem);

    // Notification for Zonal Head (Requirement 16)
    const notification: ZonalNotification = {
      id: `notif-${Date.now()}`,
      recipient_role: 'ZONAL_HEAD',
      recipient_zone: req.zone,
      request_id: req.id,
      request_number: req.request_number,
      title: `Action Initiated for #${req.request_number}`,
      message: `Action has been initiated for request #${req.request_number}: ${actionNote}`,
      priority: req.priority,
      is_read: false,
      created_at: nowIso
    };
    this.localNotifications.unshift(notification);

    this.persistState();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('logistics_requests')
          .update({
            status: 'IN_PROGRESS',
            in_progress_at: nowIso,
            main_head_response: actionNote,
            updated_at: nowIso
          })
          .eq('id', requestId);
      } catch (e) {}
    }

    return true;
  }

  /**
   * Main Head resolves request (Requirement 14)
   */
  public async resolveRequest(requestId: string, resolutionNote: string, responderName: string): Promise<boolean> {
    const req = this.localRequests.find(r => r.id === requestId);
    if (!req) return false;

    const nowIso = new Date().toISOString();
    req.status = 'RESOLVED';
    req.resolved_at = nowIso;
    if (resolutionNote) {
      req.main_head_response = resolutionNote;
    }
    req.updated_at = nowIso;

    const historyItem: RequestHistoryItem = {
      id: `hist-${Date.now()}`,
      request_id: requestId,
      action: 'RESOLVED',
      performed_by: responderName || 'Main Head of Logistics',
      performed_by_role: 'MAIN_HEAD',
      message: resolutionNote ? `Request marked Resolved: ${resolutionNote}` : 'Request marked Resolved by Main Head.',
      created_at: nowIso
    };
    this.localHistory.push(historyItem);

    // Notification for Zonal Head (Requirement 16)
    const notification: ZonalNotification = {
      id: `notif-${Date.now()}`,
      recipient_role: 'ZONAL_HEAD',
      recipient_zone: req.zone,
      request_id: req.id,
      request_number: req.request_number,
      title: `Request #${req.request_number} Resolved`,
      message: `Your request #${req.request_number} has been resolved by Main Head.`,
      priority: 'LOW',
      is_read: false,
      created_at: nowIso
    };
    this.localNotifications.unshift(notification);

    this.persistState();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('logistics_requests')
          .update({
            status: 'RESOLVED',
            resolved_at: nowIso,
            main_head_response: req.main_head_response,
            updated_at: nowIso
          })
          .eq('id', requestId);
      } catch (e) {}
    }

    return true;
  }

  /**
   * Escalate an active alert to Main Head (Requirement 18)
   */
  public async escalateAlertToMainHead(alert: AlertItem, officerName: string): Promise<LogisticsRequest> {
    // Determine zone name
    let zone: LogisticsZone = 'Srinagar';
    const locName = (alert.location_name || '').toLowerCase();
    if (locName.includes('jaisalmer')) zone = 'Jaisalmer';
    else if (locName.includes('ahmedabad')) zone = 'Ahmedabad';
    else if (locName.includes('kutch')) zone = 'Kutch';

    // Map severity to Priority
    const priority: RequestPriority = 
      alert.severity === 'CRITICAL' ? 'CRITICAL' : 
      alert.severity === 'HIGH' ? 'HIGH' : 
      alert.severity === 'MEDIUM' ? 'MEDIUM' : 'LOW';

    return await this.createRequest({
      zone,
      request_type: 'Logistics Alert',
      priority,
      title: `[ESCALATED ALERT] ${alert.title}`,
      description: `${alert.message}\n\nRoot Cause: ${alert.root_cause || 'Operational anomaly'}\nRecommendations: ${alert.recommendations || 'Urgent Main Head directive required'}`,
      created_by_name: officerName || `${zone} Zonal Officer`,
      created_by_role: 'ZONAL_HEAD'
    });
  }

  /**
   * Automatic Critical Escalation (Phase 5 - Mandatory)
   * Whenever AI detects a genuinely CRITICAL condition, automatically escalates to Main Head.
   * Deduplication: If an existing active escalation exists for this zone + supply item,
   * updates the numbers without creating duplicate requests or repeated buzzing.
   */
  public async autoEscalateCriticalRequirement(
    reqItem: AIRequirementItem,
    zone: LogisticsZone,
    weatherRisk: string = 'HIGH',
    transportAvailPct: number = 75
  ): Promise<LogisticsRequest | null> {
    // 1. Check for existing active escalation for this zone and supply item
    const existingIndex = this.localRequests.findIndex(r => 
      r.zone === zone &&
      r.requested_supply === reqItem.supply_name &&
      r.status !== 'RESOLVED'
    );

    const nowIso = new Date().toISOString();
    const explanation = 
      `Critical shortage detected in ${zone}.\n\n` +
      `Current stock: ${reqItem.current_stock.toLocaleString()} ${reqItem.unit}\n` +
      `Forecast demand: ${reqItem.projected_demand.toLocaleString()} ${reqItem.unit}\n` +
      `Projected shortage: ${reqItem.projected_shortfall.toLocaleString()} ${reqItem.unit}\n` +
      `Estimated replenishment lead time: ${reqItem.lead_time_days} days\n` +
      `Transport capacity: ${transportAvailPct}%\n` +
      `Weather/access risk: ${weatherRisk}\n\n` +
      `AI Recommendation:\nImmediate replenishment required.`;

    if (existingIndex !== -1) {
      // Deduplication: Update existing active escalation with latest model figures, do NOT buzz again
      const existing = this.localRequests[existingIndex];
      existing.current_inventory = reqItem.current_stock;
      existing.forecast_demand = reqItem.projected_demand;
      existing.projected_shortage = reqItem.projected_shortfall;
      existing.requested_quantity = reqItem.suggested_order_qty || reqItem.projected_shortfall;
      existing.lead_time_days = reqItem.lead_time_days;
      existing.transport_capacity_pct = transportAvailPct;
      existing.weather_risk_level = weatherRisk;
      existing.terrain_risk_note = reqItem.transport_constraint_note;
      existing.ai_explanation = explanation;
      existing.updated_at = nowIso;

      this.persistState();
      return existing;
    }

    // 2. Genuinely new critical escalation: Create persistent request
    const count = this.localRequests.length + 1045;
    const reqNum = `REQ-AI-${count}`;
    const newId = `req-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newEscalation: LogisticsRequest = {
      id: newId,
      request_number: reqNum,
      source: 'AI DETECTED',
      created_by_name: 'AI Predictive Engine',
      created_by_role: 'SYSTEM',
      zone,
      request_type: 'Emergency Requirement',
      priority: 'CRITICAL',
      title: `[AI DETECTED] Critical Shortage: ${reqItem.supply_name}`,
      description: explanation,
      requested_supply: reqItem.supply_name,
      requested_quantity: reqItem.suggested_order_qty || reqItem.projected_shortfall,
      unit: reqItem.unit,
      status: 'PENDING',
      current_inventory: reqItem.current_stock,
      forecast_demand: reqItem.projected_demand,
      projected_shortage: reqItem.projected_shortfall,
      lead_time_days: reqItem.lead_time_days,
      transport_capacity_pct: transportAvailPct,
      weather_risk_level: weatherRisk,
      terrain_risk_note: reqItem.transport_constraint_note,
      ai_explanation: explanation,
      created_at: nowIso,
      updated_at: nowIso
    };

    this.localRequests.unshift(newEscalation);

    // Timeline history
    this.localHistory.push({
      id: `hist-ai-${Date.now()}`,
      request_id: newId,
      action: 'AI_CRITICAL_ESCALATION',
      performed_by: 'AI Predictive Engine',
      performed_by_role: 'SYSTEM',
      message: `AI automatically escalated critical requirement for ${reqItem.supply_name} (${reqItem.projected_shortfall.toLocaleString()} ${reqItem.unit} shortfall) to Main Head.`,
      created_at: nowIso
    });

    // Notification for Main Head
    this.localNotifications.unshift({
      id: `notif-ai-${Date.now()}`,
      recipient_role: 'MAIN_HEAD',
      recipient_zone: null,
      request_id: newId,
      request_number: reqNum,
      title: `CRITICAL AI ESCALATION: ${zone} Sector`,
      message: `Immediate replenishment required for ${reqItem.supply_name} (#${reqNum})`,
      priority: 'CRITICAL',
      is_read: false,
      created_at: nowIso
    });

    // Notification for Zonal Head of that zone
    this.localNotifications.unshift({
      id: `notif-ai-zonal-${Date.now()}`,
      recipient_role: 'ZONAL_HEAD',
      recipient_zone: zone,
      request_id: newId,
      request_number: reqNum,
      title: `AI Escalated Critical Shortage to Main Head`,
      message: `${reqItem.supply_name}: ${reqItem.projected_shortfall.toLocaleString()} ${reqItem.unit} shortfall (#${reqNum})`,
      priority: 'CRITICAL',
      is_read: false,
      created_at: nowIso
    });

    this.persistState();

    // Buzz ONCE for new critical escalation
    alertSoundService.playCriticalBuzzer();

    // Persist to Supabase if connected
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('logistics_requests').insert([{
          request_number: reqNum,
          created_by_name: 'AI Predictive Engine',
          created_by_role: 'SYSTEM',
          zone,
          request_type: 'Emergency Requirement',
          priority: 'CRITICAL',
          title: `[AI DETECTED] Critical Shortage: ${reqItem.supply_name}`,
          description: explanation,
          requested_supply: reqItem.supply_name,
          requested_quantity: reqItem.suggested_order_qty || reqItem.projected_shortfall,
          unit: reqItem.unit,
          status: 'PENDING'
        }]);
      } catch (err) {
        try {
          await supabase.from('alerts').insert([{
            alert_type: 'PREDICTIVE SHORTAGE',
            severity: 'CRITICAL',
            title: `[AI DETECTED] Critical Shortage: ${reqItem.supply_name} (${zone})`,
            message: explanation,
            status: 'ACTIVE'
          }]);
        } catch (e) {}
      }
    }

    return newEscalation;
  }

  /**
   * Get notifications for role & zone
   */
  public getNotifications(role: UserRole | string, zone?: LogisticsZone | null): ZonalNotification[] {
    return this.localNotifications.filter(n => {
      if (role === 'MAIN_HEAD') {
        return n.recipient_role === 'MAIN_HEAD' || n.recipient_role === 'ALL';
      }
      if (role === 'ZONAL_HEAD' && zone) {
        return (n.recipient_role === 'ZONAL_HEAD' || n.recipient_role === 'ALL') &&
          (!n.recipient_zone || n.recipient_zone.toLowerCase() === zone.toLowerCase());
      }
      return false;
    });
  }

  public markNotificationRead(notifId: string): void {
    const notif = this.localNotifications.find(n => n.id === notifId);
    if (notif) {
      notif.is_read = true;
      this.persistState();
    }
  }

  public getSummaryStats(userRole: UserRole | string, userZone?: LogisticsZone | null) {
    let requests = this.localRequests;
    if (userRole === 'ZONAL_HEAD' && userZone) {
      requests = requests.filter(r => r.zone.toLowerCase() === userZone.toLowerCase());
    }

    const critical = requests.filter(r => r.priority === 'CRITICAL' && r.status !== 'RESOLVED').length;
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const inProgress = requests.filter(r => r.status === 'IN_PROGRESS').length;
    const resolved = requests.filter(r => r.status === 'RESOLVED').length;

    return { critical, pending, inProgress, resolved, total: requests.length };
  }
}

export const requestService = new RequestService();
