import React, { useState } from 'react';
import { 
  LogisticsRequest, 
  RequestHistoryItem, 
  UserRole, 
  RequestStatus 
} from '../../types';
import { requestService, REQUEST_PRIORITY_WEIGHT } from '../../services/requestService';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  CheckCheck, 
  Layers, 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  Package, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface RequestDetailModalProps {
  request: LogisticsRequest;
  userRole?: UserRole | string;
  userName?: string;
  isOpen?: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  onUpdated?: () => void;
}

const LIFECYCLE_STAGES: RequestStatus[] = ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'];

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  userRole = 'MAIN_HEAD',
  userName = 'Officer',
  isOpen = true,
  onClose,
  onUpdate,
  onUpdated,
}) => {
  if (isOpen === false) return null;

  const [actionNote, setActionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<RequestHistoryItem[]>(() => 
    requestService.getRequestHistory(request.id)
  );
  const [successMessage, setSuccessMessage] = useState('');

  const isMainHead = userRole === 'MAIN_HEAD';

  const notifyUpdated = () => {
    if (onUpdate) onUpdate();
    if (onUpdated) onUpdated();
  };

  const refreshHistory = () => {
    setHistory(requestService.getRequestHistory(request.id));
  };

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    await requestService.acknowledgeRequest(request.id, userName || 'Main Head of Logistics');
    refreshHistory();
    setSuccessMessage('Request marked as ACKNOWLEDGED. Originating Zonal Head notified.');
    setIsSubmitting(false);
    notifyUpdated();
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleTakeAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionNote.trim()) return;

    setIsSubmitting(true);
    await requestService.takeActionRequest(request.id, actionNote.trim(), userName || 'Main Head of Logistics');
    refreshHistory();
    setActionNote('');
    setSuccessMessage('Action initiated and logged in communication trail.');
    setIsSubmitting(false);
    notifyUpdated();
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    await requestService.resolveRequest(
      request.id, 
      actionNote.trim() || 'Logistics fulfillment completed and verified.', 
      userName || 'Main Head of Logistics'
    );
    refreshHistory();
    setActionNote('');
    setSuccessMessage('Request marked as RESOLVED. Audit trail sealed.');
    setIsSubmitting(false);
    notifyUpdated();
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Determine stage active index
  const stageIndex = LIFECYCLE_STAGES.indexOf(request.status);

  const priorityColor = 
    request.priority === 'CRITICAL' ? 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]' :
    request.priority === 'HIGH' ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]' :
    request.priority === 'MEDIUM' ? 'bg-[#FEF08A] text-[#A16207] border-[#FDE047]' :
    'bg-[#F0FDF4] text-[#2F6B3C] border-[#86EFAC]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-[#D8DFD5] rounded-xs shadow-2xl overflow-hidden font-mono text-xs my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4EE] border-b border-[#D8DFD5]">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 font-bold rounded-xs bg-[#355E3B] text-white text-[11px] tracking-wider">
              {request.request_number}
            </span>
            <span className={`px-2 py-0.5 rounded-xs border font-bold text-[10px] uppercase ${priorityColor}`}>
              {request.priority} PRIORITY
            </span>
            <span className="text-[11px] text-[#52606D] font-bold uppercase tracking-wider">
              {request.request_type}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#52606D] hover:text-[#1F2933] p-1.5 rounded-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="px-6 py-2.5 bg-[#E8F5E9] border-b border-[#A5D6A7] text-[#2F6B3C] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Visual Lifecycle Progress Indicator (Requirement 15) */}
          <div className="bg-[#F7F8F4] p-4 rounded-xs border border-[#D8DFD5]">
            <span className="text-[10px] uppercase font-bold text-[#52606D] block mb-3">
              Request Status Lifecycle:
            </span>
            <div className="grid grid-cols-4 gap-2 relative">
              {LIFECYCLE_STAGES.map((st, i) => {
                const isPassed = i <= stageIndex;
                const isCurrent = i === stageIndex;
                return (
                  <div key={st} className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                      isCurrent
                        ? 'bg-[#355E3B] text-white ring-4 ring-[#E8EEE5]'
                        : isPassed
                        ? 'bg-[#2F6B3C] text-white'
                        : 'bg-[#D8DFD5] text-[#52606D]'
                    }`}>
                      {isPassed ? <CheckCheck className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 uppercase ${
                      isCurrent ? 'text-[#355E3B]' : isPassed ? 'text-[#1F2933]' : 'text-[#8C9BA5]'
                    }`}>
                      {st.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Request Header & Description */}
          <div>
            <h2 className="font-tactical font-bold text-base text-[#1F2933]">
              {request.title}
            </h2>
            <p className="text-[#52606D] text-xs mt-2 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xs border border-[#E8EEE5]">
              {request.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F0F4EE] p-3.5 rounded-xs border border-[#D8DFD5]">
            <div>
              <span className="text-[10px] text-[#52606D] uppercase block font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#355E3B]" /> Zone
              </span>
              <strong className="text-xs text-[#1F2933] block mt-0.5">{request.zone}</strong>
            </div>

            <div>
              <span className="text-[10px] text-[#52606D] uppercase block font-semibold flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-[#355E3B]" /> Requesting Officer
              </span>
              <strong className="text-xs text-[#1F2933] block mt-0.5 truncate">{request.created_by_name}</strong>
            </div>

            <div>
              <span className="text-[10px] text-[#52606D] uppercase block font-semibold flex items-center gap-1">
                <Package className="w-3 h-3 text-[#355E3B]" /> Supply & Quantity
              </span>
              <strong className="text-xs text-[#1F2933] block mt-0.5">
                {request.requested_quantity ? `${request.requested_quantity.toLocaleString()} ${request.unit || 'units'}` : 'N/A'}
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-[#52606D] uppercase block font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#355E3B]" /> Submitted
              </span>
              <strong className="text-xs text-[#1F2933] block mt-0.5">
                {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
              </strong>
            </div>
          </div>

          {/* Main Head Directives / Response Note if any */}
          {request.main_head_response && (
            <div className="p-3.5 bg-[#E8EEE5] border-l-4 border-[#355E3B] rounded-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#1F3D27] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#355E3B]" />
                Main Head Official Directive:
              </span>
              <p className="text-xs text-[#1F2933] font-sans font-medium">
                {request.main_head_response}
              </p>
            </div>
          )}

          {/* Main Head Action Controls (Requirements 12, 13, 14) */}
          {isMainHead && request.status !== 'RESOLVED' && (
            <div className="bg-white border border-[#D8DFD5] p-4 rounded-xs space-y-3 shadow-xs">
              <span className="font-tactical font-bold text-xs uppercase text-[#1F2933] block border-b border-[#F0F4EE] pb-1.5">
                Command Response & Operational Directives:
              </span>

              {request.status === 'PENDING' && (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-[#52606D]">
                    Click to acknowledge receipt of this zonal request:
                  </span>
                  <button
                    onClick={handleAcknowledge}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#355E3B] hover:bg-[#1F3D27] text-white font-bold rounded-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>[ACKNOWLEDGE REQUEST]</span>
                  </button>
                </div>
              )}

              {request.status !== 'PENDING' && (
                <form onSubmit={handleTakeAction} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-[#52606D] block mb-1 font-semibold">
                      Directive / Action Dispatch Note:
                    </label>
                    <textarea
                      rows={2}
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="e.g. Additional fuel dispatch of 5,000L authorized via TR-001..."
                      className="w-full p-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] rounded-xs font-mono text-xs text-[#1F2933] focus:outline-hidden"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="submit"
                      disabled={isSubmitting || !actionNote.trim()}
                      className="px-3.5 py-1.5 bg-[#6B7444] hover:bg-[#525B33] text-white font-bold rounded-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>MARK IN PROGRESS / UPDATE</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResolve}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 bg-[#2F6B3C] hover:bg-[#1F3D27] text-white font-bold rounded-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>MARK AS RESOLVED</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Audit Communication Timeline (Requirement 25) */}
          <div className="space-y-3">
            <span className="font-tactical font-bold text-xs uppercase text-[#1F2933] block border-b border-[#F0F4EE] pb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#355E3B]" />
              Communication & Audit Timeline:
            </span>

            <div className="space-y-2.5 pl-2 border-l-2 border-[#D8DFD5]">
              {history.map((h) => (
                <div key={h.id} className="relative pl-4 group">
                  <span className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-[#355E3B] ring-2 ring-white" />
                  <div className="flex items-center justify-between text-[10px] text-[#52606D]">
                    <span className="font-bold text-[#1F2933]">{h.performed_by} ({h.performed_by_role})</span>
                    <span>{new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                  </div>
                  <p className="text-[11px] text-[#52606D] mt-0.5">{h.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3.5 bg-[#F0F4EE] border-t border-[#D8DFD5]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-[#E8EEE5] border border-[#D8DFD5] text-[#1F2933] font-bold rounded-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
