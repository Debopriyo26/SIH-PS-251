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
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { inventoryService } from '../services/inventoryService';
import { InventoryRecord, LocationNode, SupplyCategory } from '../types';

interface SuppliesPageProps {
  selectedLocationId: string;
  onLocationChange: (locId: string) => void;
}

export const SuppliesPage: React.FC<SuppliesPageProps> = ({
  selectedLocationId,
  onLocationChange,
}) => {
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingItem, setInspectingItem] = useState<InventoryRecord | null>(null);
  const [adjustStockVal, setAdjustStockVal] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function init() {
      const locs = await inventoryService.getLocations();
      setLocations(locs);
      loadInventory(selectedLocationId);
    }
    init();
  }, [selectedLocationId]);

  const loadInventory = async (locId: string) => {
    const data = await inventoryService.getInventory(locId);
    setInventory(data);
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingItem) return;
    await inventoryService.updateStock(inspectingItem.id, adjustStockVal);
    await loadInventory(selectedLocationId);
    setInspectingItem(null);
    setToastMessage(`Stock for ${inspectingItem.supply?.name} updated to ${adjustStockVal.toLocaleString()}`);
    setTimeout(() => setToastMessage(''), 3000);
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
      case 'Fuel': return <Flame className="w-4 h-4 text-[#D39B32]" />;
      case 'Water': return <Droplet className="w-4 h-4 text-[#3E92CC]" />;
      case 'Medical': return <HeartPulse className="w-4 h-4 text-[#C43C3C]" />;
      case 'Food': return <Utensils className="w-4 h-4 text-[#596B3A]" />;
      default: return <Package className="w-4 h-4 text-[#B5A47A]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#101B13] border border-[#3FA34D] text-[#4ade80] px-4 py-2.5 rounded-xs shadow-xl font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3FA34D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Location Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Supplies
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            On-hand stock levels, daily consumption, days of cover, and forecast requirements
          </p>
        </div>

        {/* Location Filter Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#8B9B8E]">FILTER BY ZONE:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-[#101B13] border border-[#263F2B] focus:border-[#596B3A] text-xs font-mono text-[#E7E9E2] px-3.5 py-2 rounded-xs focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[#101B13] p-1 rounded-xs border border-[#263F2B] font-mono text-xs">
          {['ALL', 'Fuel', 'Food', 'Medical', 'Water', 'General Supplies'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                  : 'text-[#8B9B8E] hover:text-[#E7E9E2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#8B9B8E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search supply or item code..."
            className="pl-9 pr-4 py-2 bg-[#101B13] border border-[#263F2B] text-xs font-mono text-[#E7E9E2] rounded-xs focus:outline-hidden w-64"
          />
        </div>
      </div>

      {/* Simple, Readable Supplies Table matching requirement 18 */}
      <TacticalCard
        title="Supply Ledger"
        subtitle="Click any row to inspect safety floors, burn rates, and adjust stock"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#263F2B] text-[#8B9B8E] uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Supply Item</th>
                <th className="pb-3 font-semibold">Location Zone</th>
                <th className="pb-3 font-semibold">Current Stock</th>
                <th className="pb-3 font-semibold">Daily Consumption</th>
                <th className="pb-3 font-semibold">Days of Cover</th>
                <th className="pb-3 font-semibold">7-Day Forecast</th>
                <th className="pb-3 font-semibold text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2C1E]">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    setInspectingItem(item);
                    setAdjustStockVal(item.current_stock);
                  }}
                  className="hover:bg-[#1A2C1E]/60 transition-colors cursor-pointer"
                >
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      {categoryIcon(item.supply?.category || '')}
                      <div>
                        <div className="text-[#E7E9E2] font-semibold">{item.supply?.name}</div>
                        <div className="text-[10px] text-[#8B9B8E]">{item.supply?.item_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-[#8B9B8E]">{item.location?.name || 'Srinagar Zone'}</td>
                  <td className="py-3.5">
                    <span className="text-[#E7E9E2] font-bold">
                      {item.current_stock.toLocaleString()}
                    </span>{' '}
                    <span className="text-[10px] text-[#8B9B8E]">{item.supply?.unit}</span>
                  </td>
                  <td className="py-3.5 text-[#8B9B8E]">
                    {item.daily_consumption.toLocaleString()} {item.supply?.unit}/day
                  </td>
                  <td className="py-3.5">
                    <span className={`font-bold ${
                      item.days_of_cover < 6 ? 'text-[#f87171]' : item.days_of_cover < 10 ? 'text-[#fbbf24]' : 'text-[#4ade80]'
                    }`}>
                      {item.days_of_cover} Days
                    </span>
                  </td>
                  <td className="py-3.5 text-[#fbbf24] font-semibold">
                    {item.forecast_demand_7d.toLocaleString()} {item.supply?.unit}
                  </td>
                  <td className="py-3.5 text-right">
                    <StatusBadge status={item.risk_status} size="sm" pulse={item.risk_status === 'CRITICAL'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TacticalCard>

      {/* Supply Details & Stock Adjustment Drawer/Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#101B13] border border-[#263F2B] p-6 rounded-sm shadow-2xl tactical-border space-y-4 font-mono text-xs">
            <div className="flex items-start justify-between border-b border-[#1A2C1E] pb-3">
              <div>
                <span className="text-[10px] text-[#B5A47A] uppercase font-bold tracking-wider block">
                  SUPPLY DETAILS & LEDGER ADJUSTMENT
                </span>
                <h3 className="font-tactical font-bold text-base text-[#E7E9E2]">
                  {inspectingItem.supply?.name}
                </h3>
                <span className="text-[11px] text-[#8B9B8E]">
                  {inspectingItem.location?.name} ({inspectingItem.supply?.item_code})
                </span>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="text-[#8B9B8E] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex justify-between">
                <span className="text-[#8B9B8E]">Safety Floor Ceiling:</span>
                <strong className="text-[#E7E9E2]">{inspectingItem.safety_threshold.toLocaleString()} {inspectingItem.supply?.unit}</strong>
              </div>
              <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex justify-between">
                <span className="text-[#8B9B8E]">Daily Consumption Burn:</span>
                <strong className="text-[#E7E9E2]">{inspectingItem.daily_consumption} {inspectingItem.supply?.unit}/day</strong>
              </div>
              <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex justify-between">
                <span className="text-[#8B9B8E]">7-Day Forecast Requirement:</span>
                <strong className="text-[#fbbf24]">{inspectingItem.forecast_demand_7d.toLocaleString()} {inspectingItem.supply?.unit}</strong>
              </div>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4 pt-2 border-t border-[#1A2C1E]">
              <div>
                <label className="text-[#8B9B8E] block mb-1 font-medium">
                  Verified On-Hand Stock ({inspectingItem.supply?.unit}):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={adjustStockVal}
                  onChange={(e) => setAdjustStockVal(Number(e.target.value))}
                  className="w-full bg-[#07100B] border border-[#263F2B] focus:border-[#596B3A] p-2.5 rounded-xs text-sm text-[#E7E9E2] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="px-4 py-2 bg-[#07100B] hover:bg-[#1A2C1E] text-[#8B9B8E] rounded-xs border border-[#263F2B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] rounded-xs border border-[#596B3A] font-semibold"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
