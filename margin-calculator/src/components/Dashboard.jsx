import { exportMarginReportCSV } from '../utils/csv';

export default function Dashboard({ calculations, settings, onClear }) {
  if (calculations.length === 0) {
    return (
      <div className="panel">
        <h2>Dashboard</h2>
        <p className="empty">No calculations yet. Use the Calculator tab to analyse your first package.</p>
      </div>
    );
  }

  // Flatten all country results for aggregate stats
  const allResults = calculations.flatMap((c) =>
    c.countries.map((r) => ({ ...r, name: c.name, date: new Date(c.date).toLocaleDateString() }))
  );

  const avgMargin = allResults.reduce((s, r) => s + r.grossMarginPercent, 0) / allResults.length;
  const lowMarginCount = allResults.filter((r) => r.grossMarginPercent < settings.marginThreshold).length;
  const totalProfit = allResults.reduce((s, r) => s + r.grossProfit, 0);
  const bestCountry = getBestAvgCountry(allResults);
  const worstCountry = getWorstAvgCountry(allResults);

  // Recent calculations (last 10)
  const recent = [...calculations].reverse().slice(0, 10);

  function handleExport() {
    const rows = allResults.map((r) => ({
      ...r,
      date: r.date,
    }));
    exportMarginReportCSV(rows);
  }

  return (
    <div className="panel">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div>
          <button className="btn btn-secondary" onClick={handleExport}>Export CSV</button>
          <button className="btn btn-danger" style={{ marginLeft: 8 }} onClick={onClear}>Clear All</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{calculations.length}</div>
          <div className="stat-label">Packages Analysed</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${avgMargin < settings.marginThreshold ? 'negative' : ''}`}>
            {avgMargin.toFixed(1)}%
          </div>
          <div className="stat-label">Avg Gross Margin</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">€{totalProfit.toFixed(2)}</div>
          <div className="stat-label">Total Gross Profit</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${lowMarginCount > 0 ? 'negative' : ''}`}>
            {lowMarginCount}
          </div>
          <div className="stat-label">Below {settings.marginThreshold}% Threshold</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: '1rem' }}>
        <div className="stat-card stat-good">
          <div className="stat-value">{bestCountry.country}</div>
          <div className="stat-label">Best Avg Margin ({bestCountry.avg.toFixed(1)}%)</div>
        </div>
        <div className="stat-card stat-warn">
          <div className="stat-value">{worstCountry.country}</div>
          <div className="stat-label">Worst Avg Margin ({worstCountry.avg.toFixed(1)}%)</div>
        </div>
      </div>

      <h3 style={{ marginTop: '1.5rem' }}>Recent Calculations</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Package</th><th>Price</th><th>VAT</th><th>Countries</th><th>Best Margin</th><th>Worst Margin</th></tr>
        </thead>
        <tbody>
          {recent.map((c) => {
            const best = Math.max(...c.countries.map((r) => r.grossMarginPercent));
            const worst = Math.min(...c.countries.map((r) => r.grossMarginPercent));
            return (
              <tr key={c.id}>
                <td>{new Date(c.date).toLocaleDateString()}</td>
                <td>{c.name}</td>
                <td>€{c.sellingPrice.toFixed(2)}</td>
                <td>{c.vatRate}%</td>
                <td>{c.countries.length}</td>
                <td><span className="margin-badge margin-high">{best.toFixed(1)}%</span></td>
                <td>
                  <span className={`margin-badge ${worst < settings.marginThreshold ? 'margin-low' : 'margin-ok'}`}>
                    {worst.toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getBestAvgCountry(results) {
  return getAvgByCountry(results).sort((a, b) => b.avg - a.avg)[0] || { country: 'N/A', avg: 0 };
}

function getWorstAvgCountry(results) {
  return getAvgByCountry(results).sort((a, b) => a.avg - b.avg)[0] || { country: 'N/A', avg: 0 };
}

function getAvgByCountry(results) {
  const map = {};
  results.forEach((r) => {
    if (!map[r.country]) map[r.country] = { sum: 0, count: 0 };
    map[r.country].sum += r.grossMarginPercent;
    map[r.country].count++;
  });
  return Object.entries(map).map(([country, { sum, count }]) => ({ country, avg: sum / count }));
}
