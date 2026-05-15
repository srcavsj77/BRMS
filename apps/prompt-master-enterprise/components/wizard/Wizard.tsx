"use client"
import React, {useState, useEffect, useRef} from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  jira: z.string().min(1, 'Nº do Chamado é obrigatório'),
  author: z.string().min(1, 'Autor é obrigatório'),
  area: z.string().min(1, 'Área é obrigatória'),
  history: z.string().min(1, 'História do usuário é obrigatória'),
  system: z.string().optional(),
  moduleName: z.string().optional(),
  objective: z.string().optional(),
  currentScenario: z.string().optional(),
  proposedScenario: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function Wizard(){
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const { register, handleSubmit, setError, formState: { errors }, getValues, watch } = useForm<FormValues>({
    defaultValues: {
      jira: '', author: '', area: '', history: '', system:'', moduleName:'', objective:'', currentScenario:'', proposedScenario:''
    }
  })

  const autosaveTimeout = useRef<any>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const subscription = watch(() => {
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current)
      autosaveTimeout.current = setTimeout(async () => {
        const data = getValues()
        const md = `# Documento (autosave)\n\n**Jira:** ${data.jira}\n**Autor:** ${data.author}\n**Área:** ${data.area}\n\n## História do Usuário\n${data.history}\n\n## Contexto\nSistema: ${data.system}\nMódulo: ${data.moduleName}\n\n## Objetivo\n${data.objective}\n\n## Cenário Atual\n${data.currentScenario}\n\n## Cenário Proposto\n${data.proposedScenario}\n`
        try {
          setSaving(true)
          const resp = await fetch('/api/proxy-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ md, autosave: true })
          })
          if (!resp.ok) {
            toast.error('Erro no autosave')
          } else {
            setSavedAt(new Date().toLocaleTimeString())
          }
        } catch (e) {
          toast.error('Erro no autosave')
        } finally {
          setSaving(false)
        }
      }, 1500)
    })

    return () => {
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current)
      subscription.unsubscribe()
    }
  }, [watch, getValues])

  async function onSubmit(data: FormValues) {
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      parsed.error.issues.forEach(issue => {
        const key = issue.path[0] as keyof FormValues
        setError(key, { type: 'manual', message: issue.message })
      })
      return
    }

    setLoading(true)
    setResult(null)
    const md = `# Documento Gerado\n\n**Jira:** ${data.jira}\n**Autor:** ${data.author}\n**Área:** ${data.area}\n\n## História do Usuário\n${data.history}\n\n## Contexto\nSistema: ${data.system}\nMódulo: ${data.moduleName}\n\n## Objetivo\n${data.objective}\n\n## Cenário Atual\n${data.currentScenario}\n\n## Cenário Proposto\n${data.proposedScenario}\n`
    try {
      const resp = await fetch('/api/proxy-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ md })
      })
      const text = await resp.text()
      if (resp.ok) setResult('Documento salvo com sucesso')
      else setResult('Erro: ' + text)
    } catch (e: any) {
      setResult('Erro: ' + (e.message || String(e)))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 rounded border p-4">
      <div className="flex items-center gap-4 mb-4">
        <div className={`px-3 py-1 rounded ${step===1? 'bg-indigo-600 text-white':'bg-slate-100'}`}>1</div>
        <div className={`px-3 py-1 rounded ${step===2? 'bg-indigo-600 text-white':'bg-slate-100'}`}>2</div>
        <div className={`px-3 py-1 rounded ${step===3? 'bg-indigo-600 text-white':'bg-slate-100'}`}>3</div>
        <div className={`px-3 py-1 rounded ${step===4? 'bg-indigo-600 text-white':'bg-slate-100'}`}>4</div>
        <div className={`px-3 py-1 rounded ${step===5? 'bg-indigo-600 text-white':'bg-slate-100'}`}>5</div>
      </div>

      <div className="min-h-[160px]">
        {step===1 && (
          <div className="space-y-2">
            <label className="block text-sm">Nº do Chamado Jira
              <input aria-invalid={!!errors.jira} className="w-full mt-1 p-2 border rounded" {...register('jira')} />
              {errors.jira && <div className="text-xs text-red-600">{errors.jira.message}</div>}
            </label>
            <label className="block text-sm">Autor
              <input aria-invalid={!!errors.author} className="w-full mt-1 p-2 border rounded" {...register('author')} />
              {errors.author && <div className="text-xs text-red-600">{errors.author.message}</div>}
            </label>
            <label className="block text-sm">Área Solicitante
              <input aria-invalid={!!errors.area} className="w-full mt-1 p-2 border rounded" {...register('area')} />
              {errors.area && <div className="text-xs text-red-600">{errors.area.message}</div>}
            </label>
            <label className="block text-sm">História do Usuário
              <textarea aria-invalid={!!errors.history} className="w-full mt-1 p-2 border rounded" rows={4} {...register('history')} />
              {errors.history && <div className="text-xs text-red-600">{errors.history.message}</div>}
            </label>
          </div>
        )}

        {step===2 && (
          <div className="space-y-2">
            <label className="block text-sm">Contexto do Projeto
              <textarea className="w-full mt-1 p-2 border rounded" {...register('system')} placeholder="Sistema"/>
            </label>
            <label className="block text-sm">Módulo
              <input className="w-full mt-1 p-2 border rounded" {...register('moduleName')} />
            </label>
            <label className="block text-sm">Objetivo da Demanda
              <textarea className="w-full mt-1 p-2 border rounded" rows={3} {...register('objective')} />
            </label>
            <label className="block text-sm">Cenário Atual
              <textarea className="w-full mt-1 p-2 border rounded" rows={3} {...register('currentScenario')} />
            </label>
            <label className="block text-sm">Cenário Proposto
              <textarea className="w-full mt-1 p-2 border rounded" rows={3} {...register('proposedScenario')} />
            </label>
          </div>
        )}

        {step===3 && (
          <div>
            <div className="text-sm text-slate-500">Geração Inteligente (simulada)</div>
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 border rounded">Progresso IA: <span className="font-semibold">100%</span> (simulação)</div>
          </div>
        )}

        {step===4 && (
          <div>
            <div className="text-sm text-slate-500">Revisão Técnica</div>
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 border rounded">Revisar o conteúdo antes de enviar.</div>
          </div>
        )}

        {step===5 && (
          <div>
            <div className="text-sm text-slate-500 mb-2">Aprovação</div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded mb-2">Selecione aprovadores e publique (simulação).</div>
            <div className="text-sm">Ao confirmar, o documento será convertido em Markdown e enviado ao endpoint de salvar.</div>
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2 mt-4">
        <div>
          {result && <div className="text-sm text-green-600">{result}</div>}
          {loading && <div className="text-sm text-slate-500">Enviando...</div>}
          {savedAt && <div className="text-xs text-slate-400">Último salvamento: {savedAt} (autosave)</div>}
              {savedAt && <div className="text-xs text-slate-400">Último salvamento: {savedAt} (autosave)</div>}
            </div>
        <div className="flex gap-2">
          {step>1 && <button type="button" onClick={()=>setStep(s=>s-1)} className="px-3 py-1 border rounded">Voltar</button>}
          {step<5 && <button type="button" onClick={()=>setStep(s=>s+1)} className="px-3 py-1 bg-indigo-600 text-white rounded">Próximo</button>}
          {step===5 && <button type="submit" disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded">Enviar</button>}
        </div>
      </div>
      <Toaster position="bottom-right" />
      {saving && (
        <div className="absolute top-3 right-3 flex items-center gap-2 text-xs text-slate-500">
          <div className="w-3 h-3 border-2 border-t-transparent border-slate-500 rounded-full animate-spin" />
          Salvando...
        </div>
      )}
    </form>
  )
}
