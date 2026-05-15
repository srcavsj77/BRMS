"use client"
import Link from 'next/link'
import {useState} from 'react'

export default function Sidebar(){
  const [collapsed, setCollapsed] = useState(false)
  return (
    <aside className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all ${collapsed? 'w-20':'w-72'} flex flex-col` }>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold">DT</div>
          <div className="font-semibold">DocTech</div>
        </div>
        <button aria-label="Toggle sidebar" className="text-sm text-slate-300" onClick={()=>setCollapsed(!collapsed)}>{collapsed? '›':'‹'}</button>
      </div>
      <nav className="flex-1 overflow-auto px-2 py-4">
        <div className="mb-4">
          <h6 className="px-3 text-xs text-slate-400">DASHBOARD</h6>
          <ul className="mt-2">
            <li><Link className="block px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700" href="/">Dashboard</Link></li>
          </ul>
        </div>
        <div className="mb-4">
          <h6 className="px-3 text-xs text-slate-400">DOCUMENTAÇÃO</h6>
          <ul className="mt-2">
            <li><Link className="block px-3 py-2 rounded hover:bg-slate-700" href="/documentacao/nova">Nova Solicitação</Link></li>
            <li><Link className="block px-3 py-2 rounded hover:bg-slate-700" href="/documentacao/minhas">Minhas Solicitações</Link></li>
            <li><Link className="block px-3 py-2 rounded hover:bg-slate-700" href="/documentacao">Documentações</Link></li>
          </ul>
        </div>
        <div className="mb-4">
          <h6 className="px-3 text-xs text-slate-400">ARQUITETURA</h6>
          <ul className="mt-2">
            <li><Link className="block px-3 py-2 rounded hover:bg-slate-700" href="/arquitetura/diagramas">Diagramas</Link></li>
            <li><Link className="block px-3 py-2 rounded hover:bg-slate-700" href="/arquitetura/componentes">Componentes</Link></li>
          </ul>
        </div>
        <div className="mb-4">
          <h6 className="px-3 text-xs text-slate-400">ADMINISTRAÇÃO</h6>
          <ul className="mt-2">
            <li><Link className="block px-3 py-2 rounded hover:bg-slate-700" href="/admin/usuarios">Usuários</Link></li>
            <li><Link className="block px-3 py-2 rounded hover:bg-slate-700" href="/admin/config">Configurações</Link></li>
          </ul>
        </div>
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-300">v0.1 Prototype</div>
      </div>
    </aside>
  )
}
