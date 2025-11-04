import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../auth'

export default function Movies({ onDataChange = () => {} }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title:'', director:'', upc:'', copiesTotal:1 })
  const { role } = useAuth()

  const load = async () => {
    const { data } = await axios.get('/api/movies')
    setItems(data)
  }
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    const payload = { ...form, copiesAvailable: form.copiesTotal }
    await axios.post('/api/movies', payload)
    setForm({ title:'', director:'', upc:'', copiesTotal:1 })
    await load()
    onDataChange()
  }

  const remove = async (id) => {
    await axios.delete('/api/movies/'+id)
    await load()
    onDataChange()
  }

  return (
    <div>
      <h2>Master List of Movies</h2>
      {role==='admin' && (
        <form onSubmit={add} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 120px 120px', gap:8, alignItems:'end', marginBottom:12 }}>
          <input placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))}/>
          <input placeholder="Director" value={form.director} onChange={e=>setForm(f=>({...f, director:e.target.value}))}/>
          <input placeholder="UPC" value={form.upc} onChange={e=>setForm(f=>({...f, upc:e.target.value}))}/>
          <input type="number" min="1" placeholder="Copies" value={form.copiesTotal} onChange={e=>setForm(f=>({...f, copiesTotal:Number(e.target.value)}))}/>
          <button>Add Movie</button>
        </form>
      )}
      <table border="1" cellPadding="6" style={{ borderCollapse:'collapse', width:'100%' }}>
        <thead><tr><th>Title</th><th>Director</th><th>UPC</th><th>Total</th><th>Available</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(m => (
            <tr key={m._id}>
              <td>{m.title}</td><td>{m.director}</td><td>{m.upc}</td>
              <td>{m.copiesTotal}</td><td>{m.copiesAvailable}</td>
              <td>{role==='admin' && <button onClick={()=>remove(m._id)}>Delete</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
