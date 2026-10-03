import React, { useState, useEffect } from 'react';
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
  Bot,
  Volume2,
  VolumeX,
  Inbox,
  CheckCheck,
  CheckCircle2,
  Clock,
  ShieldAlert
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
  | 'simulator'
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

  const handleToggleSound = () => {
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

  // Primary Navigation items
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'communication' as NavTab, 
      label: isMainHead ? 'Zonal Requests' : 'My Requests', 
      icon: Inbox, 
      badge: pendingReqCount 
    },
    { id: 'locations' as NavTab, label: 'Locations', icon: MapPin },
    { id: 'supplies' as NavTab, label: 'Supplies', icon: Boxes },
    { id: 'forecast' as NavTab, label: 'Forecast', icon: TrendingUp },
    { id: 'simulator' as NavTab, label: 'Simulator', icon: Sliders },
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

        {/* Top-Right Controls */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Sound ON/OFF Toggle (Requirement 14, 41) */}
              <button
                onClick={handleToggleSound}
                title={soundEnabled ? 'Alert Sound: ON (Click to Mute)' : 'Alert Sound: OFF (Click to Enable)'}
                className={`h-8 inline-flex items-center gap-1.5 px-2.5 rounded-xs border font-mono text-xs transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-[#E8F5E9] text-[#2F6B3C] border-[#A5D6A7]'
                    : 'bg-[#F0F4EE] text-[#52606D] border-[#D8DFD5]'
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#2F6B3C] shrink-0" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-[#52606D] shrink-0" />
                )}
                <span className="hidden md:inline font-semibold">Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {/* Optional AI Assistant quick button */}
              {onOpenAssist && (
                <button
                  onClick={onOpenAssist}
                  title="Ask VYOMIX Assistant"
                  className="hidden sm:inline-flex h-8 items-center gap-1.5 px-2.5 rounded-xs bg-[#F0F4EE] hover:bg-[#E8EEE5] text-[#355E3B] border border-[#D8DFD5] font-mono text-xs transition-colors cursor-pointer font-semibold"
                >
                  <Bot className="w-3.5 h-3.5 text-[#355E3B] shrink-0" />
                  <span>AI Assist</span>
                </button>
              )}

              {/* Notification Center Popover */}
              <div className="relative">
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

              {/* Help button */}
              <button
                onClick={() => onSelectTab('help')}
                className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-xs font-mono text-xs tracking-wider border transition-colors cursor-pointer font-semibold ${
                  currentTab === 'help'
                    ? 'bg-[#355E3B] text-white border-[#1F3D27]'
                    : 'text-[#52606D] hover:text-[#1F2933] bg-[#F0F4EE] border-[#D8DFD5]'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#6B7444] shrink-0" />
                <span className="hidden sm:inline">Help</span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="h-8 inline-flex items-center gap-2 px-2.5 rounded-xs bg-[#F0F4EE] hover:bg-[#E8EEE5] border border-[#D8DFD5] font-mono text-xs text-[#1F2933] transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-[#355E3B] text-white flex items-center justify-center font-bold text-[10px] border border-[#1F3D27] shrink-0">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col text-left justify-center">
                    <span className="hidden md:inline font-semibold text-xs text-[#1F2933] leading-none">{user?.fullName || 'Officer'}</span>
                    <span className="hidden md:inline text-[9px] font-bold uppercase tracking-wider text-[#355E3B] leading-none mt-0.5">
                      {user?.role === 'MAIN_HEAD' ? '★ MAIN HEAD' : `⚑ ${user?.zone || 'ZONAL'} HEAD`}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#52606D] shrink-0" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D8DFD5] rounded-xs shadow-xl py-1 z-50 font-mono text-xs">
                    <div className="px-3 py-2.5 border-b border-[#F0F4EE]">
                      <div className="font-bold text-[#1F2933] truncate">{user?.fullName}</div>
                      <div className="text-[10px] text-[#52606D] truncate">{user?.email}</div>
                      <div className="text-[10px] text-[#355E3B] font-bold mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#355E3B]"></span>
                        <span>{user?.role === 'MAIN_HEAD' ? 'Main Logistics Head' : `Zonal Head — ${user?.zone}`}</span>
                      </div>
                    </div>

                    {/* Alert sound toggle inside profile dropdown (Requirement 14, 41) */}
                    <div className="px-3 py-2 border-b border-[#F0F4EE] flex items-center justify-between text-xs">
                      <span className="text-[#52606D] flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-[#355E3B]" />
                        <span>Alert Sound</span>
                      </span>
                      <button
                        onClick={handleToggleSound}
                        className={`px-2 py-0.5 rounded-xs text-[11px] font-bold cursor-pointer border ${
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
                        setProfileOpen(false);
                        onSelectTab('help');
                      }}
                      className="w-full text-left px-3 py-2 text-[#52606D] hover:text-[#1F2933] hover:bg-[#F0F4EE] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#6B7444]" />
                      <span>Help & Documentation</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onSelectTab('help');
                      }}
                      className="w-full text-left px-3 py-2 text-[#52606D] hover:text-[#1F2933] hover:bg-[#F0F4EE] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Database className="w-3.5 h-3.5 text-[#355E3B]" />
                      <span>Data & Integrations</span>
                    </button>

                    <div className="border-t border-[#F0F4EE] my-1" />

                    <button
                      onClick={async () => {
                        setProfileOpen(false);
                        await logout();
                        onSelectTab('landing');
                      }}
                      className="w-full text-left px-3 py-2 text-[#B42318] hover:bg-[#FEE4E2] flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Sign Out Button (Requirement 2 & 8) */}
              <button
                onClick={async () => {
                  setProfileOpen(false);
                  await logout();
                  onSelectTab('landing');
                }}
                title="Sign Out of VYOMIX"
                className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-xs bg-[#FEE4E2]/50 hover:bg-[#FEE4E2] text-[#B42318] border border-[#FDA29B] font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

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
