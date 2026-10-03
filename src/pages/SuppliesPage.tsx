import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Flame, 
  Droplet, 
  HeartPulse, 
  Utensils, 
  Package, 
  Search, 
  X, 
  CheckCircle2, 
  Edit2,
  RefreshCw,
  AlertCircle,
  Radio,
  Cpu
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataStatus } from '../components/common/DataStatus';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../lib/authContext';
import { InventoryRecord, LocationNode, LogisticsZone } from '../types';

interface SuppliesPageProps {
  selectedLocationId: string;
  onLocationChange: (locId: string) => void;
}

export const SuppliesPage: React.FC<SuppliesPageProps> = ({
  selectedLocationId,
  onLocationChange,
}) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingItem, setInspectingItem] = useState<InventoryRecord | null>(null);
  const [adjustStockVal, setAdjustStockVal] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isMainHead = user?.role === 'MAIN_HEAD';
  const effectiveZone = user?.zone as LogisticsZone | null;

  useEffect(() => {
    async function init() {
      const locs = await inventoryService.getLocations(user?.role, effectiveZone);
      setLocations(locs);
      loadInventory(selectedLocationId);
    }
    init();
  }, [selectedLocationId, user?.role, user?.zone]);

  const loadInventory = async (locId: string) => {
    const data = await inventoryService.getInventory(locId, user?.role, effectiveZone);
    setInventory(data);
  };

  // Requirement 22 & 23: Complete data flow with validation, Supabase update, and persistence
  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingItem) return;

    setIsSaving(true);
    setErrorMessage('');

    try {
      const updated = await inventoryService.updateStock(
        inspectingItem.id, 
        adjustStockVal,
        user?.role,
        effectiveZone
      );
      if (updated) {
        await loadInventory(selectedLocationId);
        setInspectingItem(null);
        setToastMessage(`Stock updated to ${updated.current_stock.toLocaleString()} ${updated.supply?.unit || 'units'} and persisted.`);
        setTimeout(() => setToastMessage(''), 4000);
      } else {
        setErrorMessage('Failed to update inventory record.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating stock in Supabase');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = inventory.filter((item) => {
    const matchCategory = categoryFilter === 'ALL' || item.supply?.category === categoryFilter;
    const matchSearch = !searchTerm || 
      item.supply?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supply?.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categoryIcon = (category: string) => {
    switch (category) {
      case 'Fuel': return <Flame className="w-4 h-4 text-[#A16207]" />;
      case 'Water': return <Droplet className="w-4 h-4 text-[#355E3B]" />;
      case 'Medical': return <HeartPulse className="w-4 h-4 text-[#B42318]" />;
      case 'Food': return <Utensils className="w-4 h-4 text-[#2F6B3C]" />;
      default: return <Package className="w-4 h-4 text-[#6B7444]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback (Requirement 8) */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-[#2F6B3C] text-[#2F6B3C] px-4 py-2.5 rounded-xs shadow-lg font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2F6B3C]" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Zone Isolation (Requirement 6 & 33) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8DFD5] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#1F2933] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#355E3B] inline-block rounded-xs"></span>
            {isMainHead ? 'Supplies & Reserve Catalogue' : `${user?.zone || 'Zonal'} Sector Supplies`}
          </h1>
          <p className="font-mono text-xs text-[#52606D] mt-0.5">
            {isMainHead
              ? 'Multi-sector supply catalogue, inventory buffers, burn rates and on-hand stocks'
              : `Strictly isolated inventory reserves for ${user?.zone || 'assigned'} Logistics Zone`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DataStatus
            mode="LIVE"
            source="Supabase Cloud Ledger"
            size="sm"
          />

          {/* Location Selector: Shown ONLY to Main Head (Requirements 6 & 33) */}
          {isMainHead ? (
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#52606D] font-bold">ZONE:</span>
              <select
                value={selectedLocationId}
                onChange={(e) => onLocationChange(e.target.value)}
                className="bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-xs font-mono text-[#1F2933] px-3.5 py-1.5 rounded-xs focus:outline-hidden cursor-pointer font-bold shadow-xs"
              >
                <option value="ALL">All Logistics Zones</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#F0F4EE] border border-[#CAD3C8] px-3 py-1.5 rounded-xs">
              <span className="text-[10px] font-mono text-[#52606D] font-bold uppercase">MY ZONE:</span>
              <span className="font-mono text-xs font-bold text-[#355E3B] uppercase">
                ⚑ {user?.zone || 'Srinagar'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xs border border-[#D8DFD5] shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {['ALL', 'Fuel', 'Food', 'Medical', 'Water', 'General Supplies'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer font-semibold ${
                categoryFilter === cat
                  ? 'bg-[#355E3B] text-white border border-[#1F3D27] shadow-xs'
                  : 'bg-[#F0F4EE] text-[#52606D] hover:text-[#1F2933] border border-[#D8DFD5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#52606D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search supplies or codes..."
            className="pl-8 pr-3 py-1.5 bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-xs font-mono text-[#1F2933] rounded-xs focus:outline-hidden w-60"
          />
        </div>
      </div>

      {/* Streamlined Clean Table */}
      <div className="bg-white border border-[#D8DFD5] rounded-xs overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-[#F0F4EE] border-b border-[#D8DFD5] text-[#52606D] uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-bold">Supply Item</th>
                <th className="py-3 px-4 font-bold">Zone</th>
                <th className="py-3 px-4 font-bold">Current Stock</th>
                <th className="py-3 px-4 font-bold">Daily Burn</th>
                <th className="py-3 px-4 font-bold">Safety Threshold</th>
                <th className="py-3 px-4 font-bold">Days of Cover</th>
                <th className="py-3 px-4 font-bold">Risk Status</th>
                <th className="py-3 px-4 font-bold">Data Source</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4EE]">
              {filteredItems.map((item) => {
                const isSensorTracked = item.supply?.category === 'Fuel' || item.supply?.category === 'Water';
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#F7F8F4] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#F0F4EE] rounded-xs border border-[#D8DFD5]">
                          {categoryIcon(item.supply?.category || '')}
                        </div>
                        <div>
                          <div className="text-[#1F2933] font-bold">{item.supply?.name}</div>
                          <div className="text-[10px] text-[#52606D] font-medium">{item.supply?.category} • {item.supply?.item_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#52606D] font-medium">{item.location?.name}</td>
                    <td className="py-3 px-4">
                      <span className="text-[#1F2933] font-bold text-sm">
                        {item.current_stock.toLocaleString()}
                      </span>{' '}
                      <span className="text-[10px] text-[#52606D] font-semibold">{item.supply?.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-[#52606D]">
                      {item.daily_consumption.toLocaleString()} {item.supply?.unit}/day
                    </td>
                    <td className="py-3 px-4 text-[#52606D]">
                      {item.safety_threshold.toLocaleString()} {item.supply?.unit}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${
                        item.days_of_cover < 7 ? 'text-[#B42318]' : item.days_of_cover < 12 ? 'text-[#A16207]' : 'text-[#2F6B3C]'
                      }`}>
                        {item.days_of_cover} Days
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.risk_status} size="sm" pulse={item.risk_status === 'CRITICAL'} />
                    </td>
                    <td className="py-3 px-4">
                      {isSensorTracked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#E8EEE5] text-[#2F6B3C] border border-[#CAD3C8] text-[10px] font-bold uppercase tracking-wider">
                          <Radio className="w-2.5 h-2.5 text-[#2F6B3C] shrink-0" />
                          <span>DEMO SENSOR DATA</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#F0F4EE] text-[#52606D] border border-[#D8DFD5] text-[10px] font-semibold uppercase tracking-wider">
                          <Package className="w-2.5 h-2.5 text-[#52606D] shrink-0" />
                          <span>MANUAL ENTRY</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setInspectingItem(item);
                        setAdjustStockVal(item.current_stock);
                        setErrorMessage('');
                      }}
                      className="px-3 py-1 bg-white hover:bg-[#E8EEE5] text-[#355E3B] border border-[#355E3B] rounded-xs text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Edit2 className="w-3 h-3 text-[#355E3B]" />
                      <span>Adjust Stock</span>
                    </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Stock Adjustment Modal (Requirement 8: Save to Supabase and persist) */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white border border-[#D8DFD5] p-6 rounded-xs shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-start justify-between border-b border-[#F0F4EE] pb-3">
              <div>
                <span className="text-[10px] text-[#355E3B] uppercase font-bold tracking-wider block">
                  ADJUST STOCK LEVEL
                </span>
                <h3 className="font-tactical font-bold text-sm text-[#1F2933]">
                  {inspectingItem.supply?.name}
                </h3>
                <span className="text-[11px] text-[#52606D] font-medium">{inspectingItem.location?.name}</span>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="text-[#52606D] hover:text-[#1F2933] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-[#FEE4E2] border border-[#FDA29B] rounded-xs text-[#B42318] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="text-[#52606D] block mb-1 font-semibold">
                  Current On-Hand Stock ({inspectingItem.supply?.unit}):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={adjustStockVal}
                  onChange={(e) => setAdjustStockVal(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-[#1F2933] font-mono text-sm font-bold rounded-xs focus:outline-hidden"
                />
                <div className="text-[10px] text-[#52606D] mt-1">
                  Safety Threshold: {inspectingItem.safety_threshold.toLocaleString()} • Daily Burn: {inspectingItem.daily_consumption.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F0F4EE]">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setInspectingItem(null)}
                  className="px-3.5 py-1.5 bg-[#F0F4EE] hover:bg-[#E8EEE5] border border-[#D8DFD5] text-[#52606D] font-semibold rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] font-bold rounded-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>[SAVE]</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
