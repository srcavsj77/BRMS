import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UsersManagement from '../src/pages/UsersManagement';
import { ROLES } from '../src/utils/permissions';

describe('UsersManagement - Sudo Mode', () => {
  const mockUserAdmin = { name: 'Roberto Administrator', role: ROLES.ADMIN };

  const mockUsersList = [
    {
      id: 1,
      name: 'Roberto Administrator',
      role: 'admin',
      email: 'roberto@fgv.br',
      status: 'Ativo',
    },
    {
      id: 2,
      name: 'Carlos',
      role: 'admin',
      email: 'c@teste.com',
      status: 'Ativo',
    }
  ];

  const mockProfilesList = [
    { id: 'admin', name: 'Administrador', status: 'Ativo', permissions: ['Users'] },
    { id: 'viewer', name: 'Leitor', status: 'Ativo', permissions: [] }
  ];

  it('triggers Sudo Modal when deleting a user', async () => {
    render(
      <UsersManagement
        usersList={mockUsersList}
        currentUser={mockUserAdmin}
        onUpdateUsers={vi.fn()}
        profilesList={mockProfilesList}
      />
    );

    // Mock confirm dialog
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    const deleteButtons = screen.getAllByTitle('Excluir Usuário');
    // Button for Carlos (id 2) is deleteButtons[0] (because roberto cannot delete himself)
    fireEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();

    // Sudo Modal should be open now
    expect(screen.getByText(/Confirmação de Segurança/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Digite sua senha de acesso/i)).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it('triggers Sudo Modal when blocking/unblocking a user', async () => {
    render(
      <UsersManagement
        usersList={mockUsersList}
        currentUser={mockUserAdmin}
        onUpdateUsers={vi.fn()}
        profilesList={mockProfilesList}
      />
    );

    const blockButtons = screen.getAllByTitle(/Bloquear Usuário/i);
    // Click block for Carlos (first block button)
    fireEvent.click(blockButtons[0]);

    // Sudo Modal should be open now
    expect(screen.getByText(/Confirmação de Segurança/i)).toBeInTheDocument();
  });

  it('calls onUpdateUsers with password when Sudo is confirmed', async () => {
    const onUpdateMock = vi.fn().mockResolvedValue(true);

    render(
      <UsersManagement
        usersList={mockUsersList}
        currentUser={mockUserAdmin}
        onUpdateUsers={onUpdateMock}
        profilesList={mockProfilesList}
      />
    );

    // Trigger sudo modal via block action
    const blockButtons = screen.getAllByTitle(/Bloquear Usuário/i);
    fireEvent.click(blockButtons[1]);

    // Type password
    const passwordInput = screen.getByPlaceholderText(/Digite sua senha de acesso/i);
    fireEvent.change(passwordInput, { target: { value: 'fgv123' } });

    // Click Confirmar
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onUpdateMock).toHaveBeenCalled();
    });

    // Check that it was called with the updated list and password
    const expectedUpdatedList = mockUsersList.map(u => u.id === 2 ? { ...u, status: 'Bloqueado' } : u);
    expect(onUpdateMock).toHaveBeenCalledWith(expectedUpdatedList, 'fgv123');
  });
});
