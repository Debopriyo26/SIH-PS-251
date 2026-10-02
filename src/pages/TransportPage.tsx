import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Wrench, 
  MapPin, 
  Fuel, 
  Gauge, 
  ShieldCheck, 
  Clock, 
  Filter, 
  Search, 
  Plus, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { transportService } from '../services/transportService';
import { TransportAsset, TransportAvailability } from '../types';

export const TransportPage: React.FC = () => {
  const [transports, setTransports] = useState<TransportAsset[]>([]);
  const [filterAvail, setFilterAvail] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<TransportAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<TransportAsset | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editAvail, setEditAvail] = useState<TransportAvailability>('AVAILABLE');
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await transportService.getTransports();
    setTransports(list);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    await transportService.updateAvailability(editingAsset.id, editAvail, editStatus);
    await loadData();
    setEditingAsset(null);
    setSuccessToast(`Asset ${editingAsset.asset_code} updated to ${editAvail}`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const filtered = transports.filter((t) => {
    const matchAvail = filterAvail === 'ALL' || t.availability === filterAvail;
    const matchSearch = !searchTerm || 
      t.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assigned_route.toLowerCase().includes(searchTerm.toLowerCase());
    return matchAvail && matchSearch;
  });

  const availableCount = transports.filter(t => t.availability === 'AVAILABLE').length;
  const inTransitCount = transports.filter(t => t.availability === 'IN_TRANSIT').length;
  const maintenanceCount = transports.filter(t => t.availability === 'MAINTENANCE' || t.availability === 'UNAVAILABLE').length;
  const totalCapacity = transports.reduce((acc, t) => acc + t.capacity_tonnes, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#101B13] border border-[#3FA34D] text-[#4ade80] px-4 py-2.5 rounded-xs shadow-xl font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3FA34D]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Transport Fleet & Logistics Assets
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Forward Transit Carriers, Heavy Bowsers, All-Terrain 4x4s, and Multi-Axle Convoy Units
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8B9B8E] bg-[#101B13] px-3 py-1.5 rounded-xs border border-[#263F2B]">
          <Truck className="w-3.5 h-3.5 text-[#B5A47A]" />
          <span>TOTAL FLEET CAPACITY: <strong className="text-[#E7E9E2]">{totalCapacity} TONNES</strong></span>
        </div>
      </div>

      {/* Fleet KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-4 rounded-xs font-mono text-xs">
          <span className="text-[#8B9B8E] block text-[10px] uppercase">Available Mission Assets</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#4ade80]">{availableCount}</span>
            <span className="text-[#8B9B8E]">/ {transports.length} Assets</span>
          </div>
          <span className="text-[#4ade80] text-[11px] block mt-1">Ready for Immediate Sortie</span>
        </div>

        <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-4 rounded-xs font-mono text-xs">
          <span className="text-[#8B9B8E] block text-[10px] uppercase">Assets Currently In Transit</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#fbbf24]">{inTransitCount}</span>
            <span className="text-[#8B9B8E]">Assets Active</span>
          </div>
          <span className="text-[#8B9B8E] text-[11px] block mt-1">Traversing Mountain Corridors</span>
        </div>

        <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-4 rounded-xs font-mono text-xs">
          <span className="text-[#8B9B8E] block text-[10px] uppercase">Offline / Maintenance Deficit</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#f87171]">{maintenanceCount}</span>
            <span className="text-[#8B9B8E]">Assets Offline</span>
          </div>
          <span className="text-[#f87171] text-[11px] block mt-1">Depot Workshop Overhauls</span>
        </div>

        <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-4 rounded-xs font-mono text-xs">
          <span className="text-[#8B9B8E] block text-[10px] uppercase">Fleet Fuel Efficiency</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#E7E9E2]">3.9</span>
            <span className="text-[#8B9B8E]">km/L Average</span>
          </div>
          <span className="text-[#8B9B8E] text-[11px] block mt-1">High-Gradient Winter Terrain</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-[#101B13] p-1 rounded-xs border border-[#263F2B] font-mono text-xs">
          {[
            { id: 'ALL', label: 'All Fleet' },
            { id: 'AVAILABLE', label: 'Available' },
            { id: 'IN_TRANSIT', label: 'In Transit' },
            { id: 'MAINTENANCE', label: 'Maintenance' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterAvail(btn.id)}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                filterAvail === btn.id
                  ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                  : 'text-[#8B9B8E] hover:text-[#E7E9E2]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#8B9B8E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search asset ID, model, or route..."
            className="pl-9 pr-4 py-2 bg-[#101B13] border border-[#263F2B] text-xs font-mono text-[#E7E9E2] rounded-xs focus:outline-hidden w-64"
          />
        </div>
      </div>

      {/* Main Transport Fleet Table */}
      <TacticalCard
        title="Active Tactical Fleet Roster"
        subtitle="Operational availability and payload specifications (Synthetic military demonstration assets)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#263F2B] text-[#8B9B8E] uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Asset ID</th>
                <th className="pb-3 font-semibold">Asset Name & Classification</th>
                <th className="pb-3 font-semibold">Payload Capacity</th>
                <th className="pb-3 font-semibold">Assigned Route / Staging</th>
                <th className="pb-3 font-semibold">Availability</th>
                <th className="pb-3 font-semibold">Operational Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2C1E]">
              {filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#1A2C1E]/50 transition-colors">
                  <td className="py-3.5 font-bold text-[#B5A47A]">{asset.asset_code}</td>
                  <td className="py-3.5">
                    <div className="text-[#E7E9E2] font-semibold">{asset.name}</div>
                    <div className="text-[10px] text-[#8B9B8E]">{asset.type}</div>
                  </td>
                  <td className="py-3.5 text-[#E7E9E2] font-semibold">
                    {asset.capacity_tonnes} tonnes
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5 text-[#E7E9E2]">
                      <MapPin className="w-3 h-3 text-[#596B3A]" />
                      <span>{asset.assigned_route}</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={asset.availability} size="sm" pulse={asset.availability === 'IN_TRANSIT'} />
                  </td>
                  <td className="py-3.5 text-[#8B9B8E]">
                    {asset.status}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => {
                        setEditingAsset(asset);
                        setEditAvail(asset.availability);
                        setEditStatus(asset.status);
                      }}
                      className="px-2.5 py-1 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] rounded-xs border border-[#596B3A] text-[11px] font-tactical uppercase tracking-wider transition-colors"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TacticalCard>

      {/* Fleet Update Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#101B13] border border-[#263F2B] p-6 rounded-sm shadow-2xl tactical-border space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2C1E] pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#B5A47A] uppercase tracking-wider">
                  FLEET ASSET STATUS DISPATCH
                </span>
                <h3 className="font-tactical font-bold text-base text-[#E7E9E2]">
                  {editingAsset.asset_code} — {editingAsset.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingAsset(null)}
                className="text-[#8B9B8E] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[#8B9B8E] block mb-1">Availability Status:</label>
                <select
                  value={editAvail}
                  onChange={(e) => setEditAvail(e.target.value as TransportAvailability)}
                  className="w-full bg-[#07100B] border border-[#263F2B] p-2.5 rounded-xs text-[#E7E9E2] focus:outline-hidden"
                >
                  <option value="AVAILABLE">AVAILABLE (Mission Ready)</option>
                  <option value="IN_TRANSIT">IN_TRANSIT (En-route)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Workshop Overhaul)</option>
                  <option value="UNAVAILABLE">UNAVAILABLE (Offline)</option>
                </select>
              </div>

              <div>
                <label className="text-[#8B9B8E] block mb-1">Operational Description / Mission Note:</label>
                <input
                  type="text"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-[#07100B] border border-[#263F2B] p-2.5 rounded-xs text-[#E7E9E2] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 bg-[#07100B] hover:bg-[#1A2C1E] text-[#8B9B8E] rounded-xs border border-[#263F2B] font-tactical text-xs tracking-wider uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] rounded-xs border border-[#596B3A] font-tactical text-xs tracking-wider uppercase font-semibold"
                >
                  Save Dispatch State
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
