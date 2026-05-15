import './globals.css'
import { ReactNode } from 'react'
import Sidebar from '../components/ui/Sidebar'
import Header from '../components/ui/Header'

export const metadata = {
  title: 'PROMPT MASTER — Enterprise Prototype',
  description: 'Protótipo Frontend Enterprise para geração de documentação técnica',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
        <div className="min-h-screen flex">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
