import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';
import Books from './components/Books.jsx';
import Members from './components/Members.jsx';
import Loans from './components/Loans.jsx';
import Requests from './components/Requests.jsx';
import Movies from './components/Movies.jsx';
import axios from 'axios';

export default function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState({ books: 0, members: 0, activeLoans: 0, overdueLoans: 0, pendingReq: 0 });

  const refreshStats = async () => {
    const { data } = await axios.get('/api/stats/admin');
    setStats(data);
  };

  useEffect(() => { if (token) refreshStats(); }, [token]);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(refreshStats, 5000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <div
      style={{
        fontFamily: 'Poppins, system-ui',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #eef2ff 100%)',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          color: 'white',
          padding: '18px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26 }}>📚 Library Admin Dashboard</h1>
        <div>
          <span style={{ marginRight: 18, fontSize: 15 }}>Hi, <b>{user?.name || 'Admin'}</b></span>
          <button
            onClick={logout}
            style={{
              background: 'white',
              color: '#1e3a8a',
              border: 'none',
              padding: '7px 14px',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* KPI Section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          padding: '32px 48px',
        }}
      >
        {[
          { label: 'Total Books', value: stats.books, color: '#2563eb' },
          { label: 'Members', value: stats.members, color: '#10b981' },
          { label: 'Active Issues', value: stats.activeLoans, color: '#f59e0b' },
          { label: 'Overdue Returns', value: stats.overdueLoans, color: '#ef4444' },
          { label: 'Pending Requests', value: stats.pendingReq, color: '#8b5cf6' },
        ].map((k, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: 14, color: '#555' }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </section>

      {/* Sections */}
      <section style={{ padding: '0 48px 48px', display: 'grid', gap: 32 }}>
        {[Books, Movies, Members, Loans, Requests].map((Component, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 18,
              padding: 28,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(12px)',
              transition: 'transform 0.25s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <Component onDataChange={refreshStats} />
          </div>
        ))}
      </section>
    </div>
  );
}
