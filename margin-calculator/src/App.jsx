import { useState, useEffect } from 'react';
import SkuManager from './components/SkuManager';
import PackagingPresets from './components/PackagingPresets';
import CarrierRates from './components/CarrierRates';
import MarginCalculator from './components/MarginCalculator';
import Dashboard from './components/Dashboard';
import WhatIf from './components/WhatIf';
import Settings from './components/Settings';
import {
  loadSkus, saveSkus,
  loadPackagingPresets, savePackagingPresets,
  loadCarrierRates, saveCarrierRates,
  loadCalculations, saveCalculations,
  loadSettings, saveSettings,
} from './utils/storage';
import './App.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'whatif', label: 'What-If' },
  { id: 'products', label: 'Products' },
  { id: 'packaging', label: 'Packaging' },
  { id: 'carriers', label: 'Carriers' },
  { id: 'settings', label: 'Settings' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [skus, setSkus] = useState(() => loadSkus());
  const [packagingPresets, setPackagingPresets] = useState(() => loadPackagingPresets());
  const [carrierRates, setCarrierRates] = useState(() => loadCarrierRates());
  const [calculations, setCalculations] = useState(() => loadCalculations());
  const [settings, setSettings] = useState(() => loadSettings());

  useEffect(() => { saveSkus(skus); }, [skus]);
  useEffect(() => { savePackagingPresets(packagingPresets); }, [packagingPresets]);
  useEffect(() => { saveCarrierRates(carrierRates); }, [carrierRates]);
  useEffect(() => { saveCalculations(calculations); }, [calculations]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  function handleSaveCalculation(calc) {
    setCalculations((prev) => [...prev, calc]);
  }

  function handleClearCalculations() {
    if (confirm('Clear all saved calculations? This cannot be undone.')) {
      setCalculations([]);
    }
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>Margin Calculator</h1>
          <p className="subtitle">Irish Care Package E-Commerce</p>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="container">
        {activeTab === 'dashboard' && (
          <Dashboard calculations={calculations} settings={settings} onClear={handleClearCalculations} />
        )}
        {activeTab === 'calculator' && (
          <MarginCalculator
            skus={skus}
            packagingPresets={packagingPresets}
            carrierRates={carrierRates}
            settings={settings}
            onSaveCalculation={handleSaveCalculation}
          />
        )}
        {activeTab === 'whatif' && (
          <WhatIf skus={skus} packagingPresets={packagingPresets} carrierRates={carrierRates} settings={settings} />
        )}
        {activeTab === 'products' && (
          <SkuManager skus={skus} onSave={setSkus} />
        )}
        {activeTab === 'packaging' && (
          <PackagingPresets presets={packagingPresets} onSave={setPackagingPresets} />
        )}
        {activeTab === 'carriers' && (
          <CarrierRates rates={carrierRates} onSave={setCarrierRates} />
        )}
        {activeTab === 'settings' && (
          <Settings settings={settings} onSave={setSettings} />
        )}
      </main>
    </div>
  );
}
