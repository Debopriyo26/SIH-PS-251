import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Flame, 
  Droplet, 
  HeartPulse, 
  Utensils, 
  Package, 
  PlusCircle, 
  AlertTriangle, 
  Filter, 
  RefreshCw, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { inventoryService } from '../services/inventoryService';
import { InventoryRecord, LocationNode, SupplyCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface InventoryPageProps {
  initialLocationId?: string;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ initialLocationId }) => {
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(initialLocationId || 'loc-dn-a');
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryRecord | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successToast, setSuccessToast] = useState('');

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
    if (!editingItem) return;
    setIsUpdating(true);
    await inventoryService.updateStock(editingItem.id, newStockValue);
    await loadInventory(selectedLocationId);
    setIsUpdating(false);
    setEditingItem(null);
    setSuccessToast(`Stock for ${editingItem.supply?.name} updated to ${newStockValue.toLocaleString()}`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const filteredItems = inventory.filter((item) => {
    const matchesCategory = categoryFilter === 'ALL' || item.supply?.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      item.supply?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supply?.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryIcon = (category: string) => {
    switch (category) {
      case 'Fuel': return <Flame className="w-5 h-5 text-[#D39B32]" />;
      case 'Water': return <Droplet className="w-5 h-5 text-[#3E92CC]" />;
      case 'Medical': return <HeartPulse className="w-5 h-5 text-[#C43C3C]" />;
      case 'Food': return <Utensils className="w-5 h-5 text-[#596B3A]" />;
      default: return <Package className="w-5 h-5 text-[#B5A47A]" />;
    }
  };

  // Chart data for days of cover
  const chartData = inventory.map(item => ({
    name: item.supply?.category || 'Supply',
    days: item.days_of_cover,
    color: item.days_of_cover < 6 ? '#C43C3C' : item.days_of_cover < 10 ? '#D39B32' : '#3FA34D',
  }));

  const activeLoc = locations.find(l => l.id === selectedLocationId) || locations[0];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#101B13] border border-[#3FA34D] text-[#4ade80] px-4 py-2.5 rounded-xs shadow-xl font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3FA34D]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Depot Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Inventory Intelligence & Forward Reserves
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Operational POL, Combat Rations, Trauma Kits, Water, and Equipment Reserves
          </p>
        </div>

        {/* Location Selector Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#8B9B8E]">OPERATIONAL NODE:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="bg-[#101B13] border border-[#263F2B] focus:border-[#596B3A] text-xs font-mono text-[#E7E9E2] px-3.5 py-2 rounded-xs focus:outline-hidden"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Node Profile Summary Bar */}
      {activeLoc && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#101B13] border border-[#263F2B] p-4 rounded-xs font-mono text-xs">
          <div>
            <span className="text-[#8B9B8E] block text-[10px] uppercase">Node & Classification</span>
            <span className="text-[#E7E9E2] font-semibold text-sm">{activeLoc.name}</span>
            <span className="text-[#B5A47A] block text-[11px]">{activeLoc.region} ({activeLoc.altitude_m}m AMSL)</span>
          </div>
          <div>
            <span className="text-[#8B9B8E] block text-[10px] uppercase">Overall Inventory Readiness</span>
            <span className="text-[#E7E9E2] font-bold text-lg">{activeLoc.inventory_readiness_pct}%</span>
            <div className="w-full bg-[#1A2C1E] h-1.5 rounded-full mt-1">
              <div className="bg-[#3FA34D] h-full rounded-full" style={{ width: `${activeLoc.inventory_readiness_pct}%` }} />
            </div>
          </div>
          <div>
            <span className="text-[#8B9B8E] block text-[10px] uppercase">Weather Risk & Transport</span>
            <span className={activeLoc.weather_risk === 'LOW' ? 'text-[#4ade80]' : 'text-[#f87171]'}>
              Weather: {activeLoc.weather_risk}
            </span>
            <span className="text-[#8B9B8E] block">Transport Fleet: {activeLoc.transport_availability_pct}% Avail</span>
          </div>
          <div>
            <span className="text-[#8B9B8E] block text-[10px] uppercase">Projected Shortage Risk</span>
            <span className={activeLoc.projected_shortage === 'NONE' ? 'text-[#4ade80] font-semibold' : 'text-[#f87171] font-bold'}>
              {activeLoc.projected_shortage}
            </span>
            <span className="text-[#8B9B8E] block text-[11px]">Safety buffer 14 days</span>
          </div>
        </div>
      )}

      {/* Days of Cover Visual Bar Chart */}
      <TacticalCard
        title="Days of Cover Comparison by Supply Category"
        subtitle="Calculated as (Current Stock / Daily Burn Rate) against 14-day minimum mission buffer"
      >
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#8B9B8E" fontSize={11} tickLine={false} />
              <YAxis stroke="#8B9B8E" fontSize={11} unit="d" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101B13',
                  borderColor: '#263F2B',
                  borderRadius: '2px',
                  color: '#E7E9E2',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="days" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TacticalCard>

      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-[#101B13] p-1 rounded-xs border border-[#263F2B] font-mono text-xs">
          {['ALL', 'Fuel', 'Food', 'Medical', 'Water', 'General Supplies'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
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
            placeholder="Search supply or NATO item code..."
            className="pl-9 pr-4 py-2 bg-[#101B13] border border-[#263F2B] focus:border-[#596B3A] text-xs font-mono text-[#E7E9E2] rounded-xs focus:outline-hidden w-64"
          />
        </div>
      </div>

      {/* Detailed Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className="tactical-border bg-[#101B13] border border-[#263F2B] p-5 rounded-sm space-y-4 hover:border-[#596B3A] transition-all shadow-md"
            >
              {/* Header with Icon, Name, and Risk Status */}
              <div className="flex items-start justify-between gap-3 border-b border-[#1A2C1E] pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs">
                    {categoryIcon(item.supply?.category || '')}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#B5A47A] tracking-wider uppercase block">
                      {item.supply?.item_code}
                    </span>
                    <h3 className="font-tactical font-semibold text-sm text-[#E7E9E2]">
                      {item.supply?.name}
                    </h3>
                  </div>
                </div>
                <StatusBadge status={item.risk_status} size="sm" pulse={item.risk_status === 'CRITICAL'} />
              </div>

              {/* Numerical Metrics Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#07100B] p-2.5 rounded-xs border border-[#1A2C1E]">
                  <span className="text-[#8B9B8E] text-[10px] block uppercase">Current Stock</span>
                  <span className="text-[#E7E9E2] font-bold text-base">
                    {item.current_stock.toLocaleString()}
                  </span>
                  <span className="text-[#8B9B8E] text-[10px] ml-1">{item.supply?.unit}</span>
                </div>

                <div className="bg-[#07100B] p-2.5 rounded-xs border border-[#1A2C1E]">
                  <span className="text-[#8B9B8E] text-[10px] block uppercase">Daily Consumption</span>
                  <span className="text-[#E7E9E2] font-semibold text-base">
                    {item.daily_consumption.toLocaleString()}
                  </span>
                  <span className="text-[#8B9B8E] text-[10px] ml-1">/day</span>
                </div>

                <div className="bg-[#07100B] p-2.5 rounded-xs border border-[#1A2C1E]">
                  <span className="text-[#8B9B8E] text-[10px] block uppercase">7-Day Forecast</span>
                  <span className="text-[#fbbf24] font-semibold text-base">
                    {item.forecast_demand_7d.toLocaleString()}
                  </span>
                  <span className="text-[#8B9B8E] text-[10px] ml-1">{item.supply?.unit}</span>
                </div>

                <div className="bg-[#07100B] p-2.5 rounded-xs border border-[#1A2C1E]">
                  <span className="text-[#8B9B8E] text-[10px] block uppercase">Safety Floor</span>
                  <span className="text-[#8B9B8E] font-semibold text-base">
                    {item.safety_threshold.toLocaleString()}
                  </span>
                  <span className="text-[#8B9B8E] text-[10px] ml-1">{item.supply?.unit}</span>
                </div>
              </div>

              {/* Days of Cover Highlight */}
              <div className="bg-[#07100B] p-3 rounded-xs border border-[#1A2C1E] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#8B9B8E] uppercase block">
                    Days of Cover Remaining
                  </span>
                  <span className={`text-xl font-mono font-bold ${
                    item.days_of_cover < 6 ? 'text-[#f87171]' : item.days_of_cover < 10 ? 'text-[#fbbf24]' : 'text-[#4ade80]'
                  }`}>
                    {item.days_of_cover} Days
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setNewStockValue(item.current_stock);
                  }}
                  className="px-3 py-1.5 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase transition-colors"
                >
                  Adjust Stock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Adjustment Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#101B13] border border-[#263F2B] p-6 rounded-sm shadow-2xl tactical-border space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2C1E] pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#B5A47A] uppercase tracking-wider">
                  TACTICAL STOCK INVENTORY OVERRIDE
                </span>
                <h3 className="font-tactical font-bold text-base text-[#E7E9E2]">
                  {editingItem.supply?.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#8B9B8E] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[#8B9B8E] block mb-1">Current Logged Stock:</label>
                <div className="text-sm font-bold text-[#E7E9E2] bg-[#07100B] p-2.5 rounded-xs border border-[#1A2C1E]">
                  {editingItem.current_stock.toLocaleString()} {editingItem.supply?.unit}
                </div>
              </div>

              <div>
                <label className="text-[#8B9B8E] block mb-1">New Verified Stock Quantity:</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(Number(e.target.value))}
                  className="w-full bg-[#07100B] border border-[#263F2B] focus:border-[#596B3A] p-2.5 rounded-xs text-sm font-mono text-[#E7E9E2] focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs text-[11px] text-[#8B9B8E] space-y-1">
                <div>Safety Threshold: <span className="text-[#E7E9E2]">{editingItem.safety_threshold.toLocaleString()}</span></div>
                <div>Reorder Point: <span className="text-[#E7E9E2]">{editingItem.reorder_point.toLocaleString()}</span></div>
                <div>Risk status will be automatically recalculated by the Predictive Shortage Engine.</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-[#07100B] hover:bg-[#1A2C1E] text-[#8B9B8E] rounded-xs border border-[#263F2B] font-tactical text-xs tracking-wider uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] rounded-xs border border-[#596B3A] font-tactical text-xs tracking-wider uppercase font-semibold"
                >
                  {isUpdating ? 'Recalculating...' : 'Update & Recompute Risk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
