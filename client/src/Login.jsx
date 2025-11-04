import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // 'admin' or 'student'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-fill admin credentials
  const handleAdminClick = () => {
    setRole('admin');
    setEmail('admin@example.com');
    setPassword('Admin@123');
    setError('');
  };

  // Auto-fill student credentials
  const handleStudentClick = () => {
    setRole('student');
    setEmail('aman@student.com');
    setPassword('Student@123');
    setError('');
  };

  // Submit login form (sanitize inputs)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailClean = (email || '').trim().toLowerCase();
    const passwordClean = (password || '').trim();

    if (!emailClean || !passwordClean) {
      setError('Please fill all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { data } = await axios.post('/api/auth/login', {
        email: emailClean,
        password: passwordClean,
      });

      // Persist session in your auth context
      login(data);

      // Optional: make axios send the token on subsequent requests automatically
      if (data?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }

      navigate(data.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: 'system-ui',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f5f7fa',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: 30,
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          width: 340,
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Library Login</h2>

        {/* Quick login buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            type="button"
            onClick={handleAdminClick}
            style={{
              background: role === 'admin' ? '#2563eb' : '#e5e7eb',
              color: role === 'admin' ? 'white' : 'black',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            Admin Login
          </button>

          <button
            type="button"
            onClick={handleStudentClick}
            style={{
              background: role === 'student' ? '#2563eb' : '#e5e7eb',
              color: role === 'student' ? 'white' : 'black',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            Student Login
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 10,
              borderRadius: 6,
              border: 'none',
              background: '#2563eb',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {error && <p style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</p>}

        {role && (
          <p style={{ fontSize: 13, color: '#555', textAlign: 'center', marginTop: 8 }}>
            Using default credentials for <strong>{role}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
