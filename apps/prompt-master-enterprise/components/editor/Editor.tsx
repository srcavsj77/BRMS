import React from 'react'

export default function Editor(){
  return (
    <div className="bg-white dark:bg-slate-800 rounded border p-4">
      <div className="mb-2 text-sm text-slate-500">Editor Técnico</div>
      <textarea className="w-full min-h-[240px] p-3 border rounded bg-slate-50 dark:bg-slate-900" aria-label="Editor técnico" defaultValue={"# Documento\n\nComece aqui..."}></textarea>
    </div>
  )
}
