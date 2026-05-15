Guia rápido: exportar PROMPT_MASTER_Documentacao_Tecnica.md

Pré-requisitos:
- Pandoc instalado (https://pandoc.org/)
- Para gerar PDF, instale um engine TeX (TeX Live / MiKTeX) ou wkhtmltopdf

Comandos (PowerShell):

# Executar script de exportação (recomendado)
.
```powershell
cd "c:\Users\carlos.junior\Documents\PROTOTIPO DE REGRAS\BRMS\scripts"
.
\export_doc.ps1
```

# Alternativa: gerar manualmente com Pandoc
```powershell
pandoc -s -o "docs\PROMPT_MASTER_Documentacao_Tecnica.docx" "docs\PROMPT_MASTER_Documentacao_Tecnica.md"
# Para PDF (requer engine):
pandoc -s -o "docs\PROMPT_MASTER_Documentacao_Tecnica.pdf" "docs\PROMPT_MASTER_Documentacao_Tecnica.md" --pdf-engine=pdflatex
```

Notas:
- O arquivo DOCX preservará a estrutura e cabeçalhos do Markdown.
- A geração de PDF depende de um engine instalado localmente.
- Após exportar, o DOCX/PDF será salvo em `docs/`.
