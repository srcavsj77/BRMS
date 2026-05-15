import { NextResponse } from 'next/server'

const diagrams = [
  { id: '1', title: 'Arquitetura Geral', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260"><rect x="10" y="10" width="580" height="240" rx="8" fill="#0f172a"/><g fill="#fff" font-family="sans-serif"><text x="40" y="50" font-size="18">Arquitetura BRMS</text><rect x="40" y="70" width="160" height="50" rx="6" fill="#0b1220" stroke="#334155"/><text x="60" y="100" font-size="14">Frontend</text><rect x="220" y="70" width="160" height="50" rx="6" fill="#0b1220" stroke="#334155"/><text x="242" y="100" font-size="14">API Gateway</text><rect x="400" y="70" width="160" height="50" rx="6" fill="#0b1220" stroke="#334155"/><text x="420" y="100" font-size="14">Serviços</text></g></svg>` },
  { id: '2', title: 'Fluxo de Regras', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260"><rect x="0" y="0" width="600" height="260" fill="#f8fafc"/><g fill="#0f172a"><circle cx="120" cy="130" r="36" fill="#e2e8f0"/><text x="100" y="136">Entrada</text><circle cx="300" cy="130" r="36" fill="#e2e8f0"/><text x="280" y="136">Motor</text><circle cx="480" cy="130" r="36" fill="#e2e8f0"/><text x="460" y="136">Saída</text></g></svg>` }
]

export async function GET(){
  return NextResponse.json(diagrams)
}
