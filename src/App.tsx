import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { Header, NavTab } from './components/layout/Header';
import { VyomixAssistModal } from './components/assistant/VyomixAssistModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { LocationsPage } from './pages/LocationsPage';
import { SuppliesPage } from './pages/SuppliesPage';
import { ForecastPage } from './pages/ForecastPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AlertsPage } from './pages/AlertsPage';
import { HelpPage } from './pages/HelpPage';
import { LocationNode } from './types';

function MainAppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('landing');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');
  const [selectedLocationForDetail, setSelectedLocationForDetail] = useState<LocationNode | null>(null);
  const [isAssistOpen, setIsAssistOpen] = useState(false);

  // If loading session, show subtle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07100B] text-[#E7E9E2] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B5A47A] animate-ping" />
          <span>INITIALIZING VYOMIX PLATFORM...</span>
        </div>
      </div>
    );
  }

  // Auto-switch to dashboard upon successful authentication if on public auth pages
  React.useEffect(() => {
    if (isAuthenticated && (currentTab === 'landing' || currentTab === 'login' || currentTab === 'signup' || currentTab === 'forgot-password')) {
      setCurrentTab('dashboard');
    }
  }, [isAuthenticated, currentTab]);

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
            onLocationChange={setSelectedLocationId}
            onSelectLocationForDetail={(loc) => {
              setSelectedLocationForDetail(loc);
              setSelectedLocationId(loc.id);
            }}
          />
        );
      case 'locations':
        return (
          <LocationsPage
            onNavigate={setCurrentTab}
            selectedLocationId={selectedLocationId}
            onLocationChange={setSelectedLocationId}
            onSelectLocationForDetail={(loc) => {
              setSelectedLocationForDetail(loc);
              setSelectedLocationId(loc.id);
            }}
          />
        );
      case 'supplies':
        return (
          <SuppliesPage
            selectedLocationId={selectedLocationId}
            onLocationChange={setSelectedLocationId}
          />
        );
      case 'forecast':
        return <ForecastPage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'alerts':
        return <AlertsPage selectedLocationId={selectedLocationId} />;
      case 'help':
        return <HelpPage />;
      default:
        return (
          <DashboardPage
            onNavigate={setCurrentTab}
            selectedLocationId={selectedLocationId}
            onLocationChange={setSelectedLocationId}
            onSelectLocationForDetail={(loc) => {
              setSelectedLocationForDetail(loc);
              setSelectedLocationId(loc.id);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#07100B] text-[#E7E9E2] flex flex-col font-sans">
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
