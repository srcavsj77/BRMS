import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DB = path.resolve(process.cwd(), 'data', 'documents.json')

function readDB(){
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')) } catch { return [] }
}
function writeDB(data:any){ fs.writeFileSync(DB, JSON.stringify(data, null, 2)) }

export async function GET(req: Request){
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page')||'1',10)
  const per = parseInt(url.searchParams.get('per')||'10',10)
  const all = readDB()
  const start = (page-1)*per
  const items = all.slice(start, start+per)
  return NextResponse.json({ items, total: all.length, page, per })
}

export async function POST(req: Request){
  const body = await req.json()
  const all = readDB()
  const id = String(Date.now())
  const item = { id, title: body.title||(`Documento ${id}`), md: body.md||'', createdAt: new Date().toISOString() }
  all.unshift(item)
  writeDB(all)
  return NextResponse.json(item)
}
