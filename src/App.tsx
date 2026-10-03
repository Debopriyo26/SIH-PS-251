import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { Header, NavTab } from './components/layout/Header';
import { VyomixAssistModal } from './components/assistant/VyomixAssistModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { CommunicationPage } from './pages/CommunicationPage';
import { LocationsPage } from './pages/LocationsPage';
import { SuppliesPage } from './pages/SuppliesPage';
import { ForecastPage } from './pages/ForecastPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AlertsPage } from './pages/AlertsPage';
import { HelpPage } from './pages/HelpPage';
import { LocationNode } from './types';
import { resolveLocationId } from './lib/zones';

function MainAppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('landing');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');
  const [selectedLocationForDetail, setSelectedLocationForDetail] = useState<LocationNode | null>(null);
  const [isAssistOpen, setIsAssistOpen] = useState(false);

  // Auto-switch to dashboard upon successful authentication, or enforce landing page if unauthenticated (Requirement 1 & 12)
  useEffect(() => {
    if (isAuthenticated && (currentTab === 'landing' || currentTab === 'login' || currentTab === 'signup' || currentTab === 'forgot-password')) {
      setCurrentTab('dashboard');
    } else if (!isAuthenticated && currentTab !== 'landing' && currentTab !== 'login' && currentTab !== 'signup' && currentTab !== 'forgot-password') {
      setCurrentTab('landing');
    }
  }, [isAuthenticated, currentTab]);

  // Strict Zone Isolation: Lock location to Zonal Head's assigned zone
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ZONAL_HEAD' && user?.zone) {
      setSelectedLocationId(resolveLocationId(user.zone));
    }
  }, [isAuthenticated, user?.role, user?.zone]);

  const handleLocationChange = (locId: string) => {
    if (user?.role === 'ZONAL_HEAD' && user?.zone) {
      // Zonal Head can NEVER switch to any other zone
      setSelectedLocationId(resolveLocationId(user.zone));
    } else {
      setSelectedLocationId(locId);
    }
  };

  // If loading session, show subtle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] text-[#1F2933] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#355E3B] animate-ping" />
          <span className="font-bold tracking-wider">INITIALIZING VYOMIX PLATFORM...</span>
        </div>
      </div>
    );
  }

  // Routing and protected access control
  const renderPage = () => {
    // Public routes
    if (!isAuthenticated) {
      if (currentTab === 'login') return <LoginPage onNavigate={setCurrentTab} />;
      if (currentTab === 'signup') return <SignupPage onNavigate={setCurrentTab} />;
      if (currentTab === 'forgot-password') return <ForgotPasswordPage onNavigate={setCurrentTab} />;
      return <LandingPage onNavigate={setCurrentTab} />;
    }

    // Authenticated operational routes
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={setCurrentTab}
            selectedLocationId={selectedLocationId}
            onLocationChange={handleLocationChange}
            onSelectLocationForDetail={(loc) => {
              if (user?.role === 'ZONAL_HEAD' && user?.zone) {
                setSelectedLocationForDetail(loc);
                setSelectedLocationId(resolveLocationId(user.zone));
              } else {
                setSelectedLocationForDetail(loc);
                setSelectedLocationId(loc.id);
              }
            }}
          />
        );
      case 'locations':
        return (
          <LocationsPage
            onNavigate={setCurrentTab}
            selectedLocationId={selectedLocationId}
            onLocationChange={handleLocationChange}
            onSelectLocationForDetail={(loc) => {
              if (user?.role === 'ZONAL_HEAD' && user?.zone) {
                setSelectedLocationForDetail(loc);
                setSelectedLocationId(resolveLocationId(user.zone));
              } else {
                setSelectedLocationForDetail(loc);
                setSelectedLocationId(loc.id);
              }
            }}
          />
        );
      case 'supplies':
        return (
          <SuppliesPage
            selectedLocationId={selectedLocationId}
            onLocationChange={handleLocationChange}
          />
        );
      case 'forecast':
        return <ForecastPage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'alerts':
        return <AlertsPage selectedLocationId={selectedLocationId} />;
      case 'communication':
        return <CommunicationPage />;
      case 'help':
        return <HelpPage />;
      default:
        return (
          <DashboardPage
            onNavigate={setCurrentTab}
            selectedLocationId={selectedLocationId}
            onLocationChange={handleLocationChange}
            onSelectLocationForDetail={(loc) => {
              if (user?.role === 'ZONAL_HEAD' && user?.zone) {
                setSelectedLocationForDetail(loc);
                setSelectedLocationId(resolveLocationId(user.zone));
              } else {
                setSelectedLocationForDetail(loc);
                setSelectedLocationId(loc.id);
              }
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1F2933] flex flex-col font-sans">
      {/* Tactical Header with Simplified 6-item Nav, Profile Dropdown, and Help */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAssist={() => setIsAssistOpen(true)}
      />

      {/* Main Page Canvas */}
      <main className={`flex-1 ${currentTab === 'landing' || currentTab === 'login' || currentTab === 'signup' || currentTab === 'forgot-password' ? '' : 'p-4 md:p-6 max-w-7xl mx-auto w-full'}`}>
        {renderPage()}
      </main>

      {/* AI Assistant Modal */}
      {isAuthenticated && (
        <VyomixAssistModal
          isOpen={isAssistOpen}
          onClose={() => setIsAssistOpen(false)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
