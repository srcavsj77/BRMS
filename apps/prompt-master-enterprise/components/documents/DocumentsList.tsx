"use client"
import React from 'react'

export default function DocumentsList(){
  const [items, setItems] = React.useState<any[]>([])
  const [page, setPage] = React.useState(1)
  const [per] = React.useState(5)
  const [total, setTotal] = React.useState(0)

  React.useEffect(()=>{ fetch(`/api/documents?page=${page}&per=${per}`).then(r=>r.json()).then(d=>{ setItems(d.items); setTotal(d.total) }) },[page,per])

  async function createSample(){
    const title = `Documento ${new Date().toLocaleString()}`
    const md = `# ${title}\n\nCriado via UI`;
    await fetch('/api/documents',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, md }) })
    setPage(1)
    const d = await fetch(`/api/documents?page=1&per=${per}`).then(r=>r.json())
    setItems(d.items); setTotal(d.total)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-slate-500">Total: {total}</div>
        <div className="flex gap-2">
          <button onClick={createSample} className="px-3 py-1 bg-indigo-600 text-white rounded">Criar Documento</button>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map(i=> (
          <li key={i.id} className="p-3 border rounded flex justify-between items-start">
            <div>
              <div className="font-semibold">{i.title}</div>
              <div className="text-xs text-slate-500">{new Date(i.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-sm text-indigo-600">Visualizar</div>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center mt-4">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-2 py-1 border rounded">Anterior</button>
        <div className="text-sm">Página {page}</div>
        <button onClick={()=>setPage(p=>p+1)} className="px-2 py-1 border rounded">Próxima</button>
      </div>
    </div>
  )
}
