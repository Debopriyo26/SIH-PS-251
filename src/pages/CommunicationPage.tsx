import React, { useState, useEffect } from 'react';
import { 
  LogisticsRequest, 
  UserRole, 
  LogisticsZone, 
  RequestPriority, 
  RequestStatus 
} from '../types';
import { requestService, REQUEST_PRIORITY_WEIGHT } from '../services/requestService';
import { useAuth } from '../lib/authContext';
import { RequestDetailModal } from '../components/communication/RequestDetailModal';
import { RequestSupportModal } from '../components/communication/RequestSupportModal';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Plus, 
  MapPin, 
  Shield, 
  Search, 
  RefreshCw, 
  Calendar, 
  Package, 
  User as UserIcon,
  ChevronRight,
  Inbox
} from 'lucide-react';

export const CommunicationPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LogisticsRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LogisticsRequest | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filters (Requirement 10)
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const isMainHead = user?.role === 'MAIN_HEAD';
  const userZone = (user?.zone as LogisticsZone) || 'Srinagar';

  const loadRequests = async () => {
    setIsLoading(true);
    const data = await requestService.getRequests(
      user?.role || 'ZONAL_HEAD',
      user?.zone as LogisticsZone,
      zoneFilter,
      priorityFilter,
      statusFilter
    );
    setRequests(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, [zoneFilter, priorityFilter, statusFilter, user?.role, user?.zone]);

  const summary = requestService.getSummaryStats(
    user?.role || 'ZONAL_HEAD',
    user?.zone as LogisticsZone
  );

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.request_number.toLowerCase().includes(q) ||
      r.zone.toLowerCase().includes(q) ||
      (r.requested_supply && r.requested_supply.toLowerCase().includes(q))
    );
  });

  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]';
      case 'HIGH':
        return 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]';
      case 'MEDIUM':
        return 'bg-[#FEF08A] text-[#A16207] border-[#FDE047]';
      default:
        return 'bg-[#F0FDF4] text-[#2F6B3C] border-[#86EFAC]';
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-[#F0F4EE] text-[#52606D] border-[#CAD3C8]';
      case 'ACKNOWLEDGED':
        return 'bg-[#E8EEE5] text-[#355E3B] border-[#CAD3C8]';
      case 'IN_PROGRESS':
        return 'bg-[#FEF08A] text-[#854D0E] border-[#FDE047]';
      case 'RESOLVED':
        return 'bg-[#E8F5E9] text-[#2F6B3C] border-[#A5D6A7]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8DFD5] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-6 bg-[#355E3B] inline-block rounded-xs"></span>
            <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#1F2933] uppercase">
              {isMainHead ? 'Main Head — Zonal Request Center' : `${userZone} — Zonal Coordination`}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider ${
              isMainHead ? 'bg-[#355E3B] text-white' : 'bg-[#6B7444] text-white'
            }`}>
              {isMainHead ? '★ MAIN HEAD COMMAND' : `⚑ ${userZone} COMMAND`}
            </span>
          </div>
          <p className="font-mono text-xs text-[#52606D]">
            {isMainHead 
              ? 'Central logistics directive & supply allocation dispatch interface for all operational zones'
              : `Submit regional supply requisitions, track lifecycle status, and communicate directly with Main Head`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isMainHead && (
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="px-4 py-2 bg-[#355E3B] hover:bg-[#1F3D27] text-white font-mono text-xs font-bold rounded-xs cursor-pointer shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-[#B5A47A]" />
              <span>REQUEST SUPPORT</span>
            </button>
          )}

          <button
            onClick={loadRequests}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F0F4EE] border border-[#D8DFD5] text-[#1F2933] rounded-xs font-mono text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#355E3B] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Head Command Summary (Requirement 19) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="bg-white border border-[#D8DFD5] p-3.5 rounded-xs shadow-xs border-t-2 border-t-[#B42318]">
          <span className="text-[10px] text-[#52606D] uppercase block font-bold">Critical Requests</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-tactical text-2xl font-bold text-[#B42318]">{summary.critical}</span>
            <AlertTriangle className="w-4 h-4 text-[#B42318]" />
          </div>
        </div>

        <div className="bg-white border border-[#D8DFD5] p-3.5 rounded-xs shadow-xs border-t-2 border-t-[#C2410C]">
          <span className="text-[10px] text-[#52606D] uppercase block font-bold">Pending Directives</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-tactical text-2xl font-bold text-[#C2410C]">{summary.pending}</span>
            <Clock className="w-4 h-4 text-[#C2410C]" />
          </div>
        </div>

        <div className="bg-white border border-[#D8DFD5] p-3.5 rounded-xs shadow-xs border-t-2 border-t-[#A16207]">
          <span className="text-[10px] text-[#52606D] uppercase block font-bold">In Progress</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-tactical text-2xl font-bold text-[#A16207]">{summary.inProgress}</span>
            <Send className="w-4 h-4 text-[#A16207]" />
          </div>
        </div>

        <div className="bg-white border border-[#D8DFD5] p-3.5 rounded-xs shadow-xs border-t-2 border-t-[#2F6B3C]">
          <span className="text-[10px] text-[#52606D] uppercase block font-bold">Resolved Requests</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-tactical text-2xl font-bold text-[#2F6B3C]">{summary.resolved}</span>
            <CheckCircle2 className="w-4 h-4 text-[#2F6B3C]" />
          </div>
        </div>
      </div>

      {/* Filters (Requirement 10) */}
      <div className="bg-white border border-[#D8DFD5] p-4 rounded-xs shadow-xs space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Zone Filter (Only visible to Main Head) */}
            {isMainHead && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#52606D] text-[11px] uppercase">Zone:</span>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-xs font-bold text-[#1F2933] px-3 py-1.5 rounded-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All 4 Zones</option>
                  <option value="Srinagar">Srinagar</option>
                  <option value="Jaisalmer">Jaisalmer</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Kutch">Kutch</option>
                </select>
              </div>
            )}

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#52606D] text-[11px] uppercase">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-xs font-bold text-[#1F2933] px-3 py-1.5 rounded-xs focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#52606D] text-[11px] uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-xs font-bold text-[#1F2933] px-3 py-1.5 rounded-xs focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#52606D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search request #, supply, title..."
              className="pl-8 pr-3 py-1.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] rounded-xs text-xs text-[#1F2933] focus:outline-hidden w-64"
            />
          </div>
        </div>
      </div>

      {/* Requests Table / Card List */}
      <div className="bg-white border border-[#D8DFD5] rounded-xs shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#D8DFD5] bg-[#F7F8F4] flex items-center justify-between">
          <span className="font-tactical font-bold text-xs uppercase tracking-wider text-[#1F2933] flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#355E3B]" />
            <span>{isMainHead ? 'Zonal Requests Stream' : 'My Submitted Support Requests'}</span>
            <span className="text-[10px] text-[#52606D] font-mono font-normal">({filteredRequests.length} records)</span>
          </span>
          <span className="text-[10px] font-mono text-[#52606D]">
            Sorted strictly: Critical → High → Medium → Low (Newest first)
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center font-mono text-xs text-[#52606D] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#2F6B3C] mx-auto opacity-70" />
            <p className="font-bold text-[#1F2933]">No logistics requests matching selected filters.</p>
            {!isMainHead && (
              <p className="text-[11px]">
                Click <span className="font-bold text-[#355E3B]">[REQUEST SUPPORT]</span> above to submit a new requisition to the Main Head.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#F0F4EE]">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="p-4 hover:bg-[#F7F8F4] transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono"
              >
                {/* Left block: ID, Priority, Title, Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-[#1F2933] bg-[#F0F4EE] px-2 py-0.5 rounded-xs border border-[#D8DFD5]">
                      {req.request_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-xs border font-bold text-[10px] uppercase ${getPriorityBadge(req.priority)}`}>
                      {req.priority}
                    </span>
                    <span className="text-[11px] font-bold text-[#355E3B] bg-[#E8EEE5] px-2 py-0.5 rounded-xs">
                      {req.zone}
                    </span>
                    <span className="text-[10px] text-[#52606D]">
                      {req.request_type}
                    </span>
                  </div>

                  <h3 className="font-tactical font-bold text-sm text-[#1F2933] truncate">
                    {req.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#52606D]">
                    {req.requested_supply && (
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-[#355E3B]" />
                        <span>{req.requested_quantity?.toLocaleString()} {req.unit || 'units'} of {req.requested_supply}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-[#52606D]" />
                      <span>{req.created_by_name}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#52606D]" />
                      <span>{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                    </span>
                  </div>
                </div>

                {/* Right block: Status badge & detail arrow */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className={`px-2.5 py-1 rounded-xs border font-bold text-[10px] uppercase ${getStatusBadge(req.status)}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                  <div className="p-1 rounded-xs hover:bg-[#E8EEE5] text-[#355E3B]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail / Action Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          userRole={user?.role || 'ZONAL_HEAD'}
          userName={user?.fullName || 'Logistics Officer'}
          onClose={() => setSelectedRequest(null)}
          onUpdate={() => {
            loadRequests();
            // Update selectedRequest instance
            if (selectedRequest) {
              const updated = requestService.getRequestById(selectedRequest.id);
              if (updated) setSelectedRequest(updated);
            }
          }}
        />
      )}

      {/* Support Request Modal */}
      {isSupportModalOpen && (
        <RequestSupportModal
          userZone={userZone}
          userName={user?.fullName || 'Zonal Head'}
          onClose={() => setIsSupportModalOpen(false)}
          onSuccess={() => {
            setIsSupportModalOpen(false);
            loadRequests();
          }}
        />
      )}
    </div>
  );
};
