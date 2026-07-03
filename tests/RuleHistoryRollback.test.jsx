import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ListRules from '../src/pages/ListRules';
import { ROLES } from '../src/utils/permissions';

describe('ListRules Component - Rule History and Rollback Feature', () => {
  const mockUserAdmin = { name: 'admin', role: ROLES.ADMIN };

  const mockRegras = [
    {
      id_regra: 'RULE-101',
      nome: 'Rule A',
      versao: '1.0.0',
      descricao: 'Description A',
      sistema: 'SGC',
      categoria: 'Bolsas',
      usuario: 'admin',
      criacao: '10/01/2026',
      modificacao: '10/01/2026',
      status: 'Ativo',
    }
  ];

  const mockHistory = [
    {
      id_historico: 'hist-1',
      id_regra: 'RULE-101',
      nome: 'Rule A Original',
      versao: '1.0.0',
      descricao: 'Old Description',
      sistema: 'SGC',
      categoria: 'Bolsas',
      criticidade: 'Alta',
      expressao: 'aluno.nota >= 7.0',
      status: 'Ativo',
      usuario: 'admin',
      data_alteracao: '10/01/2026 10:00',
      justificativa: 'Criação original',
    }
  ];

  it('renders Histórico button for rule', () => {
    render(
      <ListRules
        regras={mockRegras}
        currentUser={mockUserAdmin}
        historicoRegras={[]}
        onRollback={vi.fn()}
      />
    );

    const historyButtons = screen.getAllByRole('button', { name: /histórico/i });
    expect(historyButtons.length).toBe(1);
  });

  it('opens history modal when clicking Histórico, showing empty state when no history exists', () => {
    render(
      <ListRules
        regras={mockRegras}
        currentUser={mockUserAdmin}
        historicoRegras={[]}
        onRollback={vi.fn()}
      />
    );

    const historyButton = screen.getByRole('button', { name: /histórico/i });
    fireEvent.click(historyButton);

    expect(screen.getByText(/Nenhum histórico registrado para esta regra/i)).toBeInTheDocument();
  });

  it('renders history entries and triggers rollback callback when Restaurar is clicked', () => {
    const onRollbackMock = vi.fn();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <ListRules
        regras={mockRegras}
        currentUser={mockUserAdmin}
        historicoRegras={mockHistory}
        onRollback={onRollbackMock}
      />
    );

    const historyButton = screen.getByRole('button', { name: /histórico/i });
    fireEvent.click(historyButton);

    // Should display the history version badge and justification
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText(/"Criação original"/)).toBeInTheDocument();

    const restoreButton = screen.getByRole('button', { name: /restaurar/i });
    fireEvent.click(restoreButton);

    expect(onRollbackMock).toHaveBeenCalledWith(mockHistory[0]);
  });
});
