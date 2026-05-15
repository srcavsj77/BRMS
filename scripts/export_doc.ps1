# Script de exportação do documento PROMPT_MASTER
# Requisitos:
# - Pandoc instalado: https://pandoc.org/
# - Para gerar PDF, é necessário um engine compatível (TeX Live/MikTeX ou wkhtmltopdf)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mdPath = Join-Path $scriptDir "..\docs\PROMPT_MASTER_Documentacao_Tecnica.md"
$docxPath = Join-Path $scriptDir "..\docs\PROMPT_MASTER_Documentacao_Tecnica.docx"
$pdfPath = Join-Path $scriptDir "..\docs\PROMPT_MASTER_Documentacao_Tecnica.pdf"

if (-not (Test-Path $mdPath)) {
    Write-Error "Arquivo de origem não encontrado: $mdPath"
    exit 1
}

if (-not (Get-Command pandoc -ErrorAction SilentlyContinue)) {
    Write-Error "Pandoc não encontrado. Instale Pandoc: https://pandoc.org/"
    exit 2
}

Write-Host "Gerando DOCX: $docxPath"
pandoc -s -o "$docxPath" "$mdPath"
$docxExit = $LASTEXITCODE
if ($docxExit -ne 0) { Write-Error "Falha ao gerar DOCX (exit code $docxExit)" }
else { Write-Host "DOCX gerado com sucesso." }

# Tentativa de gerar PDF usando engines disponíveis
if (Get-Command pdflatex -ErrorAction SilentlyContinue) {
    Write-Host "Gerando PDF com pdflatex: $pdfPath"
    pandoc -s -o "$pdfPath" "$mdPath" --pdf-engine=pdflatex
    if ($LASTEXITCODE -ne 0) { Write-Warning "Falha ao gerar PDF com pdflatex." }
    else { Write-Host "PDF gerado com sucesso (pdflatex)." }
} elseif (Get-Command wkhtmltopdf -ErrorAction SilentlyContinue) {
    Write-Host "Gerando PDF com wkhtmltopdf: $pdfPath"
    pandoc -s -o "$pdfPath" "$mdPath" --pdf-engine=wkhtmltopdf
    if ($LASTEXITCODE -ne 0) { Write-Warning "Falha ao gerar PDF com wkhtmltopdf." }
    else { Write-Host "PDF gerado com sucesso (wkhtmltopdf)." }
} else {
    Write-Warning "Nenhum engine de PDF detectado (pdflatex/wkhtmltopdf). DOCX foi gerado; para PDF instale TeX ou wkhtmltopdf e reexecute este script." 
}

Write-Host "Exportação finalizada. Arquivos disponíveis em: $(Resolve-Path (Join-Path $scriptDir '..\docs'))"