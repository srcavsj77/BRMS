"use client"
import React from 'react'

export default function UsersManager(){
  const [items, setItems] = React.useState<any[]>([])
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')

  React.useEffect(()=>{ fetch('/api/users').then(r=>r.json()).then(d=>setItems(d)) },[])

  async function create(){
    const resp = await fetch('/api/users',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email }) })
    const u = await resp.json()
    setItems(it=>[u,...it])
    setName(''); setEmail('')
  }

  async function remove(id:string){
    await fetch(`/api/users?id=${id}`,{ method:'DELETE' })
    setItems(it=>it.filter(x=>x.id!==id))
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input placeholder="Nome" className="p-2 border rounded" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" className="p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} />
        <button onClick={create} className="px-3 py-1 bg-indigo-600 text-white rounded">Criar</button>
      </div>
      <ul className="space-y-2">
        {items.map(u=> (
          <li key={u.id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{u.name}</div>
              <div className="text-xs text-slate-500">{u.email}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>remove(u.id)} className="px-2 py-1 border rounded text-red-600">Remover</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
