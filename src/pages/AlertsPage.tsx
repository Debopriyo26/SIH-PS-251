import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Filter, 
  Search, 
  Flame, 
  Droplet, 
  HeartPulse, 
  Utensils, 
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { alertService } from '../services/alertService';
import { AlertItem, AlertSeverity, AlertType } from '../types';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [actionToast, setActionToast] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const data = await alertService.getAlerts();
    setAlerts(data);
    if (data.length > 0 && !selectedAlert) setSelectedAlert(data[0]);
  };

  const handleAcknowledge = async (alertId: string) => {
    await alertService.acknowledgeAlert(alertId);
    await loadAlerts();
    setActionToast('Alert logged as ACKNOWLEDGED by Command');
    setTimeout(() => setActionToast(''), 3000);
  };

  const handleResolve = async (alertId: string) => {
    await alertService.resolveAlert(alertId);
    await loadAlerts();
    setActionToast('Alert marked as RESOLVED');
    setTimeout(() => setActionToast(''), 3000);
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchSev = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchType = filterType === 'ALL' || a.alert_type === filterType;
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchSearch = !searchTerm || 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.location_name && a.location_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSev && matchType && matchStatus && matchSearch;
  });

  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {actionToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#101B13] border border-[#3FA34D] text-[#4ade80] px-4 py-2.5 rounded-xs shadow-xl font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3FA34D]" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Tactical Alert & Directives Center
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Predictive Supply Depletions, IMD Weather Warnings, Fleet Reductions, and System Notifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#101B13] px-3.5 py-1.5 rounded-xs border border-[#263F2B] font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#C43C3C] animate-pulse" />
            <span>ACTIVE ALERTS: <strong className="text-white">{activeCount}</strong></span>
            <span className="text-[#8B9B8E]">|</span>
            <span className="text-[#f87171]">{criticalCount} CRITICAL</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#101B13] p-1 rounded-xs border border-[#263F2B] font-mono text-xs">
            {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xs transition-colors ${
                  filterStatus === st
                    ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:text-[#E7E9E2]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-[#101B13] p-1 rounded-xs border border-[#263F2B] font-mono text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1.5 rounded-xs transition-colors ${
                  filterSeverity === sev
                    ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:text-[#E7E9E2]'
                }`}
              >
                {sev}
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
            placeholder="Search alerts, locations, or causes..."
            className="pl-9 pr-4 py-2 bg-[#101B13] border border-[#263F2B] text-xs font-mono text-[#E7E9E2] rounded-xs focus:outline-hidden w-64"
          />
        </div>
      </div>

      {/* Main Alerts Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Alerts List */}
        <div className="lg:col-span-6 space-y-3">
          {filteredAlerts.map((alert) => {
            const isSelected = selectedAlert?.id === alert.id;
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`tactical-border p-4 rounded-xs cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-[#263F2B] border-[#596B3A] shadow-lg'
                    : 'bg-[#101B13] border-[#263F2B] hover:border-[#596B3A]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#B5A47A] tracking-wider uppercase font-semibold">
                      {alert.alert_type}
                    </span>
                    {alert.category && (
                      <span className="text-[10px] font-mono text-[#8B9B8E] bg-[#07100B] px-1.5 py-0.2 rounded-xs border border-[#1A2C1E]">
                        {alert.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alert.status} size="sm" />
                    <StatusBadge status={alert.severity} size="sm" pulse={alert.severity === 'CRITICAL'} />
                  </div>
                </div>

                <h3 className="font-tactical font-semibold text-sm text-[#E7E9E2] mb-1.5">
                  {alert.title}
                </h3>

                <p className="font-mono text-xs text-[#8B9B8E] line-clamp-2 leading-relaxed">
                  {alert.message}
                </p>

                <div className="mt-3 pt-2.5 border-t border-[#1A2C1E] flex items-center justify-between font-mono text-[11px] text-[#8B9B8E]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#596B3A]" />
                    <span>{alert.location_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#B5A47A]" />
                    <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 6 Cols: Focused Alert Directive & Resolution Panel */}
        <div className="lg:col-span-6">
          {selectedAlert ? (
            <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-6 rounded-sm shadow-xl space-y-6 sticky top-24">
              <div className="flex items-start justify-between gap-4 border-b border-[#1A2C1E] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-[#B5A47A] tracking-wider uppercase font-bold">
                      {selectedAlert.alert_type}
                    </span>
                    <span className="text-[#8B9B8E]">•</span>
                    <span className="font-mono text-[11px] text-[#8B9B8E]">{selectedAlert.location_name}</span>
                  </div>
                  <h2 className="font-tactical font-bold text-lg text-[#E7E9E2]">
                    {selectedAlert.title}
                  </h2>
                </div>
                <StatusBadge status={selectedAlert.severity} pulse={selectedAlert.severity === 'CRITICAL'} />
              </div>

              {/* Message Details */}
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
                  <span className="text-[#8B9B8E] text-[10px] uppercase font-semibold block">
                    Operational Situation Description:
                  </span>
                  <p className="text-[#E7E9E2] text-xs leading-relaxed">
                    {selectedAlert.message}
                  </p>
                </div>

                {selectedAlert.root_cause && (
                  <div className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
                    <span className="text-[#D39B32] text-[10px] uppercase font-semibold block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Root Cause Analysis (Explainable AI):
                    </span>
                    <p className="text-[#8B9B8E] text-xs leading-relaxed">
                      {selectedAlert.root_cause}
                    </p>
                  </div>
                )}

                {selectedAlert.recommendations && (
                  <div className="p-3.5 bg-[#07100B] border border-[#3FA34D]/40 rounded-xs space-y-1">
                    <span className="text-[#4ade80] text-[10px] uppercase font-semibold block flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Recommended Tactical Directive:
                    </span>
                    <p className="text-[#E7E9E2] text-xs leading-relaxed font-semibold">
                      {selectedAlert.recommendations}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1A2C1E]">
                <div className="font-mono text-[11px] text-[#8B9B8E]">
                  Status: <strong className="text-white">{selectedAlert.status}</strong>
                </div>

                <div className="flex items-center gap-3">
                  {selectedAlert.status !== 'ACKNOWLEDGED' && selectedAlert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAcknowledge(selectedAlert.id)}
                      className="px-4 py-2 bg-[#101B13] hover:bg-[#1A2C1E] text-[#B5A47A] border border-[#263F2B] hover:border-[#B5A47A] rounded-xs font-tactical text-xs tracking-wider uppercase transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {selectedAlert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolve(selectedAlert.id)}
                      className="px-5 py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3FA34D]" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-12 text-center text-[#8B9B8E] font-mono text-xs rounded-sm">
              Select an alert from the left to view root cause analysis and directives.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
