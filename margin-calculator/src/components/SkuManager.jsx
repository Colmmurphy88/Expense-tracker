import { useState } from 'react';
import { importProductsCSV } from '../utils/csv';

export default function SkuManager({ skus, onSave }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ sku: '', name: '', unitCost: '', category: '' });

  function resetForm() {
    setForm({ sku: '', name: '', unitCost: '', category: '' });
    setEditId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.sku || !form.name || !form.unitCost) return;
    const entry = {
      id: editId || crypto.randomUUID(),
      sku: form.sku,
      name: form.name,
      unitCost: parseFloat(form.unitCost),
      category: form.category,
    };
    if (editId) {
      onSave(skus.map((s) => (s.id === editId ? entry : s)));
    } else {
      onSave([...skus, entry]);
    }
    resetForm();
  }

  function handleEdit(sku) {
    setEditId(sku.id);
    setForm({ sku: sku.sku, name: sku.name, unitCost: String(sku.unitCost), category: sku.category || '' });
  }

  function handleDelete(id) {
    onSave(skus.filter((s) => s.id !== id));
  }

  async function handleCSVImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = await importProductsCSV(file);
      onSave([...skus, ...imported]);
    } catch {
      alert('Failed to parse CSV. Ensure columns: sku, name, unitCost');
    }
    e.target.value = '';
  }

  return (
    <div className="panel">
      <h2>Product SKUs</h2>
      <form onSubmit={handleSubmit} className="form-row">
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Unit Cost (€)" type="number" step="0.01" min="0" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add SKU'}</button>
        {editId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
      </form>

      <div className="csv-import">
        <label className="btn btn-secondary">
          Import CSV
          <input type="file" accept=".csv" onChange={handleCSVImport} hidden />
        </label>
        <span className="hint">Columns: sku, name, unitCost, category</span>
      </div>

      {skus.length === 0 ? (
        <p className="empty">No products yet. Add SKUs above or import a CSV.</p>
      ) : (
        <table>
          <thead>
            <tr><th>SKU</th><th>Name</th><th>Cost (€)</th><th>Category</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {skus.map((s) => (
              <tr key={s.id}>
                <td>{s.sku}</td>
                <td>{s.name}</td>
                <td>{s.unitCost.toFixed(2)}</td>
                <td>{s.category}</td>
                <td>
                  <button className="btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
