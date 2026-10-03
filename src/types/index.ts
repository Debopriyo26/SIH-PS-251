// ==============================================================================
// VYOMIX — Predictive Logistics Intelligence
// Domain Types & Data Contracts
// ==============================================================================

export type LocationType = 'Logistics Zone' | 'Logistics Base' | 'Transit Depot';
export type NodeStatus = 'operational' | 'attention' | 'critical';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type WarningLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
export type SupplyCategory = 'Food' | 'Fuel' | 'Medical' | 'Water' | 'General Supplies';
export type TransportAvailability = 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE' | 'UNAVAILABLE';
export type AlertType = 'Predictive Shortage' | 'Weather' | 'Inventory' | 'Transport' | 'System';
export type AlertSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DataMode = 'LIVE' | 'DEMO' | 'OFFLINE';

export interface DataStatusInfo {
  mode: DataMode;
  source: string;
  lastUpdated?: string;
  message?: string;
}

export type UserRole = 'MAIN_HEAD' | 'ZONAL_HEAD';
export type LogisticsZone = 'Srinagar' | 'Jaisalmer' | 'Ahmedabad' | 'Kutch';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole | string;
  zone?: LogisticsZone | null;
  avatarUrl?: string;
}

export type RequestType = 
  | 'Supply Request'
  | 'Logistics Alert'
  | 'Emergency Requirement'
  | 'Transport Requirement'
  | 'Other';

export type RequestPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RequestStatus = 'PENDING' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';

export interface LogisticsRequest {
  id: string;
  request_number: string;
  created_by?: string;
  created_by_name: string;
  created_by_role: string;
  zone: LogisticsZone;
  request_type: RequestType;
  priority: RequestPriority;
  title: string;
  description: string;
  requested_supply?: string;
  requested_quantity?: number;
  unit?: string;
  status: RequestStatus;
  main_head_response?: string;
  acknowledged_at?: string;
  in_progress_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RequestHistoryItem {
  id: string;
  request_id: string;
  action: string;
  performed_by: string;
  performed_by_role: string;
  message?: string;
  created_at: string;
}

export interface ZonalNotification {
  id: string;
  recipient_role: UserRole | 'ALL';
  recipient_zone?: LogisticsZone | null;
  request_id?: string;
  request_number?: string;
  title: string;
  message: string;
  priority?: RequestPriority;
  is_read: boolean;
  created_at: string;
}

export interface LocationNode {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  altitude_m: number;
  region: string;
  status: NodeStatus;
  inventory_readiness_pct: number;
  weather_risk: RiskLevel;
  transport_availability_pct: number;
  days_of_cover: number;
  projected_shortage: string;
  notes?: string;
}

export interface SupplyItem {
  id: string;
  item_code: string;
  name: string;
  category: SupplyCategory;
  unit: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  shelf_life_days: number;
  standard_pack_size?: number;
}

export type InventoryTrackingSource = 'Manual' | 'IoT' | 'Demo Sensor';

export interface InventoryRecord {
  id: string;
  location_id: string;
  supply_id: string;
  current_stock: number;
  daily_consumption: number;
  safety_threshold: number;
  reorder_point: number;
  forecast_demand_7d: number;
  days_of_cover: number;
  risk_status: RiskLevel;
  tracking_source?: InventoryTrackingSource;
  last_restocked_at?: string;
  supply?: SupplyItem;
  location?: LocationNode;
}

export interface WeatherObservation {
  id: string;
  location_id: string;
  location_name?: string;
  recorded_at: string;
  temperature_c: number;
  humidity_pct: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  weather_condition: string;
  visibility_km: number;
  warning_level: WarningLevel;
  warning_text: string;
  source: string;
  is_live: boolean;
}

export interface WeatherForecastDay {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  rainfallMm: number;
  rainfallProbPct: number;
  condition: string;
  warningLevel: WarningLevel;
  source: string;
}

export interface TransportAsset {
  id: string;
  asset_code: string;
  name: string;
  type: 'Heavy Transport' | 'Medium Transport' | 'Light 4x4' | 'Specialized Cold-Chain' | 'Convoy Unit';
  capacity_tonnes: number;
  current_location_id?: string;
  destination_location_id?: string;
  current_location_name?: string;
  destination_location_name?: string;
  assigned_route: string;
  availability: TransportAvailability;
  status: string;
  fuel_efficiency_kmpl: number;
  last_updated?: string;
}

export interface DemandForecastPoint {
  date: string;
  historicalDemand?: number;
  forecastDemand: number;
  upperConfidence: number;
  lowerConfidence: number;
  rainfallMm: number;
  riskLevel: RiskLevel;
}

export type AIDecision = 'SUFFICIENT' | 'MONITOR' | 'REPLENISH' | 'URGENT REPLENISH' | 'CRITICAL SHORTAGE';

export interface AIRequirementItem {
  id: string;
  supply_name: string;
  supply_category: SupplyCategory;
  unit: string;
  current_stock: number;
  expected_incoming: number;
  projected_available: number;
  projected_demand: number;
  safety_stock: number;
  projected_shortfall: number;
  decision: AIDecision;
  priority: RequestPriority;
  reasons: string[];
  lead_time_days: number;
  weather_impact_factor: number;
  terrain_impact_factor: number;
  transport_constraint_note: string;
  suggested_order_qty: number;
}

export interface ForecastSummary {
  locationId: string;
  supplyCategory: SupplyCategory;
  horizonDays: number;
  currentStock: number;
  expectedIncoming: number;
  projectedAvailable: number;
  projectedDemand: number;
  safetyThreshold: number;
  projectedShortfall: number;
  aiDecision: AIDecision;
  confidenceScore?: number;
  isModelCalculated: boolean;
  modelLabel: string;
  riskLevel: RiskLevel;
  riskReasons: string[];
  points: DemandForecastPoint[];
  aiRequirements?: AIRequirementItem[];
}

export interface AlertItem {
  id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  location_id?: string;
  location_name?: string;
  supply_id?: string;
  supply_name?: string;
  category?: SupplyCategory;
  title: string;
  message: string;
  root_cause?: string;
  recommendations?: string;
  is_acknowledged: boolean;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  updated_at?: string;
}

export interface DataSourceStatus {
  id: string;
  code: string;
  name: string;
  source_type: string;
  endpoint_url: string;
  status: 'CONNECTED' | 'AVAILABLE' | 'OPTIONAL' | 'OFFLINE';
  last_sync_at: string;
  records_ingested: number;
  latency_ms: number;
  purpose: string;
  source: string;
  notes: string;
}

export interface SimulationParams {
  demandChangePct: number;
  transportAvailPct: number;
  weatherSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  inventoryStartingPct: number;
}

export interface SimulationCategoryResult {
  category: SupplyCategory;
  baselineDaysOfCover: number;
  simulatedDaysOfCover: number;
  baselineRisk: RiskLevel;
  simulatedRisk: RiskLevel;
  projectedShortageUnits: number;
  unit: string;
  stressFactor: string;
}

export interface SimulationOutcome {
  baselineRisk: RiskLevel;
  simulatedRisk: RiskLevel;
  affectedCategories: SupplyCategory[];
  overallReadinessBefore: number;
  overallReadinessAfter: number;
  categoryResults: SimulationCategoryResult[];
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sourcesUsed?: string[];
  suggestedPrompts?: string[];
}
