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
  Edit2
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { inventoryService } from '../services/inventoryService';
import { InventoryRecord, LocationNode } from '../types';

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
    setToastMessage(`Stock updated successfully`);
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
      case 'Fuel': return <Flame className="w-3.5 h-3.5 text-[#D39B32]" />;
      case 'Water': return <Droplet className="w-3.5 h-3.5 text-[#3E92CC]" />;
      case 'Medical': return <HeartPulse className="w-3.5 h-3.5 text-[#C43C3C]" />;
      case 'Food': return <Utensils className="w-3.5 h-3.5 text-[#596B3A]" />;
      default: return <Package className="w-3.5 h-3.5 text-[#B5A47A]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#101B13] border border-[#3FA34D] text-[#4ade80] px-4 py-2 rounded-xs shadow-xl font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3FA34D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Location Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-3">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Supplies
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            On-hand stock levels, burn rates, and replenishment triggers
          </p>
        </div>

        {/* Location Filter Dropdown */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-[#8B9B8E]">ZONE:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-[#101B13] border border-[#263F2B] focus:border-[#596B3A] text-xs font-mono text-[#E7E9E2] px-3.5 py-1.5 rounded-xs focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Logistics Zones</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#101B13] p-1 rounded-xs border border-[#263F2B] font-mono text-xs">
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
          <Search className="w-3.5 h-3.5 text-[#8B9B8E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search supply..."
            className="pl-8 pr-3 py-1.5 bg-[#101B13] border border-[#263F2B] text-xs font-mono text-[#E7E9E2] rounded-xs focus:outline-hidden w-56"
          />
        </div>
      </div>

      {/* Streamlined Clean Table */}
      <div className="bg-[#101B13] border border-[#263F2B] rounded-xs overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-[#07100B] border-b border-[#263F2B] text-[#8B9B8E] uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Supply Item</th>
                <th className="py-2.5 px-4 font-semibold">Zone</th>
                <th className="py-2.5 px-4 font-semibold">Current Stock</th>
                <th className="py-2.5 px-4 font-semibold">Daily Burn</th>
                <th className="py-2.5 px-4 font-semibold">Days of Cover</th>
                <th className="py-2.5 px-4 font-semibold">Risk Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2C1E]">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#1A2C1E]/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {categoryIcon(item.supply?.category || '')}
                      <div>
                        <div className="text-[#E7E9E2] font-semibold">{item.supply?.name}</div>
                        <div className="text-[10px] text-[#8B9B8E]">{item.supply?.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#8B9B8E]">{item.location?.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-[#E7E9E2] font-bold">
                      {item.current_stock.toLocaleString()}
                    </span>{' '}
                    <span className="text-[10px] text-[#8B9B8E]">{item.supply?.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-[#8B9B8E]">
                    {item.daily_consumption.toLocaleString()} {item.supply?.unit}/day
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${
                      item.days_of_cover < 6 ? 'text-[#f87171]' : item.days_of_cover < 10 ? 'text-[#fbbf24]' : 'text-[#4ade80]'
                    }`}>
                      {item.days_of_cover} Days
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.risk_status} size="sm" pulse={item.risk_status === 'CRITICAL'} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setInspectingItem(item);
                        setAdjustStockVal(item.current_stock);
                      }}
                      className="px-2.5 py-1 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs text-[11px] cursor-pointer inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-[#B5A47A]" />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Stock Adjustment Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#101B13] border border-[#263F2B] p-5 rounded-xs shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-start justify-between border-b border-[#1A2C1E] pb-2">
              <div>
                <h3 className="font-tactical font-bold text-sm text-[#E7E9E2]">
                  {inspectingItem.supply?.name}
                </h3>
                <span className="text-[10px] text-[#8B9B8E]">{inspectingItem.location?.name}</span>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="text-[#8B9B8E] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="text-[#8B9B8E] block mb-1">
                  Adjust On-Hand Stock ({inspectingItem.supply?.unit}):
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustStockVal}
                  onChange={(e) => setAdjustStockVal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#07100B] border border-[#263F2B] focus:border-[#596B3A] text-[#E7E9E2] font-mono text-sm rounded-xs focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="px-3 py-1.5 bg-[#07100B] border border-[#263F2B] text-[#8B9B8E] rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] font-semibold rounded-xs cursor-pointer"
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
