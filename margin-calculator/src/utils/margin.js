/**
 * Calculate margin for a given package configuration and destination.
 */
export function calculateMargin({ products, packagingPreset, carrierRate, sellingPrice, vatRate }) {
  const productCost = products.reduce((sum, p) => sum + p.unitCost * p.quantity, 0);
  const packagingCost = packagingPreset
    ? packagingPreset.boxCost + packagingPreset.fillerCost + packagingPreset.tapeCost + packagingPreset.insertCost
    : 0;
  const shippingCost = carrierRate ? carrierRate.cost : 0;

  const totalCost = productCost + packagingCost + shippingCost;

  // VAT is included in the selling price for Irish businesses
  const vatMultiplier = 1 + vatRate / 100;
  const netSellingPrice = sellingPrice / vatMultiplier;

  const grossProfit = netSellingPrice - totalCost;
  const grossMarginPercent = netSellingPrice > 0 ? (grossProfit / netSellingPrice) * 100 : 0;

  return {
    productCost: round(productCost),
    packagingCost: round(packagingCost),
    shippingCost: round(shippingCost),
    totalCost: round(totalCost),
    vatAmount: round(sellingPrice - netSellingPrice),
    netSellingPrice: round(netSellingPrice),
    grossProfit: round(grossProfit),
    grossMarginPercent: round(grossMarginPercent),
    sellingPrice: round(sellingPrice),
  };
}

/**
 * Compare margins across multiple countries for the same box.
 */
export function compareCountries({ products, packagingPreset, carrierRates, sellingPrice, vatRate }) {
  return carrierRates.map((rate) => ({
    country: rate.country,
    carrier: rate.carrier,
    ...calculateMargin({ products, packagingPreset, carrierRate: rate, sellingPrice, vatRate }),
  }));
}

function round(val) {
  return Math.round(val * 100) / 100;
}
