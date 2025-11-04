import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../auth'

export default function Requests({ onDataChange = () => {} }) {
  const [items, setItems] = useState([])
  const [books, setBooks] = useState([])
  const [notes, setNotes] = useState('')
  const [book, setBook] = useState('')
  const { role, token } = useAuth()

  const load = async () => {
    try {
      const [{ data: reqs }, { data: booksData }] = await Promise.all([
        axios.get('/api/requests'),
        axios.get('/api/books')
      ])
      setItems(reqs)
      setBooks(booksData)
    } catch (e) {
      console.error('Requests load failed:', e?.response?.data || e.message)
    }
  }

  // Load only after token is ready
  useEffect(() => { if (token) load() }, [token])

  // 🔁 Admin: poll every 4s for new requests from students
  useEffect(() => {
    if (!token || role !== 'admin') return;
    const id = setInterval(load, 4000)
    return () => clearInterval(id)
  }, [token, role])

  const submit = async (e) => {
    e.preventDefault()
    await axios.post('/api/requests', { book, notes })
    setBook(''); setNotes('')
    await load()
    onDataChange() // refresh KPI "Pending Requests"
  }

  const decide = async (id, status) => {
    await axios.post('/api/requests/'+id+'/decide', { status })
    await load()
    onDataChange()
  }

  const cancel = async (id) => {
    await axios.post('/api/requests/'+id+'/cancel')
    await load()
    onDataChange()
  }

  return (
    <div>
      <h2>Issue Requests</h2>
      {role === 'student' && (
        <form onSubmit={submit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 120px', gap:8, alignItems:'end', marginBottom:12 }}>
          <select value={book} onChange={e=>setBook(e.target.value)}>
            <option value="">Select book</option>
            {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
          </select>
          <input placeholder="Notes (optional)" value={notes} onChange={e=>setNotes(e.target.value)} />
          <button>Request</button>
        </form>
      )}

      <table border="1" cellPadding="6" style={{ borderCollapse:'collapse', width:'100%' }}>
        <thead><tr><th>Book</th><th>Member</th><th>Status</th><th>Requested</th><th>Decided</th><th>Action</th></tr></thead>
        <tbody>
          {items.map(r => (
            <tr key={r._id}>
              <td>{r.book?.title}</td>
              <td>{r.member?.name || r.member?.email}</td>
              <td>{r.status}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>{r.decidedAt ? new Date(r.decidedAt).toLocaleString() : '-'}</td>
              <td>
                {role === 'admin' && r.status==='pending' && (
                  <>
                    <button onClick={()=>decide(r._id,'approved')}>Approve</button>{' '}
                    <button onClick={()=>decide(r._id,'rejected')}>Reject</button>
                  </>
                )}
                {role === 'student' && r.status==='pending' && (
                  <button onClick={()=>cancel(r._id)}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
