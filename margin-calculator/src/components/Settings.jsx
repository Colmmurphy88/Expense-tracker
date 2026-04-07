import { useState } from 'react';

export default function Settings({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings });

  function handleSave(e) {
    e.preventDefault();
    onSave({
      marginThreshold: parseFloat(form.marginThreshold),
      vatStandard: parseFloat(form.vatStandard),
      vatReduced: parseFloat(form.vatReduced),
    });
  }

  return (
    <div className="panel">
      <h2>Settings</h2>
      <form onSubmit={handleSave} className="settings-form">
        <label>
          <span>Margin Warning Threshold (%)</span>
          <input
            type="number"
            step="1"
            min="0"
            max="100"
            value={form.marginThreshold}
            onChange={(e) => setForm({ ...form, marginThreshold: e.target.value })}
          />
          <span className="hint">Orders below this margin will be flagged with a warning</span>
        </label>
        <label>
          <span>Standard VAT Rate (%)</span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.vatStandard}
            onChange={(e) => setForm({ ...form, vatStandard: e.target.value })}
          />
        </label>
        <label>
          <span>Reduced VAT Rate (%)</span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.vatReduced}
            onChange={(e) => setForm({ ...form, vatReduced: e.target.value })}
          />
        </label>
        <button type="submit" className="btn btn-primary">Save Settings</button>
      </form>
    </div>
  );
}
