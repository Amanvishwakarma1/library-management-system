import React from 'react'
export default function KPI({ label, value }) {
  return (
    <div style={{ padding:16, border:'1px solid #eee', borderRadius:12 }}>
      <div style={{ fontSize:12, color:'#666' }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700 }}>{value}</div>
    </div>
  )
}
