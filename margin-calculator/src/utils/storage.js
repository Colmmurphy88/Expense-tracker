const KEYS = {
  SKUS: 'mc_skus',
  PACKAGING: 'mc_packaging_presets',
  CARRIERS: 'mc_carrier_rates',
  CALCULATIONS: 'mc_calculations',
  SETTINGS: 'mc_settings',
};

export function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadSkus() {
  return load(KEYS.SKUS) || [];
}
export function saveSkus(skus) {
  save(KEYS.SKUS, skus);
}

export function loadPackagingPresets() {
  return load(KEYS.PACKAGING) || getDefaultPackagingPresets();
}
export function savePackagingPresets(presets) {
  save(KEYS.PACKAGING, presets);
}

export function loadCarrierRates() {
  return load(KEYS.CARRIERS) || getDefaultCarrierRates();
}
export function saveCarrierRates(rates) {
  save(KEYS.CARRIERS, rates);
}

export function loadCalculations() {
  return load(KEYS.CALCULATIONS) || [];
}
export function saveCalculations(calcs) {
  save(KEYS.CALCULATIONS, calcs);
}

export function loadSettings() {
  return load(KEYS.SETTINGS) || { marginThreshold: 20, vatStandard: 23, vatReduced: 13.5 };
}
export function saveSettings(settings) {
  save(KEYS.SETTINGS, settings);
}

function getDefaultPackagingPresets() {
  return [
    { id: '1', name: 'Standard Box', boxCost: 1.50, fillerCost: 0.40, tapeCost: 0.10, insertCost: 0.60 },
    { id: '2', name: 'Premium Box', boxCost: 2.80, fillerCost: 0.60, tapeCost: 0.10, insertCost: 1.20 },
    { id: '3', name: 'Mini Box', boxCost: 0.90, fillerCost: 0.25, tapeCost: 0.10, insertCost: 0.40 },
  ];
}

function getDefaultCarrierRates() {
  return [
    { id: '1', carrier: 'An Post', country: 'US', cost: 14.50 },
    { id: '2', carrier: 'An Post', country: 'UK', cost: 8.50 },
    { id: '3', carrier: 'An Post', country: 'Australia', cost: 18.00 },
    { id: '4', carrier: 'An Post', country: 'Canada', cost: 15.50 },
    { id: '5', carrier: 'DHL Express', country: 'US', cost: 22.00 },
    { id: '6', carrier: 'DHL Express', country: 'UK', cost: 12.00 },
    { id: '7', carrier: 'DHL Express', country: 'Australia', cost: 28.00 },
    { id: '8', carrier: 'DHL Express', country: 'Canada', cost: 24.00 },
    { id: '9', carrier: 'DPD', country: 'UK', cost: 7.00 },
    { id: '10', carrier: 'FedEx', country: 'US', cost: 19.50 },
    { id: '11', carrier: 'FedEx', country: 'Australia', cost: 25.00 },
    { id: '12', carrier: 'FedEx', country: 'Canada', cost: 21.00 },
  ];
}

export { KEYS };
