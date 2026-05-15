import React from 'react'

export default function Dashboard(){
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded border"> <h3 className="text-sm text-slate-400">Documentos Gerados</h3><div className="text-2xl font-semibold">128</div></div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded border"> <h3 className="text-sm text-slate-400">Solicitações Abertas</h3><div className="text-2xl font-semibold">12</div></div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded border"> <h3 className="text-sm text-slate-400">Aprovações Pendentes</h3><div className="text-2xl font-semibold">3</div></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded border h-64">Gráfico produtividade (stub)</div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded border h-64">Fluxo de aprovação (stub)</div>
      </div>
      <div className="p-4 bg-white dark:bg-slate-800 rounded border">Últimas documentações (tabela stub)</div>
    </div>
  )
}
