import { useState } from 'react';
import { calculateMargin, compareCountries } from '../utils/margin';

export default function MarginCalculator({ skus, packagingPresets, carrierRates, settings, onSaveCalculation }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedPackaging, setSelectedPackaging] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [vatRate, setVatRate] = useState(String(settings.vatStandard));
  const [packageName, setPackageName] = useState('');
  const [results, setResults] = useState(null);

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

  function updateQuantity(skuId, qty) {
    if (qty <= 0) {
      setSelectedProducts(selectedProducts.filter((p) => p.skuId !== skuId));
    } else {
      setSelectedProducts(selectedProducts.map((p) =>
        p.skuId === skuId ? { ...p, quantity: qty } : p
      ));
    }
  }

  function removeProduct(skuId) {
    setSelectedProducts(selectedProducts.filter((p) => p.skuId !== skuId));
  }

  function handleCalculate() {
    if (selectedProducts.length === 0 || !sellingPrice || !selectedPackaging) return;

    const packaging = packagingPresets.find((p) => p.id === selectedPackaging);
    const vat = parseFloat(vatRate);
    const price = parseFloat(sellingPrice);

    const countryResults = compareCountries({
      products: selectedProducts,
      packagingPreset: packaging,
      carrierRates,
      sellingPrice: price,
      vatRate: vat,
    });

    setResults(countryResults);

    // Save calculation
    const calc = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      name: packageName || 'Untitled Package',
      sellingPrice: price,
      vatRate: vat,
      packaging: packaging.name,
      productCount: selectedProducts.length,
      countries: countryResults,
    };
    onSaveCalculation(calc);
  }

  const packaging = packagingPresets.find((p) => p.id === selectedPackaging);
  const productTotal = selectedProducts.reduce((s, p) => s + p.unitCost * p.quantity, 0);

  return (
    <div className="panel">
      <h2>Margin Calculator</h2>

      <div className="calc-section">
        <h3>1. Package Details</h3>
        <input
          placeholder="Package name (e.g. 'Irish Treats Box')"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          className="full-width"
        />
      </div>

      <div className="calc-section">
        <h3>2. Select Products</h3>
        <div className="form-row">
          <select onChange={(e) => { addProduct(e.target.value); e.target.value = ''; }}>
            <option value="">+ Add product...</option>
            {skus.map((s) => (
              <option key={s.id} value={s.id}>{s.sku} — {s.name} (€{s.unitCost.toFixed(2)})</option>
            ))}
          </select>
        </div>

        {selectedProducts.length > 0 && (
          <table className="compact">
            <thead>
              <tr><th>SKU</th><th>Product</th><th>Unit Cost</th><th>Qty</th><th>Line Total</th><th></th></tr>
            </thead>
            <tbody>
              {selectedProducts.map((p) => (
                <tr key={p.skuId}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>€{p.unitCost.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={p.quantity}
                      onChange={(e) => updateQuantity(p.skuId, parseInt(e.target.value) || 0)}
                      className="qty-input"
                    />
                  </td>
                  <td>€{(p.unitCost * p.quantity).toFixed(2)}</td>
                  <td><button className="btn-sm btn-danger" onClick={() => removeProduct(p.skuId)}>×</button></td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan="4"><strong>Product Total</strong></td>
                <td><strong>€{productTotal.toFixed(2)}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="calc-section">
        <h3>3. Packaging & Pricing</h3>
        <div className="form-row">
          <select value={selectedPackaging} onChange={(e) => setSelectedPackaging(e.target.value)}>
            <option value="">Select packaging...</option>
            {packagingPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (€{(p.boxCost + p.fillerCost + p.tapeCost + p.insertCost).toFixed(2)})
              </option>
            ))}
          </select>
          <input
            placeholder="Selling Price (€)"
            type="number"
            step="0.01"
            min="0"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
          />
          <select value={vatRate} onChange={(e) => setVatRate(e.target.value)}>
            <option value={settings.vatStandard}>VAT {settings.vatStandard}% (Standard)</option>
            <option value={settings.vatReduced}>VAT {settings.vatReduced}% (Reduced)</option>
            <option value="0">VAT 0% (Export/Exempt)</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary btn-lg" onClick={handleCalculate}
        disabled={selectedProducts.length === 0 || !sellingPrice || !selectedPackaging}>
        Calculate Margins
      </button>

      {results && (
        <div className="results-section">
          <h3>Margin Comparison by Destination</h3>

          <div className="cost-summary">
            <div className="cost-item">
              <span className="cost-label">Products</span>
              <span className="cost-value">€{results[0]?.productCost.toFixed(2)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">Packaging</span>
              <span className="cost-value">€{results[0]?.packagingCost.toFixed(2)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">VAT</span>
              <span className="cost-value">€{results[0]?.vatAmount.toFixed(2)}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Carrier</th>
                <th>Shipping</th>
                <th>Total Cost</th>
                <th>Net Revenue</th>
                <th>Gross Profit</th>
                <th>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={r.grossMarginPercent < settings.marginThreshold ? 'low-margin' : ''}>
                  <td>{r.country}</td>
                  <td>{r.carrier}</td>
                  <td>€{r.shippingCost.toFixed(2)}</td>
                  <td>€{r.totalCost.toFixed(2)}</td>
                  <td>€{r.netSellingPrice.toFixed(2)}</td>
                  <td className={r.grossProfit < 0 ? 'negative' : ''}>€{r.grossProfit.toFixed(2)}</td>
                  <td>
                    <span className={`margin-badge ${r.grossMarginPercent < settings.marginThreshold ? 'margin-low' : r.grossMarginPercent >= 40 ? 'margin-high' : 'margin-ok'}`}>
                      {r.grossMarginPercent.toFixed(1)}%
                    </span>
                    {r.grossMarginPercent < settings.marginThreshold && (
                      <span className="warning-flag" title={`Below ${settings.marginThreshold}% threshold`}> ⚠</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
