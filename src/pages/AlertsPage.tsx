import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  MapPin, 
  Search, 
  Check, 
  CheckCircle2, 
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Info,
  Send
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { alertService } from '../services/alertService';
import { requestService } from '../services/requestService';
import { useAuth } from '../lib/authContext';
import { AlertItem, AlertSeverity, AlertType } from '../types';
import { sortAlertsBySeverity } from '../lib/utils';
import { resolveLocationId } from '../lib/zones';

interface AlertsPageProps {
  selectedLocationId: string;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ selectedLocationId }) => {
  const { user } = useAuth();
  const isMainHead = user?.role === 'MAIN_HEAD';
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>(() => {
    if (!isMainHead && user?.zone) {
      return resolveLocationId(user.zone);
    }
    return selectedLocationId || 'ALL';
  });
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [escalatedAlertIds, setEscalatedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vyomix_escalated_alert_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSendToMainHead = async (alert: AlertItem) => {
    if (escalatedAlertIds.includes(alert.id)) return;
    try {
      await requestService.escalateAlertToMainHead(alert, user?.fullName || 'Zonal Officer');
      const updated = [...escalatedAlertIds, alert.id];
      setEscalatedAlertIds(updated);
      localStorage.setItem('vyomix_escalated_alert_ids', JSON.stringify(updated));
      setToastMessage(`Alert "${alert.title}" successfully escalated to Main Head Request Center.`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err: any) {
      console.error('Error escalating alert to Main Head:', err);
      setToastMessage('Failed to escalate alert to Main Head');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  useEffect(() => {
    if (isMainHead && selectedLocationId && selectedLocationId !== locationFilter) {
      setLocationFilter(selectedLocationId);
    }
  }, [selectedLocationId, isMainHead]);

  useEffect(() => {
    loadAlerts();
  }, [locationFilter, severityFilter, user?.role, user?.zone]);

  const loadAlerts = async () => {
    setIsLoading(true);
    const effLocId = !isMainHead && user?.zone ? resolveLocationId(user.zone) : locationFilter;
    const data = await alertService.getAlerts(
      effLocId,
      severityFilter as AlertSeverity | 'ALL',
      'ALL',
      undefined,
      user?.role,
      user?.zone
    );
    // Ensure strict severity sorting (Requirement 7 & 21)
    setAlerts(sortAlertsBySeverity(data));
    setIsLoading(false);
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await alertService.acknowledgeAlert(alertId);
      await loadAlerts();
      setToastMessage('Alert status changed to ACKNOWLEDGED');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err: any) {
      console.error('Error acknowledging alert:', err);
      setToastMessage(err.message || 'Failed to acknowledge alert');
      setTimeout(() => setToastMessage(''), 4500);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await alertService.resolveAlert(alertId);
      await loadAlerts();
      setToastMessage('Alert status changed to RESOLVED');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err: any) {
      console.error('Error resolving alert:', err);
      setToastMessage(err.message || 'Failed to resolve alert');
      setTimeout(() => setToastMessage(''), 4500);
    }
  };

  // Filter alerts by search, status, and location
  const filtered = alerts.filter((a) => {
    // Location filter: if Zonal Head, already isolated. If Main Head, respect dropdown.
    const matchLocation = !isMainHead || locationFilter === 'ALL' || a.location_id === locationFilter ||
      (locationFilter === 'loc-srinagar' && a.location_name?.toLowerCase().includes('srinagar')) ||
      (locationFilter === 'loc-jaisalmer' && a.location_name?.toLowerCase().includes('jaisalmer')) ||
      (locationFilter === 'loc-ahmedabad' && a.location_name?.toLowerCase().includes('ahmedabad')) ||
      (locationFilter === 'loc-kutch' && a.location_name?.toLowerCase().includes('kutch'));

    // Severity filter (Requirement 3)
    const matchSeverity = severityFilter === 'ALL' || a.severity?.toUpperCase() === severityFilter.toUpperCase();

    // Status filter (Requirements 3, 4, 5)
    const alertStatus = (a.status || 'ACTIVE').toUpperCase();
    const matchStatus = statusFilter === 'ALL' || alertStatus === statusFilter;

    // Search filter
    const matchSearch = !searchTerm ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.location_name && a.location_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchLocation && matchSeverity && matchStatus && matchSearch;
  });

  // Calculate tab counts
  const activeCount = alerts.filter(a => (a.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const ackCount = alerts.filter(a => (a.status || '').toUpperCase() === 'ACKNOWLEDGED').length;
  const resCount = alerts.filter(a => (a.status || '').toUpperCase() === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-[#2F6B3C] text-[#2F6B3C] px-4 py-2.5 rounded-xs shadow-lg font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2F6B3C]" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8DFD5] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#1F2933] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#355E3B] inline-block rounded-xs"></span>
            Alerts & Directives
          </h1>
          <p className="font-mono text-xs text-[#52606D] mt-0.5">
            Operational shortage warnings, meteorological notices, and fleet advisories
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#52606D] bg-white px-3.5 py-1.5 rounded-xs border border-[#D8DFD5] shadow-xs">
          <Bell className="w-3.5 h-3.5 text-[#355E3B]" />
          <span>ACTIVE ALERTS: <strong className="text-[#1F2933]">{activeCount}</strong></span>
        </div>
      </div>

      {/* Required Filters (Requirement 3: Location, Severity, Status) */}
      <div className="bg-white border border-[#D8DFD5] p-4 rounded-xs shadow-xs space-y-4 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* 1. Location Selector (Requirement 3, 6, 33) */}
            {isMainHead ? (
              <div className="flex items-center gap-2">
                <span className="text-[#52606D] font-bold text-[11px] uppercase">Location:</span>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-xs font-mono text-[#1F2933] px-3 py-1.5 rounded-xs focus:outline-hidden cursor-pointer font-semibold"
                >
                  <option value="ALL">All Locations</option>
                  <option value="loc-srinagar">Srinagar</option>
                  <option value="loc-jaisalmer">Jaisalmer</option>
                  <option value="loc-ahmedabad">Ahmedabad</option>
                  <option value="loc-kutch">Kutch</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[#52606D] font-bold text-[11px] uppercase">Zone:</span>
                <span className="px-2.5 py-1 bg-[#E8EEE5] text-[#355E3B] border border-[#CAD3C8] rounded-xs font-mono text-xs font-bold uppercase">
                  MY ZONE: {user?.zone || 'SRINAGAR'}
                </span>
              </div>
            )}

            {/* 2. Severity Selector (Requirement 3 & 7) */}
            <div className="flex items-center gap-2">
              <span className="text-[#52606D] font-bold text-[11px] uppercase">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-xs font-mono text-[#1F2933] px-3 py-1.5 rounded-xs focus:outline-hidden cursor-pointer font-semibold"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">1. Critical (Top Priority)</option>
                <option value="HIGH">2. High</option>
                <option value="MEDIUM">3. Medium</option>
                <option value="LOW">4. Low</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#52606D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search alert title, message..."
              className="pl-9 pr-4 py-1.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-xs font-mono text-[#1F2933] rounded-xs focus:outline-hidden w-64"
            />
          </div>
        </div>

        {/* 3. Status Tabs (Requirement 3, 4, 5: All / Active / Acknowledged / Resolved) */}
        <div className="flex items-center gap-1.5 border-t border-[#F0F4EE] pt-3">
          <span className="text-[#52606D] font-bold text-[11px] uppercase mr-1">Status:</span>
          {[
            { id: 'ACTIVE' as const, label: 'Active', count: activeCount },
            { id: 'ACKNOWLEDGED' as const, label: 'Acknowledged', count: ackCount },
            { id: 'RESOLVED' as const, label: 'Resolved', count: resCount },
            { id: 'ALL' as const, label: 'All', count: alerts.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-xs transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#355E3B] text-white border border-[#1F3D27] shadow-xs'
                  : 'bg-[#F0F4EE] text-[#52606D] hover:text-[#1F2933] border border-[#D8DFD5]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-[#D8DFD5] text-[#1F2933]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alert List strictly sorted by severity (Requirement 7) */}
      <div className="space-y-3 font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#D8DFD5] p-12 text-center text-[#52606D] rounded-xs shadow-xs space-y-1">
            <CheckCheck className="w-8 h-8 text-[#2F6B3C] mx-auto mb-2 opacity-80" />
            <div className="font-bold text-[#1F2933]">No alerts found matching the current filters.</div>
            <div className="text-[11px]">Select another location or status tab to view historical alerts.</div>
          </div>
        ) : (
          filtered.map((alert) => {
            const isResolved = alert.status === 'RESOLVED';
            const isAck = alert.status === 'ACKNOWLEDGED';
            const isAct = alert.status === 'ACTIVE';

            return (
              <div
                key={alert.id}
                className={`bg-white border p-4 rounded-xs shadow-xs space-y-3 transition-all ${
                  alert.severity === 'CRITICAL' 
                    ? 'border-l-4 border-l-[#B42318] border-[#D8DFD5]' 
                    : alert.severity === 'HIGH'
                    ? 'border-l-4 border-l-[#C2410C] border-[#D8DFD5]'
                    : alert.severity === 'MEDIUM'
                    ? 'border-l-4 border-l-[#A16207] border-[#D8DFD5]'
                    : 'border-l-4 border-l-[#355E3B] border-[#D8DFD5]'
                }`}
              >
                {/* Alert Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F4EE] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#355E3B] uppercase font-bold tracking-wider">
                      {alert.alert_type}
                    </span>
                    <span className="text-[#CAD3C8]">•</span>
                    <div className="flex items-center gap-1 text-[#1F2933]">
                      <MapPin className="w-3.5 h-3.5 text-[#355E3B]" />
                      <span className="font-bold">{alert.location_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#52606D] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#52606D]" />
                      <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                    </span>
                    <StatusBadge status={alert.status} size="sm" />
                    <StatusBadge status={alert.severity} size="sm" pulse={alert.severity === 'CRITICAL'} />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-tactical font-bold text-sm text-[#1F2933]">
                    {alert.title}
                  </h3>
                  <p className="text-[#52606D] text-[11px] leading-relaxed">
                    {alert.message}
                  </p>
                  {alert.recommendations && (
                    <div className="text-[11px] text-[#2F6B3C] pt-1">
                      <strong>Recommended Directive:</strong> {alert.recommendations}
                    </div>
                  )}
                </div>

                {/* Timestamps for Acknowledged / Resolved tracking (Requirement 5) */}
                {(alert.acknowledged_at || alert.resolved_at) && (
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#52606D] bg-[#F0F4EE] p-2 rounded-xs border border-[#D8DFD5]">
                    {alert.acknowledged_at && (
                      <span>
                        Acknowledged: <strong className="text-[#1F2933]">{new Date(alert.acknowledged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</strong>
                      </span>
                    )}
                    {alert.resolved_at && (
                      <span>
                        Resolved: <strong className="text-[#2F6B3C]">{new Date(alert.resolved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons: Acknowledge & Resolve (Requirements 4, 5) & Escalation (Requirement 18) */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#F0F4EE]">
                  {/* Escalation to Main Head (Requirement 18) */}
                  {!isResolved && (
                    <button
                      onClick={() => handleSendToMainHead(alert)}
                      disabled={escalatedAlertIds.includes(alert.id)}
                      className={`px-3 py-1.5 rounded-xs text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                        escalatedAlertIds.includes(alert.id)
                          ? 'bg-[#F0F4EE] text-[#52606D] border-[#CAD3C8] cursor-not-allowed opacity-80'
                          : 'bg-[#B42318] hover:bg-[#912018] text-white border-[#7A271A] shadow-xs'
                      }`}
                      title={escalatedAlertIds.includes(alert.id) ? 'Already escalated to Main Head' : 'Escalate alert to Main Head Request Center'}
                    >
                      <Send className="w-3 h-3" />
                      <span>{escalatedAlertIds.includes(alert.id) ? 'ESCALATED TO MAIN HEAD' : 'SEND TO MAIN HEAD'}</span>
                    </button>
                  )}

                  {isAct && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#F0F4EE] text-[#355E3B] border border-[#355E3B] rounded-xs text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      [ACKNOWLEDGE]
                    </button>
                  )}

                  {!isResolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3.5 py-1.5 bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] rounded-xs text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-[#B5A47A]" />
                      <span>[RESOLVE]</span>
                    </button>
                  )}

                  {isResolved && (
                    <span className="text-[11px] font-bold text-[#2F6B3C] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B3C]" />
                      <span>Archived in Resolved Directives</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
