import { useState } from 'react';

export default function PackagingPresets({ presets, onSave }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', boxCost: '', fillerCost: '', tapeCost: '', insertCost: '' });

  function resetForm() {
    setForm({ name: '', boxCost: '', fillerCost: '', tapeCost: '', insertCost: '' });
    setEditId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return;
    const entry = {
      id: editId || crypto.randomUUID(),
      name: form.name,
      boxCost: parseFloat(form.boxCost) || 0,
      fillerCost: parseFloat(form.fillerCost) || 0,
      tapeCost: parseFloat(form.tapeCost) || 0,
      insertCost: parseFloat(form.insertCost) || 0,
    };
    if (editId) {
      onSave(presets.map((p) => (p.id === editId ? entry : p)));
    } else {
      onSave([...presets, entry]);
    }
    resetForm();
  }

  function handleEdit(p) {
    setEditId(p.id);
    setForm({
      name: p.name,
      boxCost: String(p.boxCost),
      fillerCost: String(p.fillerCost),
      tapeCost: String(p.tapeCost),
      insertCost: String(p.insertCost),
    });
  }

  function handleDelete(id) {
    onSave(presets.filter((p) => p.id !== id));
  }

  function totalCost(p) {
    return (p.boxCost + p.fillerCost + p.tapeCost + p.insertCost).toFixed(2);
  }

  return (
    <div className="panel">
      <h2>Packaging Presets</h2>
      <form onSubmit={handleSubmit} className="form-row">
        <input placeholder="Preset Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Box (€)" type="number" step="0.01" min="0" value={form.boxCost} onChange={(e) => setForm({ ...form, boxCost: e.target.value })} />
        <input placeholder="Filler (€)" type="number" step="0.01" min="0" value={form.fillerCost} onChange={(e) => setForm({ ...form, fillerCost: e.target.value })} />
        <input placeholder="Tape (€)" type="number" step="0.01" min="0" value={form.tapeCost} onChange={(e) => setForm({ ...form, tapeCost: e.target.value })} />
        <input placeholder="Inserts (€)" type="number" step="0.01" min="0" value={form.insertCost} onChange={(e) => setForm({ ...form, insertCost: e.target.value })} />
        <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Preset'}</button>
        {editId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
      </form>

      {presets.length === 0 ? (
        <p className="empty">No packaging presets yet.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Name</th><th>Box (€)</th><th>Filler (€)</th><th>Tape (€)</th><th>Inserts (€)</th><th>Total (€)</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {presets.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.boxCost.toFixed(2)}</td>
                <td>{p.fillerCost.toFixed(2)}</td>
                <td>{p.tapeCost.toFixed(2)}</td>
                <td>{p.insertCost.toFixed(2)}</td>
                <td><strong>{totalCost(p)}</strong></td>
                <td>
                  <button className="btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
