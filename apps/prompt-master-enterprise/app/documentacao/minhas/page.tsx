export const metadata = { title: 'Minhas Solicitações' }

export default function Page(){
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Minhas Solicitações</h1>
      <div className="bg-white rounded border p-4">
        <p className="text-sm text-slate-500">Lista de solicitações — placeholder.</p>
        <ul className="mt-3 space-y-2">
          <li className="p-2 border rounded">SOL-001 — Projeto de Regra — rascunho</li>
          <li className="p-2 border rounded">SOL-002 — Integração X — em revisão</li>
        </ul>
      </div>
    </main>
  )
}
