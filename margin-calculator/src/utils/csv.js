import Papa from 'papaparse';

/**
 * Parse a CSV file of product SKUs.
 * Expected columns: sku, name, unitCost, category (optional)
 */
export function importProductsCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete(results) {
        const products = results.data
          .filter((row) => row.sku && row.name && row.unitCost != null)
          .map((row) => ({
            id: crypto.randomUUID(),
            sku: String(row.sku).trim(),
            name: String(row.name).trim(),
            unitCost: Number(row.unitCost),
            category: row.category ? String(row.category).trim() : '',
          }));
        resolve(products);
      },
      error(err) {
        reject(err);
      },
    });
  });
}

/**
 * Export margin report rows as CSV.
 */
export function exportMarginReportCSV(rows) {
  const data = rows.map((r) => ({
    Date: r.date,
    'Package Name': r.name,
    Country: r.country,
    Carrier: r.carrier,
    'Selling Price (€)': r.sellingPrice,
    'Product Cost (€)': r.productCost,
    'Packaging Cost (€)': r.packagingCost,
    'Shipping Cost (€)': r.shippingCost,
    'Total Cost (€)': r.totalCost,
    'Net Selling Price (€)': r.netSellingPrice,
    'Gross Profit (€)': r.grossProfit,
    'Gross Margin (%)': r.grossMarginPercent,
  }));
  const csv = Papa.unparse(data);
  downloadCSV(csv, 'margin-report.csv');
}

function downloadCSV(csvString, filename) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
