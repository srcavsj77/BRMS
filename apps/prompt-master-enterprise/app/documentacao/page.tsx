"use client"
import React from 'react'

export const metadata = { title: 'Documentações' }

import DocumentsList from '../../components/documents/DocumentsList'

export default function Page(){
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Documentações</h1>
      <div className="bg-white rounded border p-4">
        <DocumentsList />
      </div>
    </main>
  )
}
