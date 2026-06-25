import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ListRules from '../src/pages/ListRules';
import AuditChanges from '../src/pages/AuditChanges';
import { ROLES } from '../src/utils/permissions';

describe('ListRules Component - Deletion Feature', () => {
  const mockUserAdmin = { name: 'admin', role: ROLES.ADMIN };
  const mockUserViewer = { name: 'viewer', role: ROLES.VIEWER };

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
    },
    {
      id_regra: 'RULE-102',
      nome: 'Rule B',
      versao: '1.0.0',
      descricao: 'Description B',
      sistema: 'Financeiro',
      categoria: 'Notas',
      usuario: 'admin',
      criacao: '10/01/2026',
      modificacao: '10/01/2026',
      status: 'Excluída',
    }
  ];

  it('renders Excluir button for active rule if user has permission', () => {
    render(
      <ListRules
        regras={mockRegras}
        currentUser={mockUserAdmin}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Rule A is active, should show "Excluir"
    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
    expect(deleteButtons.length).toBe(1);
  });

  it('does not render Excluir button for already Excluída rules', () => {
    render(
      <ListRules
        regras={mockRegras}
        currentUser={mockUserAdmin}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Only one delete button because RULE-102 is already Excluída
    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
    expect(deleteButtons.length).toBe(1);
  });

  it('disables Excluir button if user lacks delete permission (e.g. viewer)', () => {
    render(
      <ListRules
        regras={mockRegras}
        currentUser={mockUserViewer}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Viewer doesn't have "Excluir regra" permission, so the button should have disabled attribute
    const deleteButton = screen.getByRole('button', { name: /excluir/i });
    expect(deleteButton).toBeDisabled();
  });

  it('triggers onDelete callback when Excluir is clicked and confirmed', () => {
    const onDeleteMock = vi.fn();
    
    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <ListRules
        regras={mockRegras}
        currentUser={mockUserAdmin}
        onEdit={vi.fn()}
        onDelete={onDeleteMock}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /excluir/i });
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDeleteMock).toHaveBeenCalledWith(mockRegras[0]);

    confirmSpy.mockRestore();
  });
});

describe('AuditChanges Component - Approval Feature', () => {
  const mockUserAdmin = { name: 'admin', role: ROLES.ADMIN };
  const mockUserViewer = { name: 'viewer', role: ROLES.VIEWER };

  const mockAuditData = [
    {
      id: 'evt-1',
      data: '25/06/2026',
      hora: '14:00',
      usuario: 'admin',
      regra_id: 'RULE-102',
      alteracao: 'Regra marcada para exclusão',
      status: 'Excluída',
    }
  ];

  it('renders Approval button for Excluída events if user is admin', () => {
    render(
      <AuditChanges
        regras={[]}
        auditData={mockAuditData}
        currentUser={mockUserAdmin}
        onApproveExclusao={vi.fn()}
      />
    );

    const approveButton = screen.getByRole('button', { name: /aprovação/i });
    expect(approveButton).toBeInTheDocument();
  });

  it('disables or restricts Approval button to administrators', () => {
    render(
      <AuditChanges
        regras={[]}
        auditData={mockAuditData}
        currentUser={mockUserViewer}
        onApproveExclusao={vi.fn()}
      />
    );

    // Viewer cannot approve, button should be disabled or show lock
    const approveButton = screen.getByRole('button', { name: /aprovação/i });
    expect(approveButton).toHaveAttribute('title', 'Aprovação restrita a administradores.');
  });

  it('opens confirmation modal and triggers onApproveExclusao when Sim is clicked', () => {
    const onApproveMock = vi.fn();
    
    render(
      <AuditChanges
        regras={[]}
        auditData={mockAuditData}
        currentUser={mockUserAdmin}
        onApproveExclusao={onApproveMock}
      />
    );

    // Click Aprovação to open modal
    const approveButton = screen.getByRole('button', { name: /aprovação/i });
    fireEvent.click(approveButton);

    // Modal should be open, find "Sim" button
    const simButton = screen.getByRole('button', { name: /sim/i });
    fireEvent.click(simButton);

    expect(onApproveMock).toHaveBeenCalledWith('evt-1', 'RULE-102');
  });
});

