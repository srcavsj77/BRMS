"use client"
import React from 'react'

export const metadata = { title: 'Diagramas' }

export default function Page(){
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Diagramas</h1>
      <div className="bg-white rounded border p-4">
        <DiagramsViewer />
      </div>
    </main>
  )
}

import DiagramsViewer from '../../components/diagrams/DiagramsViewer'
