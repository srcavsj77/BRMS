import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFormularioRegra } from '../src/hooks/useFormularioRegra';

describe('useFormularioRegra custom hook', () => {
  const mockSystems = [
    {
      id: 'sys-1',
      nome: 'SGC',
      modulos: 'Bolsas, Matrículas, Diplomação',
      versao: '2.1.0',
    },
    {
      id: 'sys-2',
      nome: 'Financeiro',
      modulos: 'Notas, Cobrança',
      versao: '1.5.4',
    }
  ];

  it('initializes with default structure and fields', () => {
    const { result } = renderHook(() => useFormularioRegra(null, false, []));

    expect(result.current.dadosFormulario).toBeDefined();
    expect(result.current.dadosFormulario.id).toMatch(/^RULE-\d+$/);
    expect(result.current.dadosFormulario.nome).toBe('');
    expect(result.current.dadosFormulario.status).toBe('Ativo');
    expect(result.current.dadosFormulario.versao).toBe('1.0.0');
    expect(result.current.categorias).toContain('Financeiro');
  });

  it('updates form fields with sanitizeSQL when lidarComMudanca is triggered', () => {
    const { result } = renderHook(() => useFormularioRegra(null, false, []));

    // Normal change
    act(() => {
      result.current.lidarComMudanca({
        target: { name: 'nome', value: 'Regra de Desconto' }
      });
    });

    expect(result.current.dadosFormulario.nome).toBe('Regra de Desconto');

    // SQL Injection bypass attempt
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    act(() => {
      result.current.lidarComMudanca({
        target: { name: 'descricao_funcional', value: 'SELECT * FROM regras WHERE 1=1' }
      });
    });

    // The SQL words and OR/AND patterns are removed by sanitizeSQL
    // SELECT and WHERE 1=1 should be stripped
    expect(result.current.dadosFormulario.descricao_funcional).not.toContain('SELECT');
    expect(result.current.dadosFormulario.descricao_funcional).not.toContain('WHERE');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('resets form state when resetarFormulario is called', () => {
    const { result } = renderHook(() => useFormularioRegra(null, false, []));

    act(() => {
      result.current.lidarComMudanca({
        target: { name: 'nome', value: 'Nome Temporario' }
      });
    });
    expect(result.current.dadosFormulario.nome).toBe('Nome Temporario');

    act(() => {
      result.current.resetarFormulario();
    });

    expect(result.current.dadosFormulario.nome).toBe('');
  });

  it('dynamically updates categories and version based on selected system', () => {
    const { result } = renderHook(() => useFormularioRegra(null, false, mockSystems));

    // Initially standard categories
    expect(result.current.categorias).not.toContain('Bolsas');

    // Set associated system
    act(() => {
      result.current.lidarComMudanca({
        target: { name: 'sistema_associado', value: 'SGC' }
      });
    });

    // Should update categories list
    expect(result.current.categorias).toContain('Bolsas');
    expect(result.current.categorias).toContain('Matrículas');
    expect(result.current.categorias).toContain('Diplomação');

    // Should suggest version from systems
    expect(result.current.dadosFormulario.versao).toBe('2.1.0');
    expect(result.current.dadosFormulario.categoria).toBe('Bolsas'); // first module
  });

  it('loads initialData correctly when ehEdicao is true', () => {
    const mockInitialData = {
      id_regra: 'RULE-999',
      nome: 'Regra Editada',
      descricao: 'Descrição funcional editada',
      categoria: 'Cobrança',
      criticidade: 'Alta',
      expressao: 'valor > 500',
      versao: '2.0.1',
      status: 'Inativo',
      usuario: 'Carlos Dev',
      criacao: '2026-01-01',
      modificacao: '2026-06-29',
      sistema: 'Financeiro',
    };

    const { result } = renderHook(() => useFormularioRegra(mockInitialData, true, mockSystems));

    expect(result.current.dadosFormulario.id).toBe('RULE-999');
    expect(result.current.dadosFormulario.nome).toBe('Regra Editada');
    expect(result.current.dadosFormulario.descricao_funcional).toBe('Descrição funcional editada');
    expect(result.current.dadosFormulario.categoria).toBe('Cobrança');
    expect(result.current.dadosFormulario.criticidade).toBe('Alta');
    expect(result.current.dadosFormulario.expressao_logica).toBe('valor > 500');
    expect(result.current.dadosFormulario.versao).toBe('2.0.1');
    expect(result.current.dadosFormulario.status).toBe('Inativo');
    expect(result.current.dadosFormulario.responsavel_funcional).toBe('Carlos Dev');
    expect(result.current.dadosFormulario.sistema_associado).toBe('Financeiro');
  });
});
