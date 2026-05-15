export const metadata = { title: 'Usuários' }

import UsersManager from '../../../components/users/UsersManager'

export default function Page(){
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Usuários</h1>
      <div className="bg-white rounded border p-4">
        <UsersManager />
      </div>
    </main>
  )
}
