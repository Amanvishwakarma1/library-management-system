import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './auth';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const [b, l, r] = await Promise.all([
      axios.get('/api/books'),
      axios.get('/api/loans'),
      axios.get('/api/requests'),
    ]);
    setBooks(b.data);
    setLoans(l.data);
    setRequests(r.data);
  };

  useEffect(() => { load(); }, []);

  const requestBook = async (bookId) => {
    await axios.post('/api/requests', { book: bookId });
    alert('Request sent!');
    await load();
  };

  return (
    <div
      style={{
        fontFamily: 'Poppins, system-ui',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ecfccb 0%, #a7f3d0 100%)',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #059669, #10b981)',
          color: 'white',
          padding: '18px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26 }}>🎓 Student Dashboard</h1>
        <div>
          <span style={{ marginRight: 18, fontSize: 15 }}>Hi, <b>{user?.name || 'Student'}</b></span>
          <button
            onClick={logout}
            style={{
              background: 'white',
              color: '#047857',
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

      <div style={{ padding: '32px 48px', display: 'grid', gap: 28 }}>
        <DashboardCard title="Available Books">
          <BookTable books={books} requestBook={requestBook} />
        </DashboardCard>

        <DashboardCard title="My Active Loans">
          <LoanTable loans={loans} />
        </DashboardCard>

        <DashboardCard title="My Requests">
          <RequestTable requests={requests} />
        </DashboardCard>
      </div>
    </div>
  );
}

/* --- Subcomponents --- */
function DashboardCard({ title, children }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 18,
        padding: 28,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <h2 style={{ marginTop: 0, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>{title}</h2>
      {children}
    </div>
  );
}

function BookTable({ books, requestBook }) {
  return (
    <table border="0" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
          <th>Title</th><th>Author</th><th>Available</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        {books.map((b) => (
          <tr key={b._id} style={{ borderBottom: '1px solid #eee' }}>
            <td>{b.title}</td>
            <td>{b.author}</td>
            <td>{b.copiesAvailable}</td>
            <td>
              {b.copiesAvailable > 0 ? (
                <button style={buttonStyle('#059669')} onClick={() => requestBook(b._id)}>Request</button>
              ) : (
                <span style={{ color: '#999' }}>Unavailable</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LoanTable({ loans }) {
  return (
    <table border="0" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
          <th>Book</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th>Fine</th>
        </tr>
      </thead>
      <tbody>
        {loans.map((l) => {
          const overdue = !l.returnedAt && new Date(l.dueAt) < new Date();
          const color = overdue ? '#fee2e2' : l.returnedAt ? '#dcfce7' : '';
          return (
            <tr key={l._id} style={{ background: color, borderBottom: '1px solid #eee' }}>
              <td>{l.book?.title}</td>
              <td>{new Date(l.loanedAt).toLocaleDateString()}</td>
              <td>{new Date(l.dueAt).toLocaleDateString()}</td>
              <td>{l.returnedAt ? 'Returned' : overdue ? 'Overdue' : 'Active'}</td>
              <td>{l.fineAmount ? `${l.fineAmount}${l.finePaid ? ' (Paid)' : ' (Due)'}` : '-'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function RequestTable({ requests }) {
  return (
    <table border="0" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
          <th>Book</th><th>Status</th><th>Requested</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r) => (
          <tr key={r._id} style={{ borderBottom: '1px solid #eee' }}>
            <td>{r.book?.title}</td>
            <td>{r.status}</td>
            <td>{new Date(r.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const buttonStyle = (color) => ({
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: 6,
  padding: '5px 12px',
  cursor: 'pointer',
  fontWeight: 500,
  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
  transition: 'transform 0.2s',
});
