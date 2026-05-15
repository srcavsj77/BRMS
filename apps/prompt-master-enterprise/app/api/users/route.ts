import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DB = path.resolve(process.cwd(), 'data', 'users.json')

function readDB(){
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')) } catch { return [] }
}
function writeDB(data:any){ fs.writeFileSync(DB, JSON.stringify(data, null, 2)) }

export async function GET(req: Request){
  const all = readDB()
  return NextResponse.json(all)
}

export async function POST(req: Request){
  const body = await req.json()
  const all = readDB()
  const id = String(Date.now())
  const user = { id, name: body.name||'Sem nome', email: body.email||'', role: body.role||'user', createdAt: new Date().toISOString() }
  all.unshift(user)
  writeDB(all)
  return NextResponse.json(user)
}

export async function PUT(req: Request){
  const body = await req.json()
  const all = readDB()
  const idx = all.findIndex((u:any)=>u.id===body.id)
  if(idx===-1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  all[idx] = { ...all[idx], ...body }
  writeDB(all)
  return NextResponse.json(all[idx])
}

export async function DELETE(req: Request){
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if(!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const all = readDB()
  const next = all.filter((u:any)=>u.id!==id)
  writeDB(next)
  return NextResponse.json({ ok: true })
}
