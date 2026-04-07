import { useState } from 'react';

const COUNTRIES = ['US', 'UK', 'Australia', 'Canada', 'Ireland', 'EU'];

export default function CarrierRates({ rates, onSave }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ carrier: '', country: 'US', cost: '' });

  function resetForm() {
    setForm({ carrier: '', country: 'US', cost: '' });
    setEditId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.carrier || !form.cost) return;
    const entry = {
      id: editId || crypto.randomUUID(),
      carrier: form.carrier,
      country: form.country,
      cost: parseFloat(form.cost),
    };
    if (editId) {
      onSave(rates.map((r) => (r.id === editId ? entry : r)));
    } else {
      onSave([...rates, entry]);
    }
    resetForm();
  }

  function handleEdit(r) {
    setEditId(r.id);
    setForm({ carrier: r.carrier, country: r.country, cost: String(r.cost) });
  }

  function handleDelete(id) {
    onSave(rates.filter((r) => r.id !== id));
  }

  // Group by country for display
  const grouped = {};
  rates.forEach((r) => {
    if (!grouped[r.country]) grouped[r.country] = [];
    grouped[r.country].push(r);
  });

  return (
    <div className="panel">
      <h2>Carrier / Shipping Rates</h2>
      <form onSubmit={handleSubmit} className="form-row">
        <input placeholder="Carrier Name" value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} required />
        <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Cost (€)" type="number" step="0.01" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
        <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Rate'}</button>
        {editId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
      </form>

      {Object.keys(grouped).length === 0 ? (
        <p className="empty">No carrier rates yet.</p>
      ) : (
        Object.entries(grouped).map(([country, countryRates]) => (
          <div key={country} className="country-group">
            <h3>{country}</h3>
            <table>
              <thead>
                <tr><th>Carrier</th><th>Cost (€)</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {countryRates.map((r) => (
                  <tr key={r.id}>
                    <td>{r.carrier}</td>
                    <td>{r.cost.toFixed(2)}</td>
                    <td>
                      <button className="btn-sm" onClick={() => handleEdit(r)}>Edit</button>
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
