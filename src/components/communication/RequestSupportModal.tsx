import React, { useState } from 'react';
import { 
  LogisticsZone, 
  RequestType, 
  RequestPriority 
} from '../../types';
import { requestService } from '../../services/requestService';
import { 
  X, 
  Send, 
  MapPin, 
  AlertTriangle, 
  Package, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

interface RequestSupportModalProps {
  userZone?: LogisticsZone;
  defaultZone?: LogisticsZone;
  userName?: string;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onCreated?: () => void;
}

export const RequestSupportModal: React.FC<RequestSupportModalProps> = ({
  userZone,
  defaultZone,
  userName,
  isOpen = true,
  onClose,
  onSuccess,
  onCreated,
}) => {
  if (isOpen === false) return null;

  const effectiveZone: LogisticsZone = userZone || defaultZone || 'Srinagar';
  const effectiveUserName = userName || `${effectiveZone} Zonal Head`;

  const [requestType, setRequestType] = useState<RequestType>('Supply Request');
  const [priority, setPriority] = useState<RequestPriority>('HIGH');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requestedSupply, setRequestedSupply] = useState('High-Altitude Diesel & Fuel (POL)');
  const [requestedQuantity, setRequestedQuantity] = useState<number>(5000);
  const [unit, setUnit] = useState('Liters');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in title and operational justification.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await requestService.createRequest({
        zone: effectiveZone,
        request_type: requestType,
        priority: priority,
        title: title.trim(),
        description: description.trim(),
        requested_supply: requestedSupply,
        requested_quantity: Number(requestedQuantity),
        unit: unit,
        created_by_name: effectiveUserName,
        created_by_role: 'ZONAL_HEAD'
      });

      if (onSuccess) onSuccess();
      if (onCreated) onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request to Main Head.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white border border-[#D8DFD5] rounded-xs shadow-2xl overflow-hidden font-mono text-xs my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4EE] border-b border-[#D8DFD5]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#355E3B] inline-block rounded-xs"></span>
            <div>
              <h2 className="font-tactical font-bold text-base text-[#1F2933] uppercase">
                Submit Zonal Logistics Request
              </h2>
              <p className="text-[10px] text-[#52606D]">
                Direct operational communication channel to Main Head of Logistics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#52606D] hover:text-[#1F2933] p-1.5 rounded-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-[#FEE4E2] border border-[#FDA29B] rounded-xs text-[#B42318] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Zone Badge & Request Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#52606D] block mb-1 font-semibold uppercase text-[10px]">
                Originating Command Zone:
              </label>
              <div className="p-2.5 bg-[#F0F4EE] border border-[#D8DFD5] rounded-xs font-bold text-[#1F2933] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#355E3B]" />
                <span>{userZone} Logistics Zone</span>
              </div>
            </div>

            <div>
              <label className="text-[#52606D] block mb-1 font-semibold uppercase text-[10px]">
                Request Type:
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as RequestType)}
                className="w-full p-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] rounded-xs text-[#1F2933] font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="Supply Request">Supply Request</option>
                <option value="Logistics Alert">Logistics Alert</option>
                <option value="Emergency Requirement">Emergency Requirement</option>
                <option value="Transport Requirement">Transport Requirement</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="text-[#52606D] block mb-1 font-semibold uppercase text-[10px]">
              Priority Level:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RequestPriority[]).map((p) => {
                const isSelected = priority === p;
                const color = 
                  p === 'CRITICAL' ? (isSelected ? 'bg-[#B42318] text-white border-[#912018]' : 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]') :
                  p === 'HIGH' ? (isSelected ? 'bg-[#C2410C] text-white border-[#9A3412]' : 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]') :
                  p === 'MEDIUM' ? (isSelected ? 'bg-[#A16207] text-white border-[#854D0E]' : 'bg-[#FEF08A] text-[#A16207] border-[#FDE047]') :
                  (isSelected ? 'bg-[#2F6B3C] text-white border-[#1F3D27]' : 'bg-[#F0FDF4] text-[#2F6B3C] border-[#86EFAC]');

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-2 text-center rounded-xs font-bold border transition-colors cursor-pointer text-[10px] ${color}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[#52606D] block mb-1 font-semibold uppercase text-[10px]">
              Request Title:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Additional Fuel Allocation for Srinagar Sector"
              className="w-full p-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] rounded-xs text-[#1F2933] font-bold focus:outline-hidden"
            />
          </div>

          {/* Supply & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[#52606D] block mb-1 font-semibold uppercase text-[10px]">
                Supply / Resource Required:
              </label>
              <input
                type="text"
                value={requestedSupply}
                onChange={(e) => setRequestedSupply(e.target.value)}
                placeholder="e.g. High-Altitude Diesel & POL"
                className="w-full p-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] rounded-xs text-[#1F2933] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[#52606D] block mb-1 font-semibold uppercase text-[10px]">
                Quantity & Unit:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-24 p-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] rounded-xs text-[#1F2933] font-bold text-center focus:outline-hidden"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Liters"
                  className="w-20 p-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] rounded-xs text-[#1F2933] text-center focus:outline-hidden font-bold"
                />
              </div>
            </div>
          </div>

          {/* Operational Justification / Description */}
          <div>
            <label className="text-[#52606D] block mb-1 font-semibold uppercase text-[10px]">
              Operational Description & Requirement Justification:
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail consumption rates, expected route closures, or critical operational impacts requiring Main Head directive..."
              className="w-full p-2.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] rounded-xs text-[#1F2933] focus:outline-hidden text-xs"
            />
          </div>

          {/* Submit Button (Requirement 7) */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#F0F4EE]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 bg-[#F0F4EE] hover:bg-[#E8EEE5] border border-[#D8DFD5] text-[#52606D] font-bold rounded-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#355E3B] hover:bg-[#1F3D27] text-white font-bold rounded-xs cursor-pointer shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>TRANSMITTING TO MAIN HEAD...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#B5A47A]" />
                  <span>[SEND REQUEST TO MAIN HEAD]</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
