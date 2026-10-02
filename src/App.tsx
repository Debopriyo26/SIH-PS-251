import React, { useState } from 'react';
import { Header, NavTab } from './components/layout/Header';
import { DemoBanner } from './components/common/DemoBanner';
import { VyomixAssistModal } from './components/assistant/VyomixAssistModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LogisticsMapPage } from './pages/LogisticsMapPage';
import { InventoryPage } from './pages/InventoryPage';
import { ForecastPage } from './pages/ForecastPage';
import { WeatherPage } from './pages/WeatherPage';
import { TransportPage } from './pages/TransportPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AlertsPage } from './pages/AlertsPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { LocationNode } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('landing');
  const [isAssistOpen, setIsAssistOpen] = useState(false);
  const [selectedLocationForDetail, setSelectedLocationForDetail] = useState<LocationNode | null>(null);

  const renderContent = () => {
    switch (currentTab) {
      case 'landing':
        return (
          <LandingPage
            onEnter={() => setCurrentTab('dashboard')}
            onViewArchitecture={() => setCurrentTab('sources')}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectLocationForDetail={(loc) => setSelectedLocationForDetail(loc)}
          />
        );
      case 'map':
        return (
          <LogisticsMapPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectLocationForDetail={(loc) => setSelectedLocationForDetail(loc)}
          />
        );
      case 'inventory':
        return <InventoryPage initialLocationId={selectedLocationForDetail?.id} />;
      case 'forecast':
        return <ForecastPage />;
      case 'weather':
        return <WeatherPage />;
      case 'transport':
        return <TransportPage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'sources':
        return <DataSourcesPage />;
      default:
        return (
          <DashboardPage
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#07100B] text-[#E7E9E2] flex flex-col font-sans">
      {/* Top Demonstration Mode Notice */}
      <DemoBanner />

      {/* Main Tactical Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAssist={() => setIsAssistOpen(true)}
      />

      {/* Main Page Area */}
      <main className={`flex-1 ${currentTab === 'landing' ? '' : 'p-4 md:p-6 max-w-7xl mx-auto w-full'}`}>
        {renderContent()}
      </main>

      {/* Grounded AI Assistant Drawer */}
      <VyomixAssistModal
        isOpen={isAssistOpen}
        onClose={() => setIsAssistOpen(false)}
      />
    </div>
  );
}

export default App;
