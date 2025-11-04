import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../auth'

export default function Books({ onDataChange = () => {} }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title:'', author:'', isbn:'', copiesTotal:1 })
  const { role, token } = useAuth()        // ⬅️ get token

  const load = async () => {
    try {
      const { data } = await axios.get('/api/books')
      setItems(data)
    } catch (e) {
      console.error('Books load failed:', e?.response?.data || e.message)
    }
  }

  // ⬅️ ensure books load after token exists (fixes empty lists on refresh)
  useEffect(() => { if (token) load() }, [token])

  const add = async (e) => {
    e.preventDefault()
    const payload = { ...form, copiesAvailable: form.copiesTotal }
    await axios.post('/api/books', payload)
    setForm({ title:'', author:'', isbn:'', copiesTotal:1 })
    await load()
    onDataChange()
  }

  const remove = async (id) => {
    await axios.delete('/api/books/' + id)
    await load()
    onDataChange()
  }

  // ...render unchanged...
}
