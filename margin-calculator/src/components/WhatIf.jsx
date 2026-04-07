import { useState } from 'react';
import { compareCountries } from '../utils/margin';

export default function WhatIf({ skus, packagingPresets, carrierRates, settings }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedPackaging, setSelectedPackaging] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [vatRate, setVatRate] = useState(String(settings.vatStandard));
  const [priceAdjust, setPriceAdjust] = useState(0);
  const [costAdjust, setCostAdjust] = useState(0);
  const [shippingAdjust, setShippingAdjust] = useState(0);

  function addProduct(skuId) {
    if (!skuId) return;
    const existing = selectedProducts.find((p) => p.skuId === skuId);
    if (existing) {
      setSelectedProducts(selectedProducts.map((p) =>
        p.skuId === skuId ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      const sku = skus.find((s) => s.id === skuId);
      setSelectedProducts([...selectedProducts, { skuId, sku: sku.sku, name: sku.name, unitCost: sku.unitCost, quantity: 1 }]);
    }
  }

  function removeProduct(skuId) {
    setSelectedProducts(selectedProducts.filter((p) => p.skuId !== skuId));
  }

  const packaging = packagingPresets.find((p) => p.id === selectedPackaging);
  const canSimulate = selectedProducts.length > 0 && basePrice && selectedPackaging;

  // Compute base and adjusted results
  let baseResults = null;
  let adjustedResults = null;

  if (canSimulate) {
    const price = parseFloat(basePrice);
    const vat = parseFloat(vatRate);

    baseResults = compareCountries({
      products: selectedProducts,
      packagingPreset: packaging,
      carrierRates,
      sellingPrice: price,
      vatRate: vat,
    });

    // Apply adjustments
    const adjustedProducts = selectedProducts.map((p) => ({
      ...p,
      unitCost: p.unitCost * (1 + costAdjust / 100),
    }));
    const adjustedRates = carrierRates.map((r) => ({
      ...r,
      cost: r.cost * (1 + shippingAdjust / 100),
    }));

    adjustedResults = compareCountries({
      products: adjustedProducts,
      packagingPreset: packaging,
      carrierRates: adjustedRates,
      sellingPrice: price * (1 + priceAdjust / 100),
      vatRate: vat,
    });
  }

  return (
    <div className="panel">
      <h2>What-If Simulator</h2>
      <p className="hint">Simulate price and cost changes to see how they affect margins.</p>

      <div className="calc-section">
        <h3>Package Setup</h3>
        <div className="form-row">
          <select onChange={(e) => { addProduct(e.target.value); e.target.value = ''; }}>
            <option value="">+ Add product...</option>
            {skus.map((s) => (
              <option key={s.id} value={s.id}>{s.sku} — {s.name} (€{s.unitCost.toFixed(2)})</option>
            ))}
          </select>
          <select value={selectedPackaging} onChange={(e) => setSelectedPackaging(e.target.value)}>
            <option value="">Select packaging...</option>
            {packagingPresets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input placeholder="Selling Price (€)" type="number" step="0.01" min="0" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
          <select value={vatRate} onChange={(e) => setVatRate(e.target.value)}>
            <option value={settings.vatStandard}>VAT {settings.vatStandard}%</option>
            <option value={settings.vatReduced}>VAT {settings.vatReduced}%</option>
            <option value="0">VAT 0%</option>
          </select>
        </div>

        {selectedProducts.length > 0 && (
          <div className="selected-products">
            {selectedProducts.map((p) => (
              <span key={p.skuId} className="product-tag">
                {p.name} × {p.quantity} (€{(p.unitCost * p.quantity).toFixed(2)})
                <button onClick={() => removeProduct(p.skuId)}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {canSimulate && (
        <>
          <div className="calc-section">
            <h3>Adjustments</h3>
            <div className="slider-group">
              <label>
                <span>Selling Price: <strong>{priceAdjust >= 0 ? '+' : ''}{priceAdjust}%</strong></span>
                <input type="range" min="-50" max="50" value={priceAdjust} onChange={(e) => setPriceAdjust(Number(e.target.value))} />
              </label>
              <label>
                <span>Product Costs: <strong>{costAdjust >= 0 ? '+' : ''}{costAdjust}%</strong></span>
                <input type="range" min="-50" max="50" value={costAdjust} onChange={(e) => setCostAdjust(Number(e.target.value))} />
              </label>
              <label>
                <span>Shipping Costs: <strong>{shippingAdjust >= 0 ? '+' : ''}{shippingAdjust}%</strong></span>
                <input type="range" min="-50" max="50" value={shippingAdjust} onChange={(e) => setShippingAdjust(Number(e.target.value))} />
              </label>
            </div>
            <button className="btn btn-secondary" onClick={() => { setPriceAdjust(0); setCostAdjust(0); setShippingAdjust(0); }}>
              Reset Adjustments
            </button>
          </div>

          <div className="results-section">
            <h3>Base vs Adjusted Comparison</h3>
            <table>
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Carrier</th>
                  <th>Base Margin</th>
                  <th>Adjusted Margin</th>
                  <th>Change</th>
                  <th>Base Profit</th>
                  <th>Adjusted Profit</th>
                </tr>
              </thead>
              <tbody>
                {baseResults.map((base, i) => {
                  const adj = adjustedResults[i];
                  const marginDiff = adj.grossMarginPercent - base.grossMarginPercent;
                  return (
                    <tr key={i} className={adj.grossMarginPercent < settings.marginThreshold ? 'low-margin' : ''}>
                      <td>{base.country}</td>
                      <td>{base.carrier}</td>
                      <td>
                        <span className={`margin-badge ${base.grossMarginPercent < settings.marginThreshold ? 'margin-low' : 'margin-ok'}`}>
                          {base.grossMarginPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span className={`margin-badge ${adj.grossMarginPercent < settings.marginThreshold ? 'margin-low' : adj.grossMarginPercent >= 40 ? 'margin-high' : 'margin-ok'}`}>
                          {adj.grossMarginPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className={marginDiff < 0 ? 'negative' : marginDiff > 0 ? 'positive' : ''}>
                        {marginDiff >= 0 ? '+' : ''}{marginDiff.toFixed(1)}pp
                      </td>
                      <td>€{base.grossProfit.toFixed(2)}</td>
                      <td className={adj.grossProfit < 0 ? 'negative' : ''}>€{adj.grossProfit.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
