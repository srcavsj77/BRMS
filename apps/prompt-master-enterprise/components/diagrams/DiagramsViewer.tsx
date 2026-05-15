"use client"
import React from 'react'

export default function DiagramsViewer(){
  const [items, setItems] = React.useState<any[]>([])
  React.useEffect(()=>{ fetch('/api/diagrams').then(r=>r.json()).then(d=>setItems(d)) },[])
  return (
    <div className="space-y-6">
      {items.map(it=> (
        <div key={it.id} className="border rounded p-4">
          <div className="font-semibold mb-2">{it.title}</div>
          <div className="overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: it.svg }} />
          </div>
        </div>
      ))}
    </div>
  )
}
