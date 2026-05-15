import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useCallback } from 'react'
import Head from 'next/head'

export default function Home() {
  const [md, setMd] = useState('Carregando...')
  const [title, setTitle] = useState('PROMPT MASTER — Documento')
  const [author, setAuthor] = useState('Escritório de Arquitetura')
  const [version, setVersion] = useState('1.1')
  const [loadingExport, setLoadingExport] = useState(false)
  const [themeDark, setThemeDark] = useState(false)
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState(null) // {name, role}
  const contentRef = useRef(null)

  useEffect(() => {
    fetch('/api/doc')
      .then(r => r.text())
      .then(t => setMd(t))
      .catch(() => setMd('# Erro ao carregar documento'))
  }, [])

  useEffect(() => {
    document.documentElement.className = themeDark ? 'dark' : ''
  }, [themeDark])

  function downloadMD() {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'DOCUMENTO_TECNICO_FUNCIONAL_PROMPT_MASTER.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function exportServer(format) {
    try {
      setLoadingExport(true)
      const payload = { md, metadata: { title, author, version }, format }
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const txt = await res.text()
        alert('Erro ao exportar: ' + txt)
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get('content-disposition') || ''
      const match = /filename="?([^";]+)"?/.exec(disposition)
      const filename = match ? match[1] : `document.${format}`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Erro: ' + err.message)
    } finally {
      setLoadingExport(false)
    }
  }

  function printPDF() {
    window.print()
  }

  const saveToServer = useCallback(async () => {
    try {
      const res = await fetch('/api/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ md })
      })
      if (!res.ok) throw new Error(await res.text())
      alert('Documento salvo com sucesso')
      setEditing(false)
    } catch (e) { alert('Erro ao salvar: ' + e.message) }
  }, [md])

  return (
    <div className="container">
      <Head>
        <title>PROMPT MASTER — Visualizador</title>
      </Head>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo-placeholder.svg" alt="logo" style={{ width: 56, height: 56 }} />
          <div>
            <h1 style={{ margin: 0 }}>PROMPT MASTER</h1>
            <div className="muted">Plataforma de documentação técnica</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="toolbar">
            <button className="btn" onClick={downloadMD}>Download MD</button>
            <button className="btn" onClick={() => exportServer('docx')} disabled={loadingExport || !user}>{loadingExport ? 'Exportando...' : 'Exportar DOCX'}</button>
            <button className="btn" onClick={() => exportServer('pdf')} disabled={loadingExport || !user}>{loadingExport ? 'Exportando...' : 'Exportar PDF'}</button>
            <button className="btn" onClick={printPDF}>Imprimir</button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn" onClick={() => setThemeDark(d => !d)}>{themeDark ? 'Claro' : 'Escuro'}</button>
            {user ? (
              <div className="muted">{user.name} • {user.role}</div>
            ) : (
              <button className="btn" onClick={() => {
                const name = prompt('Nome do usuário (mock)') || 'Usuario'
                const role = prompt('Papel (Analista/Arquiteto/Desenvolvedor/QA/Admin)') || 'Analista'
                setUser({ name, role })
              }}>Login mock</button>
            )}
          </div>
        </div>
      </header>

      <section style={{ marginTop: 16 }} className="layout">
        <aside className="aside">
          <h3>Metadados</h3>
          <label>Título</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
          <label>Autor</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
          <label>Versão</label>
          <input value={version} onChange={e => setVersion(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
          <hr />
          <h4>Editor</h4>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="btn" onClick={() => setEditing(e => !e)}>{editing ? 'Visualizar' : 'Editar'}</button>
            <button className="btn" onClick={saveToServer} disabled={!editing}>Salvar no servidor</button>
          </div>
          <div className="muted">Observação: exportação server-side requer Pandoc instalado no servidor.</div>
        </aside>

        <main style={{ flex: 1 }}>
          {editing ? (
            <textarea className="editor" value={md} onChange={e => setMd(e.target.value)} />
          ) : (
            <div ref={contentRef}>
              <ReactMarkdown>{md}</ReactMarkdown>
            </div>
          )}
        </main>
      </section>
    </div>
  )
}
