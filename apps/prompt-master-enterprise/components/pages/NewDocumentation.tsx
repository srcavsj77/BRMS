"use client"
import React from 'react'
import Wizard from '../wizard/Wizard'

export default function NewDocumentation(){
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Nova Documentação Técnica</h2>
            <div className="text-sm text-slate-500">Usuário: João Silva • Arquiteto de Software</div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded p-4">
            <div className="flex items-center gap-4">
              <div className="w-2/3">
                <div className="h-2 bg-indigo-200 rounded overflow-hidden mb-3">
                  <div className="h-2 bg-indigo-600" style={{width: '25%'}}></div>
                </div>
                <div className="flex gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white">1</div><span>Informações Iniciais</span></div>
                  <div className="flex items-center gap-2"><div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600">2</div><span>Contexto do Projeto</span></div>
                  <div className="flex items-center gap-2"><div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600">3</div><span>Geração Inteligente</span></div>
                  <div className="flex items-center gap-2"><div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600">4</div><span>Revisão</span></div>
                  <div className="flex items-center gap-2"><div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600">5</div><span>Aprovação</span></div>
                </div>
              </div>
              <div className="w-1/3 text-right text-sm text-slate-500">Progresso: <strong>25%</strong></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <div className="bg-white dark:bg-slate-800 p-4 rounded border mb-4">
              <h3 className="font-semibold mb-3">Informações da Solicitação</h3>
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Nº do Chamado Jira" className="col-span-1 p-2 border rounded"/>
                <input placeholder="Autor da Solicitação" className="col-span-1 p-2 border rounded"/>
                <input placeholder="Área Solicitante" className="col-span-1 p-2 border rounded"/>
              </div>
              <div className="mt-3">
                <textarea placeholder="Cole a história do usuário ou anexe" className="w-full p-3 border rounded h-28" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded border mb-4">
              <h3 className="font-semibold mb-3">Contexto do Projeto</h3>
              <div className="grid grid-cols-2 gap-3">
                <textarea placeholder="Contexto do Projeto" className="p-2 border rounded h-24" />
                <div className="space-y-2">
                  <input placeholder="Sistema" className="w-full p-2 border rounded"/>
                  <input placeholder="Módulo" className="w-full p-2 border rounded"/>
                </div>
                <textarea placeholder="Objetivo da Demanda" className="p-2 border rounded h-24 col-span-2" />
                <textarea placeholder="Cenário Atual" className="p-2 border rounded h-20" />
                <textarea placeholder="Cenário Proposto" className="p-2 border rounded h-20" />
                <input placeholder="Dependências" className="p-2 border rounded" />
                <input placeholder="Restrições" className="p-2 border rounded" />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded">Salvar e Avançar →</button>
            </div>
          </div>

          <aside className="col-span-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded border mb-4">
              <h4 className="font-semibold">Progresso da Documentação</h4>
              <div className="flex items-center gap-4 mt-3">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xl font-semibold">25%</div>
                <div>
                  <div className="text-sm text-slate-500">Etapa atual</div>
                  <div className="font-medium">Informações Iniciais</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded border mb-4">
              <h4 className="font-semibold">Modelos Disponíveis</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li>Especificação Funcional</li>
                <li>Arquitetura de Software</li>
                <li>Diagrama de Integração</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded border">
              <h4 className="font-semibold">Documentações Recentes</h4>
              <ul className="mt-2 text-sm text-slate-600 space-y-2">
                <li className="flex justify-between"><span>PROJ-12345 - Módulo Financeiro</span><span className="text-green-600">Aprovado</span></li>
                <li className="flex justify-between"><span>PROJ-12344 - Integração ERP</span><span className="text-yellow-600">Em Revisão</span></li>
                <li className="flex justify-between"><span>PROJ-12343 - Cadastro de Clientes</span><span className="text-slate-500">Gerado</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
