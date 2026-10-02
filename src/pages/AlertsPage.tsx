import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Search, 
  Check, 
  XCircle,
  Filter
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { alertService } from '../services/alertService';
import { AlertItem, AlertSeverity, AlertType } from '../types';

interface AlertsPageProps {
  selectedLocationId: string;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ selectedLocationId }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [selectedLocationId]);

  const loadAlerts = async () => {
    const data = await alertService.getAlerts(selectedLocationId);
    setAlerts(data);
  };

  const handleAcknowledge = async (alertId: string) => {
    await alertService.acknowledgeAlert(alertId);
    await loadAlerts();
    setToastMessage('Alert status updated to ACKNOWLEDGED');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleResolve = async (alertId: string) => {
    await alertService.resolveAlert(alertId);
    await loadAlerts();
    setToastMessage('Alert resolved successfully');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filtered = alerts.filter((a) => {
    const matchCategory = categoryFilter === 'ALL' || a.alert_type === categoryFilter;
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchSearch = !searchTerm ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.location_name && a.location_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchStatus && matchSearch;
  });

  const categories = ['ALL', 'Predictive Shortage', 'Weather', 'Inventory', 'Transport', 'System'];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#101B13] border border-[#3FA34D] text-[#4ade80] px-4 py-2.5 rounded-xs shadow-xl font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3FA34D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Alerts & Directives
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Supply shortage notifications, meteorological warnings, and fleet maintenance advisories
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#8B9B8E] bg-[#101B13] px-3.5 py-1.5 rounded-xs border border-[#263F2B]">
          <Bell className="w-3.5 h-3.5 text-[#B5A47A]" />
          <span>ACTIVE ALERTS: <strong className="text-white">{alerts.filter(a => a.status === 'ACTIVE').length}</strong></span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Categories matching requirement 21 */}
          <div className="flex items-center gap-1 bg-[#101B13] p-1 rounded-xs border border-[#263F2B]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer text-[11px] ${
                  categoryFilter === cat
                    ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:text-[#E7E9E2]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[#101B13] p-1 rounded-xs border border-[#263F2B]">
            {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer text-[11px] ${
                  statusFilter === st
                    ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:text-[#E7E9E2]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#8B9B8E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts or locations..."
            className="pl-9 pr-4 py-2 bg-[#101B13] border border-[#263F2B] text-xs font-mono text-[#E7E9E2] rounded-xs focus:outline-hidden w-64"
          />
        </div>
      </div>

      {/* Simplified Alert List matching requirement 21 */}
      <div className="space-y-3 font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-10 text-center text-[#8B9B8E] rounded-xs">
            No alerts found matching the current filters.
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className="tactical-border bg-[#101B13] border border-[#263F2B] p-4 rounded-xs shadow-md space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A2C1E] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#B5A47A] uppercase font-bold tracking-wider">
                    {alert.alert_type}
                  </span>
                  <span className="text-[#8B9B8E]">•</span>
                  <div className="flex items-center gap-1 text-[#E7E9E2]">
                    <MapPin className="w-3 h-3 text-[#596B3A]" />
                    <span className="font-semibold">{alert.location_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8B9B8E] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                  </span>
                  <StatusBadge status={alert.status} size="sm" />
                  <StatusBadge status={alert.severity} size="sm" pulse={alert.severity === 'CRITICAL'} />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-tactical font-semibold text-sm text-[#E7E9E2]">
                  {alert.title}
                </h3>
                <p className="text-[#8B9B8E] text-[11px] leading-relaxed">
                  {alert.message}
                </p>
                {alert.recommendations && (
                  <div className="text-[11px] text-[#4ade80] pt-1">
                    <strong>Recommended Directive:</strong> {alert.recommendations}
                  </div>
                )}
              </div>

              {/* Action Buttons: Acknowledge & Resolve */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1A2C1E]">
                {alert.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-3 py-1.5 bg-[#101B13] hover:bg-[#1A2C1E] text-[#B5A47A] border border-[#263F2B] hover:border-[#596B3A] rounded-xs text-[11px] transition-colors cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3.5 py-1.5 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-[#3FA34D]" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
