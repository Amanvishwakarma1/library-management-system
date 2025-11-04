import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../auth'   // ✅ added this import

export default function Loans({ onDataChange = () => {} }) {
  const [loans, setLoans] = useState([])
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [form, setForm] = useState({ book:'', member:'', days:15 })
  const { token } = useAuth()       // ✅ added this line

  const load = async () => {
    const [b, m, l] = await Promise.all([
      axios.get('/api/books'),
      axios.get('/api/members'),
      axios.get('/api/loans')
    ])
    setBooks(b.data); setMembers(m.data); setLoans(l.data)
  }

  // ✅ changed — wait until token exists before loading data
  useEffect(() => { if (token) load() }, [token])

  const duePreview = useMemo(() => {
    const d = Number(form.days || 15)
    const days = Math.max(1, Math.min(15, d))
    const dt = new Date(Date.now() + days*24*60*60*1000)
    return dt.toLocaleDateString()
  }, [form.days])

  const createLoan = async (e) => {
    e.preventDefault()
    if (!form.book)  return alert('Select a book')
    if (!form.member) return alert('Select a member')
    const d = Number(form.days || 15)
    if (d < 1 || d > 15) return alert('Days must be between 1 and 15')

    await axios.post('/api/loans', { ...form, days: Math.min(15, Math.max(1, d)) })
    setForm({ book:'', member:'', days:15 })
    await load(); onDataChange()
  }


  return (
    <div>
      <h2>Active Issues</h2>

      <form onSubmit={createLoan} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 120px 200px', gap:8, alignItems:'end', marginBottom:12 }}>
        <select value={form.book} onChange={e=>setForm(f=>({...f, book:e.target.value}))}>
          <option value="">Select book</option>
          {books.map(b => <option key={b._id} value={b._id}>{b.title} ({b.copiesAvailable}/{b.copiesTotal})</option>)}
        </select>

        <select value={form.member} onChange={e=>setForm(f=>({...f, member:e.target.value}))}>
          <option value="">Select member</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>

        <input type="number" min="1" max="15" value={form.days} onChange={e=>setForm(f=>({...f, days:Number(e.target.value)}))}/>
        <div style={{ fontSize:12, color:'#555' }}>Due date: <b>{duePreview}</b></div>

        <button style={{ gridColumn:'span 4' }}>Create Loan</button>
      </form>

      <table border="1" cellPadding="6" style={{ borderCollapse:'collapse', width:'100%' }}>
        <thead><tr><th>Book</th><th>Member</th><th>Loaned</th><th>Due</th><th>Returned</th><th>Fine</th><th>Action</th></tr></thead>
        <tbody>
          {loans.map(l => {
            const overdue = !l.returnedAt && new Date(l.dueAt) < new Date()
            return (
              <tr key={l._id} style={{ background: overdue ? '#fff2f2' : undefined }}>
                <td>{l.book?.title}</td>
                <td>{l.member?.name}</td>
                <td>{new Date(l.loanedAt).toLocaleDateString()}</td>
                <td>{new Date(l.dueAt).toLocaleDateString()}</td>
                <td>{l.returnedAt ? new Date(l.returnedAt).toLocaleDateString() : '-'}</td>
                <td>{l.fineAmount ? `${l.fineAmount}${l.finePaid ? ' (paid)' : ' (due)'}` : '-'}</td>
                <td>
                  {!l.returnedAt && <button onClick={()=>returnLoan(l._id)}>Mark Returned</button>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
