import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  RefreshCw, 
  Bot, 
  Menu, 
  X, 
  LayoutDashboard, 
  MapPin, 
  Boxes, 
  TrendingUp, 
  CloudRain, 
  Truck, 
  Sliders, 
  Bell, 
  Server
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { formatISTTime } from '../../lib/utils';

export type NavTab = 
  | 'landing'
  | 'dashboard'
  | 'map'
  | 'inventory'
  | 'forecast'
  | 'weather'
  | 'transport'
  | 'simulator'
  | 'alerts'
  | 'sources';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAssist: () => void;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAssist,
  unreadAlertsCount = 3,
}) => {
  const [istTime, setIstTime] = useState<string>(formatISTTime());
  const [lastSync, setLastSync] = useState<string>('05:45:00 IST');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIstTime(formatISTTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSync(formatISTTime());
      setIsRefreshing(false);
    }, 800);
  };

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'map' as NavTab, label: 'Logistics Map', icon: MapPin },
    { id: 'inventory' as NavTab, label: 'Inventory', icon: Boxes },
    { id: 'forecast' as NavTab, label: 'Forecast', icon: TrendingUp },
    { id: 'weather' as NavTab, label: 'Weather', icon: CloudRain },
    { id: 'transport' as NavTab, label: 'Transport', icon: Truck },
    { id: 'simulator' as NavTab, label: 'Simulator', icon: Sliders },
    { id: 'alerts' as NavTab, label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'sources' as NavTab, label: 'Data Sources', icon: Server },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#07100B]/95 backdrop-blur-md border-b border-[#263F2B]">
      {/* Top Status Bar */}
      <div className="border-b border-[#1A2C1E] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onSelectTab('landing')}
            className="text-left focus:outline-hidden group"
          >
            <Logo size="md" showTagline={true} />
          </button>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#1A2C1E]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-[rgba(63,163,77,0.15)] text-[#4ade80] border border-[#3fa34d]/40 font-mono text-[11px] font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></span>
              SYSTEM OPERATIONAL
            </span>
            <span className="text-[11px] font-mono text-[#8B9B8E] ml-2">
              SIH-2625 FORWARD LOGISTICS
            </span>
          </div>
        </div>

        {/* Telemetry and Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8B9B8E] bg-[#101B13] px-3 py-1.5 rounded-xs border border-[#1A2C1E]">
            <Clock className="w-3.5 h-3.5 text-[#B5A47A]" />
            <span className="text-[#E7E9E2] font-semibold">{istTime}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#8B9B8E] bg-[#101B13] px-3 py-1.5 rounded-xs border border-[#1A2C1E]">
            <span>LAST SYNC:</span>
            <span className="text-[#E7E9E2]">{lastSync}</span>
            <button
              onClick={handleManualSync}
              title="Trigger manual telemetry synchronization"
              className="text-[#B5A47A] hover:text-white transition-colors ml-1 p-0.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#4ade80]' : ''}`} />
            </button>
          </div>

          {/* AI Assistant Quick Trigger */}
          <button
            onClick={onOpenAssist}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xs bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] font-tactical text-xs tracking-wider uppercase transition-all shadow-md group"
          >
            <Bot className="w-3.5 h-3.5 text-[#B5A47A] group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">VYOMIX ASSIST</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xs bg-[#101B13] border border-[#263F2B] text-[#E7E9E2]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Tactical Nav Bar (Desktop) */}
      <nav className="hidden lg:flex items-center gap-1 px-4 overflow-x-auto py-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 font-tactical text-xs tracking-wider uppercase transition-all rounded-xs border ${
                isActive
                  ? 'bg-[#263F2B] text-[#E7E9E2] border-[#596B3A] shadow-inner font-semibold'
                  : 'text-[#8B9B8E] hover:text-[#E7E9E2] hover:bg-[#101B13] border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B5A47A]' : 'text-[#8B9B8E]'}`} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#C43C3C] text-white font-mono text-[10px] font-bold">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-[#101B13] border-b border-[#263F2B] p-4 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xs font-tactical text-xs tracking-wider uppercase border ${
                  isActive
                    ? 'bg-[#263F2B] text-[#E7E9E2] border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:bg-[#1A2C1E] border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#B5A47A]" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#C43C3C] text-white font-mono text-xs font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};
