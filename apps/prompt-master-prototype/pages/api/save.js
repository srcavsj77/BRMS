import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
  const { md } = req.body || {}
  if (typeof md !== 'string') return res.status(400).send('md must be string')
  try {
    const mdPath = path.resolve(process.cwd(), '../../docs/DOCUMENTO_TECNICO_FUNCIONAL_PROMPT_MASTER.md')
    fs.writeFileSync(mdPath, md, 'utf8')
    return res.status(200).send('ok')
  } catch (err) {
    return res.status(500).send('fail: ' + err.message)
  }
}
