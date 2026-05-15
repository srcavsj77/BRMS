import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    const mdPath = path.resolve(process.cwd(), '../../docs/DOCUMENTO_TECNICO_FUNCIONAL_PROMPT_MASTER.md')
    if (!fs.existsSync(mdPath)) return res.status(404).json({ error: 'Documento não encontrado' })
    const content = fs.readFileSync(mdPath, 'utf8')
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.status(200).send(content)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
