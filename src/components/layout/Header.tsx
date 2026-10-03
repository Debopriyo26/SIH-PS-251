import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Boxes, 
  TrendingUp, 
  CloudSun, 
  Bell, 
  HelpCircle, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  Volume2,
  VolumeX,
  Inbox,
  Clock,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../lib/authContext';
import { alertSoundService } from '../../lib/sound';
import { requestService } from '../../services/requestService';
import { ZonalNotification } from '../../types';

export type NavTab = 
  | 'landing'
  | 'dashboard'
  | 'locations'
  | 'supplies'
  | 'forecast'
  | 'weather'
  | 'alerts'
  | 'communication'
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
  unreadAlertsCount = 0,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(alertSoundService.isSoundEnabled());
  const [notifications, setNotifications] = useState<ZonalNotification[]>([]);
  const [pendingReqCount, setPendingReqCount] = useState<number>(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isMainHead = user?.role === 'MAIN_HEAD';

  const loadNotifsAndStats = () => {
    if (isAuthenticated && user) {
      const notifs = requestService.getNotifications(user.role || 'ZONAL_HEAD', user.zone);
      setNotifications(notifs);
      const summary = requestService.getSummaryStats(user.role || 'ZONAL_HEAD', user.zone);
      setPendingReqCount(isMainHead ? summary.pending : summary.inProgress + summary.pending);
    }
  };

  useEffect(() => {
    loadNotifsAndStats();
    const interval = setInterval(loadNotifsAndStats, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, currentTab]);

  // Click outside listener for popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = alertSoundService.toggleSound();
    setSoundEnabled(updated);
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => requestService.markNotificationRead(n.id));
    if (user) {
      setNotifications(requestService.getNotifications(user.role || 'ZONAL_HEAD', user.zone));
    }
  };

  const handleNotificationClick = (notif: ZonalNotification) => {
    requestService.markNotificationRead(notif.id);
    if (user) {
      setNotifications(requestService.getNotifications(user.role || 'ZONAL_HEAD', user.zone));
    }
    setNotifOpen(false);
    onSelectTab('communication');
  };

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  // Primary Navigation items - Decongested, keeping core features in place, replacing Simulator with Weather
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'locations' as NavTab, label: 'Locations', icon: MapPin },
    { id: 'supplies' as NavTab, label: 'Supplies', icon: Boxes },
    { id: 'forecast' as NavTab, label: 'Forecast', icon: TrendingUp },
    { id: 'weather' as NavTab, label: 'Weather', icon: CloudSun },
    { id: 'alerts' as NavTab, label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D8DFD5] shadow-xs">
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Left Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onSelectTab(isAuthenticated ? 'dashboard' : 'landing')}
            className="text-left focus:outline-hidden group cursor-pointer"
          >
            <Logo size="md" showTagline={true} />
          </button>
        </div>

        {/* Primary Navigation (Desktop) - Authenticated Only */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`h-8 inline-flex items-center gap-2 px-3 font-tactical text-xs tracking-wider uppercase transition-colors rounded-xs border cursor-pointer ${
                    isActive
                      ? 'bg-[#355E3B] text-white border-[#1F3D27] font-bold shadow-xs'
                      : 'text-[#52606D] hover:text-[#1F2933] hover:bg-[#F0F4EE] border-transparent font-semibold'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#B5A47A]' : 'text-[#6B7444]'}`} />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#B42318] text-white font-mono text-[10px] font-bold leading-none">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        )}

        {/* Top-Right Controls - Streamlined, non-congested */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {isAuthenticated ? (
            <>
              {/* Notification Center Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  title="Logistics & Zonal Notifications"
                  className={`relative h-8 w-8 inline-flex items-center justify-center rounded-xs border font-mono text-xs transition-colors cursor-pointer ${
                    unreadNotifCount > 0
                      ? 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]'
                      : 'bg-[#F0F4EE] hover:bg-[#E8EEE5] text-[#52606D] border-[#D8DFD5]'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 shrink-0" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#B42318] text-white font-mono text-[9px] font-bold shadow-xs animate-pulse leading-none">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-[#D8DFD5] rounded-xs shadow-xl py-2 z-50 font-mono text-xs">
                    <div className="px-3.5 py-2 border-b border-[#F0F4EE] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-tactical font-bold text-xs text-[#1F2933] uppercase">
                        <Inbox className="w-3.5 h-3.5 text-[#355E3B]" />
                        <span>Command Notifications</span>
                        {unreadNotifCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#B42318] text-white text-[10px]">
                            {unreadNotifCount} new
                          </span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-[#355E3B] hover:underline font-semibold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[#F0F4EE]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-[#52606D] text-xs">
                          No recent command notifications.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 transition-colors cursor-pointer text-left ${
                              !n.is_read ? 'bg-[#F9FAF8] hover:bg-[#F0F4EE]' : 'hover:bg-[#F9FAF8] opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-xs border ${
                                n.priority === 'CRITICAL' ? 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]' :
                                n.priority === 'HIGH' ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]' :
                                'bg-[#E8EEE5] text-[#355E3B] border-[#CAD3C8]'
                              }`}>
                                {n.priority}
                              </span>
                              <span className="text-[10px] text-[#52606D] flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="font-tactical font-bold text-xs text-[#1F2933]">{n.title}</div>
                            <div className="text-[11px] text-[#52606D] mt-0.5 line-clamp-2">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-3.5 pt-2 border-t border-[#F0F4EE] flex justify-between">
                      <button
                        onClick={() => {
                          setNotifOpen(false);
                          onSelectTab('communication');
                        }}
                        className="w-full text-center py-1.5 bg-[#355E3B] hover:bg-[#1F3D27] text-white rounded-xs font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Open Request Center
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* The Single Last Button: User's Name with Dropdown Menu (Sound + My Requests + Help + Sign Out) */}
              <div className="relative min-w-0" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                  title="User Command Profile & Options"
                  className="h-9 inline-flex items-center gap-2 px-2.5 sm:px-3 rounded-xs bg-[#F0F4EE] hover:bg-[#E8EEE5] border border-[#D8DFD5] font-mono text-xs text-[#1F2933] transition-colors cursor-pointer shadow-xs min-w-0 max-w-[170px] sm:max-w-[240px] focus:outline-hidden focus:ring-2 focus:ring-yellow-500 overflow-hidden"
                >
                  <div className="w-5 h-5 rounded-full bg-[#355E3B] text-white flex items-center justify-center font-bold text-[10px] border border-[#1F3D27] shrink-0">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col text-left justify-center min-w-0 flex-1 overflow-hidden">
                    <span className="block font-bold text-xs text-[#1F2933] leading-tight truncate whitespace-nowrap">
                      {(user?.fullName || 'Officer').replace(/\s*\([^)]*\)/g, '').trim()}
                    </span>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#355E3B] leading-none whitespace-nowrap truncate">
                      {user?.role === 'MAIN_HEAD' ? '★ MAIN HEAD' : `⚑ ${user?.zone || 'ZONAL'} HEAD`}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#52606D] shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-[#D8DFD5] rounded-xs shadow-2xl py-1.5 z-50 font-mono text-xs">
                    {/* User Info Header */}
                    <div className="px-3.5 py-2.5 border-b border-[#F0F4EE] bg-[#F9FAF8]">
                      <div className="font-bold text-sm text-[#1F2933] truncate">
                        {user?.fullName || 'Logistics Officer'}
                      </div>
                      <div className="text-[10px] text-[#52606D] truncate mt-0.5">
                        {user?.email}
                      </div>
                      <div className="text-[10px] font-bold mt-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#355E3B]"></span>
                        <span className="text-[#355E3B]">
                          {user?.role === 'MAIN_HEAD' ? 'Main Logistics Command Head' : `Zonal Logistics Head — ${user?.zone}`}
                        </span>
                      </div>
                    </div>

                    <div className="py-1 divide-y divide-[#F0F4EE]">
                      {/* 1. Sound Option */}
                      <div className="px-3.5 py-2.5 flex items-center justify-between hover:bg-[#F9FAF8] transition-colors">
                        <div className="flex items-center gap-2.5 text-[#1F2933]">
                          {soundEnabled ? (
                            <Volume2 className="w-4 h-4 text-[#2F6B3C] shrink-0" />
                          ) : (
                            <VolumeX className="w-4 h-4 text-[#52606D] shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold block text-xs">Alert Audio</span>
                            <span className="text-[10px] text-[#52606D] block">Critical sound notifications</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleSound}
                          className={`px-2.5 py-1 rounded-xs text-[11px] font-bold border transition-colors cursor-pointer ${
                            soundEnabled
                              ? 'bg-[#E8F5E9] text-[#2F6B3C] border-[#A5D6A7]'
                              : 'bg-[#F0F4EE] text-[#52606D] border-[#D8DFD5]'
                          }`}
                        >
                          {soundEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      {/* 2. My Requests Additionally */}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onSelectTab('communication');
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-[#1F2933] hover:bg-[#F0F4EE] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Inbox className="w-4 h-4 text-[#355E3B] shrink-0" />
                          <div>
                            <span className="font-semibold block text-xs">
                              {isMainHead ? 'Zonal Requests' : 'My Requests'}
                            </span>
                            <span className="text-[10px] text-[#52606D] block">
                              {isMainHead ? 'Review sector replenishment dispatches' : 'Track & submit zone support requests'}
                            </span>
                          </div>
                        </div>
                        {pendingReqCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#B42318] text-white text-[10px] font-bold">
                            {pendingReqCount}
                          </span>
                        )}
                      </button>

                      {/* 3. Help */}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onSelectTab('help');
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-[#1F2933] hover:bg-[#F0F4EE] flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-[#6B7444] shrink-0" />
                        <div>
                          <span className="font-semibold block text-xs">Help & Guidance</span>
                          <span className="text-[10px] text-[#52606D] block">Operational manual & SOP protocols</span>
                        </div>
                      </button>

                      {/* 4. Sign Out */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            setProfileOpen(false);
                            await logout();
                            onSelectTab('landing');
                          }}
                          className="w-full text-left px-3.5 py-2.5 text-[#B42318] hover:bg-[#FEE4E2] flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <div>
                            <span className="block text-xs">Sign Out</span>
                            <span className="text-[10px] text-[#B42318]/80 font-normal block">Disconnect active logistics session</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-xs bg-[#F0F4EE] border border-[#D8DFD5] text-[#1F2933] cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => onSelectTab('login')}
                className="h-8 inline-flex items-center px-3.5 rounded-xs text-[#1F2933] hover:bg-[#F0F4EE] border border-transparent hover:border-[#D8DFD5] font-semibold transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onSelectTab('signup')}
                className="h-8 inline-flex items-center px-3.5 rounded-xs bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Create Account
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Drawer (Authenticated) */}
      {isAuthenticated && mobileMenuOpen && (
        <nav className="lg:hidden bg-white border-b border-[#D8DFD5] p-4 flex flex-col gap-1.5 font-mono text-xs">
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
                className={`flex items-center justify-between px-3 py-2 rounded-xs border cursor-pointer ${
                  isActive
                    ? 'bg-[#355E3B] text-white border-[#1F3D27] font-bold'
                    : 'text-[#52606D] hover:bg-[#F0F4EE] border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#6B7444]" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#B42318] text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="border-t border-[#F0F4EE] my-2" />

          {/* My Requests in mobile drawer */}
          <button
            onClick={() => {
              onSelectTab('communication');
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between px-3 py-2 text-[#52606D] hover:bg-[#F0F4EE] rounded-xs font-medium cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-[#355E3B]" />
              <span>{isMainHead ? 'Zonal Requests' : 'My Requests'}</span>
            </div>
            {pendingReqCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#B42318] text-white text-[10px] font-bold">
                {pendingReqCount}
              </span>
            )}
          </button>

          {/* Sound toggle in mobile drawer */}
          <div className="flex items-center justify-between px-3 py-2 text-[#52606D]">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#355E3B]" />
              <span>Alert Sound</span>
            </span>
            <button
              onClick={handleToggleSound}
              className={`px-2 py-0.5 rounded-xs text-[11px] font-bold border ${
                soundEnabled
                  ? 'bg-[#E8F5E9] text-[#2F6B3C] border-[#A5D6A7]'
                  : 'bg-[#F0F4EE] text-[#52606D] border-[#D8DFD5]'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <button
            onClick={() => {
              onSelectTab('help');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-[#52606D]"
          >
            <HelpCircle className="w-4 h-4 text-[#6B7444]" />
            <span>Help & Documentation</span>
          </button>

          <button
            onClick={async () => {
              setMobileMenuOpen(false);
              await logout();
              onSelectTab('landing');
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-[#B42318] font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </nav>
      )}
    </header>
  );
};
