import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const resp = await fetch('http://localhost:3001/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await resp.text()
    return new NextResponse(text, { status: resp.status })
  } catch (err: any) {
    return new NextResponse('Proxy error: ' + (err.message || String(err)), { status: 500 })
  }
}
