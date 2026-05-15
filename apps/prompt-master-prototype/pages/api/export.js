import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'

export const config = {
  api: {
    bodyParser: true,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
  const { md, metadata, format } = req.body || {}
  if (!md) return res.status(400).send('Payload must include md')
  if (!format || (format !== 'docx' && format !== 'pdf')) return res.status(400).send('format must be "docx" or "pdf"')

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-export-'))
  const inPath = path.join(tmpDir, 'input.md')
  fs.writeFileSync(inPath, md, 'utf8')

  const outFile = format === 'docx' ? 'document.docx' : 'document.pdf'
  const outPath = path.join(tmpDir, outFile)

  // Verifica se pandoc está disponível
  const which = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['pandoc'])
  if (which.status !== 0) {
    cleanup(tmpDir)
    return res.status(404).send('Pandoc não encontrado no servidor. Instale Pandoc para habilitar exportação server-side.')
  }

  // Monta comando pandoc
  const args = ['-s', inPath, '-o', outPath]
  if (format === 'pdf') {
    // deixa o engine padrão; se pdflatex estiver presente, o Pandoc o usará
    // opcional: --pdf-engine=pdflatex
  }

  const proc = spawnSync('pandoc', args, { encoding: 'utf8' })
  if (proc.error || proc.status !== 0) {
    const err = proc.stderr || proc.error.message || 'Erro desconhecido ao executar pandoc'
    cleanup(tmpDir)
    return res.status(500).send('Erro ao gerar arquivo: ' + err)
  }

  // Stream do arquivo gerado
  try {
    const stat = fs.statSync(outPath)
    res.setHeader('Content-Length', String(stat.size))
    res.setHeader('Content-Type', format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${outFile}"`)
    const stream = fs.createReadStream(outPath)
    stream.pipe(res)
    stream.on('close', () => cleanup(tmpDir))
  } catch (err) {
    cleanup(tmpDir)
    return res.status(500).send('Falha ao ler arquivo gerado: ' + err.message)
  }
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch (e) {
    // ignore
  }
}
