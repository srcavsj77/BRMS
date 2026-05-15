import Wizard from '../../../components/wizard/Wizard'

export const metadata = {
  title: 'Nova Solicitação'
}

export default function Page(){
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Nova Solicitação</h1>
      <div className="max-w-3xl">
        <Wizard />
      </div>
    </main>
  )
}
