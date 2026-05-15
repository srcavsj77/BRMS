Prototype: PROMPT MASTER — visualizador e exportador

Pré-requisitos
- Node.js 18+
- npm

Instalação e execução (no diretório `apps/prompt-master-prototype`):

```bash
npm install
npm run dev
```

A aplicação roda em `http://localhost:3001` por padrão.

Funcionalidades:
- Carrega o Markdown gerado em `/docs/DOCUMENTO_TECNICO_FUNCIONAL_PROMPT_MASTER.md` via API.
- Visualiza o documento em tela (render Markdown).
- Botões: Download MD, Download DOCX (gera .docx client-side), Imprimir/PDF (via print dialog).
 - Botões: Download MD, Exportar DOCX/PDF (server-side via Pandoc quando disponível), Imprimir/PDF (via print dialog).

Observações:
- Para gerar DOCX o browser fará conversão client-side; large documentos podem consumir memória.
- Para exportar PDF com qualidade, use a opção de impressão do navegador ou instale um engine no servidor e adapte a API.
 - Para exportação server-side (DOCX/PDF) instale `pandoc` no servidor e reinicie a aplicação. O endpoint `/api/export` usará `pandoc` para gerar o artefato.
