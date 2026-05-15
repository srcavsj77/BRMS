import React from 'react'

export default function Header(){
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
        <button className="p-2 text-xl">☰</button>
        <div className="text-lg font-semibold">DocTech</div>
        <nav className="text-sm text-slate-600 dark:text-slate-300 ml-4">Nova Documentação Técnica</nav>
      </div>
      <div className="flex items-center gap-4">
        <input aria-label="Busca global" placeholder="Buscar..." className="px-3 py-1 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"/>
        <button className="px-3 py-1 rounded bg-white dark:bg-slate-700 border">🔔</button>
        <button className="px-3 py-1 rounded bg-white dark:bg-slate-700 border">❓</button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden></div>
          <div className="text-sm">João Silva</div>
        </div>
      </div>
    </header>
  )
}
