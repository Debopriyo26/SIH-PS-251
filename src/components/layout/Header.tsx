import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Boxes, 
  TrendingUp, 
  Sliders, 
  Bell, 
  HelpCircle, 
  User as UserIcon, 
  LogOut, 
  Database, 
  ChevronDown, 
  Menu, 
  X,
  Bot
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../lib/authContext';

export type NavTab = 
  | 'landing'
  | 'dashboard'
  | 'locations'
  | 'supplies'
  | 'forecast'
  | 'simulator'
  | 'alerts'
  | 'help'
  | 'login'
  | 'signup'
  | 'forgot-password';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAssist?: () => void;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAssist,
  unreadAlertsCount = 3,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 6 Primary Navigation items as per requirement 2
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'locations' as NavTab, label: 'Locations', icon: MapPin },
    { id: 'supplies' as NavTab, label: 'Supplies', icon: Boxes },
    { id: 'forecast' as NavTab, label: 'Forecast', icon: TrendingUp },
    { id: 'simulator' as NavTab, label: 'Simulator', icon: Sliders },
    { id: 'alerts' as NavTab, label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#07100B]/95 backdrop-blur-md border-b border-[#263F2B]">
      <div className="px-4 py-2 flex items-center justify-between">
        {/* Brand & Left Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onSelectTab(isAuthenticated ? 'dashboard' : 'landing')}
            className="text-left focus:outline-hidden group"
          >
            <Logo size="md" showTagline={true} />
          </button>
        </div>

        {/* Primary Navigation (Desktop) - Authenticated Only */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 font-tactical text-xs tracking-wider uppercase transition-colors rounded-xs border ${
                    isActive
                      ? 'bg-[#263F2B] text-[#E7E9E2] border-[#596B3A] font-semibold'
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
        )}

        {/* Top-Right Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Optional AI Assistant quick button */}
              {onOpenAssist && (
                <button
                  onClick={onOpenAssist}
                  title="Ask VYOMIX Assistant"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs bg-[#101B13] hover:bg-[#1A2C1E] text-[#B5A47A] border border-[#263F2B] font-mono text-xs transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Assist</span>
                </button>
              )}

              {/* Help button */}
              <button
                onClick={() => onSelectTab('help')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs font-mono text-xs tracking-wider border transition-colors ${
                  currentTab === 'help'
                    ? 'bg-[#263F2B] text-[#E7E9E2] border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:text-[#E7E9E2] bg-[#101B13] border-[#263F2B]'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#B5A47A]" />
                <span className="hidden sm:inline">Help</span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xs bg-[#101B13] hover:bg-[#1A2C1E] border border-[#263F2B] font-mono text-xs text-[#E7E9E2] transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#263F2B] text-[#B5A47A] flex items-center justify-center font-bold text-[10px] border border-[#596B3A]">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:inline font-medium text-xs">{user?.fullName || 'Officer'}</span>
                  <ChevronDown className="w-3 h-3 text-[#8B9B8E]" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#101B13] border border-[#263F2B] rounded-xs shadow-2xl py-1 z-50 font-mono text-xs">
                    <div className="px-3 py-2 border-b border-[#1A2C1E]">
                      <div className="font-semibold text-[#E7E9E2] truncate">{user?.fullName}</div>
                      <div className="text-[10px] text-[#8B9B8E] truncate">{user?.email}</div>
                      <div className="text-[10px] text-[#B5A47A] mt-0.5">{user?.role}</div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onSelectTab('help');
                      }}
                      className="w-full text-left px-3 py-2 text-[#8B9B8E] hover:text-[#E7E9E2] hover:bg-[#1A2C1E] flex items-center gap-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#B5A47A]" />
                      <span>Help & Documentation</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onSelectTab('help');
                      }}
                      className="w-full text-left px-3 py-2 text-[#8B9B8E] hover:text-[#E7E9E2] hover:bg-[#1A2C1E] flex items-center gap-2"
                    >
                      <Database className="w-3.5 h-3.5 text-[#596B3A]" />
                      <span>Data & Integrations</span>
                    </button>

                    <div className="border-t border-[#1A2C1E] my-1" />

                    <button
                      onClick={async () => {
                        setProfileOpen(false);
                        await logout();
                        onSelectTab('landing');
                      }}
                      className="w-full text-left px-3 py-2 text-[#f87171] hover:bg-[#1A2C1E] flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-xs bg-[#101B13] border border-[#263F2B] text-[#E7E9E2]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => onSelectTab('login')}
                className="px-3.5 py-1.5 rounded-xs text-[#E7E9E2] hover:bg-[#101B13] border border-transparent hover:border-[#263F2B] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onSelectTab('signup')}
                className="px-3.5 py-1.5 rounded-xs bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] font-medium transition-colors"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Authenticated) */}
      {isAuthenticated && mobileMenuOpen && (
        <nav className="lg:hidden bg-[#101B13] border-b border-[#263F2B] p-4 flex flex-col gap-1.5 font-mono text-xs">
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
                className={`flex items-center justify-between px-3 py-2 rounded-xs border ${
                  isActive
                    ? 'bg-[#263F2B] text-[#E7E9E2] border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:bg-[#1A2C1E] border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#B5A47A]" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#C43C3C] text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="border-t border-[#1A2C1E] my-2" />

          <button
            onClick={() => {
              onSelectTab('help');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-[#8B9B8E]"
          >
            <HelpCircle className="w-4 h-4 text-[#B5A47A]" />
            <span>Help & Documentation</span>
          </button>

          <button
            onClick={async () => {
              setMobileMenuOpen(false);
              await logout();
              onSelectTab('landing');
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-[#f87171]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </nav>
      )}
    </header>
  );
};
