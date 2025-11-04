import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth';

export default function Members({ onDataChange = () => {} }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const [months, setMonths] = useState(6);
  const { token } = useAuth();

  const load = async () => {
    const { data } = await axios.get('/api/members');
    setItems(data);
  };

  // ✅ wait for token before the first load (fixes empty table after login)
  useEffect(() => { if (token) load(); }, [token]);

  const add = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return alert('Name and Email are required');
    await axios.post('/api/members', form);
    setForm({ name: '', email: '' });
    await load(); onDataChange();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    await axios.delete('/api/members/' + id);
    await load(); onDataChange();
  };

  const extend = async (id) => {
    await axios.post('/api/members/' + id + '/membership', { months });
    await load(); onDataChange();
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel membership now?')) return;
    await axios.post('/api/members/' + id + '/membership', { action: 'cancel' });
    await load(); onDataChange();
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '-');

  return (
    <div>
      <h2 style={styles.h2}>User Management (Members)</h2>

      <form onSubmit={add} style={styles.grid3}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          style={styles.input}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          style={styles.input}
        />
        <button style={styles.btnPrimary}>Add Member</button>
      </form>

      <div style={{ margin: '10px 0 14px' }}>
        <span style={{ marginRight: 8, fontWeight: 500 }}>Membership action months:</span>
        <select
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          style={styles.select}
        >
          <option value={6}>6 months (default)</option>
          <option value={12}>12 months</option>
          <option value={24}>24 months</option>
        </select>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Start</th>
              <th>End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{fmt(m.joinedAt)}</td>
                <td>{fmt(m.membershipStart)}</td>
                <td>{fmt(m.membershipEnd)}</td>
                <td>
                  <button style={styles.btnSoft} onClick={() => extend(m._id)}>Extend</button>{' '}
                  <button style={styles.btnWarn} onClick={() => cancel(m._id)}>Cancel</button>{' '}
                  <button style={styles.btnDanger} onClick={() => remove(m._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#666', padding: 16 }}>
                  No members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  h2: { marginTop: 0, fontSize: 28 },
  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 140px',
    gap: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    outline: 'none',
    background: '#fff',
  },
  select: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#fff',
  },
  btnPrimary: {
    background: '#1e40af',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 12px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  btnSoft: {
    background: '#e0e7ff',
    color: '#1e3a8a',
    border: 'none',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnWarn: {
    background: '#fde68a',
    color: '#92400e',
    border: 'none',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnDanger: {
    background: '#fecaca',
    color: '#7f1d1d',
    border: 'none',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  tableWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
  },
};
