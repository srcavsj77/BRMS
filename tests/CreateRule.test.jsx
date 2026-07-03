import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreateRuleForm from '../src/pages/CreateRule';
import { ROLES } from '../src/utils/permissions';

describe('CreateRuleForm Component', () => {
  const mockUserAdmin = { name: 'Roberto Administrator', role: ROLES.ADMIN };
  const mockUserViewer = { name: 'Viewer User', role: ROLES.VIEWER };

  const mockSystems = [
    {
      id: 'sys-1',
      nome: 'SGC',
      modulos: 'Bolsas, Matrículas',
      versao: '2.1.0',
    }
  ];

  const mockRegrasList = [
    {
      id_regra: 'RULE-1',
      nome: 'Regra Duplicada',
      sistema: 'SGC',
      categoria: 'Bolsas',
      descricao: 'Descrição existente',
    }
  ];

  it('renders Step 1 (Contexto) fields by default', () => {
    const { container } = render(
      <CreateRuleForm
        regras={[]}
        systems={mockSystems}
        currentUser={mockUserAdmin}
        isEdit={false}
      />
    );

    expect(container.querySelector('input[name="nome"]')).toBeInTheDocument();
    expect(container.querySelector('select[name="sistema_associado"]')).toBeInTheDocument();
    expect(container.querySelector('select[name="categoria"]')).toBeInTheDocument();
  });

  it('shows error modal if clicking Próximo with empty fields on Step 1', () => {
    render(
      <CreateRuleForm
        regras={[]}
        systems={mockSystems}
        currentUser={mockUserAdmin}
        isEdit={false}
      />
    );

    const nextButton = screen.getByRole('button', { name: /Próximo/i });
    fireEvent.click(nextButton);

    // Modal with error should be visible
    expect(screen.getByText(/Impedimento/i)).toBeInTheDocument();
    expect(screen.getByText(/Um ou mais itens encontram-se sem preenchimento/i)).toBeInTheDocument();
  });

  it('navigates through steps when fields are valid', () => {
    const { container } = render(
      <CreateRuleForm
        regras={[]}
        systems={mockSystems}
        currentUser={mockUserAdmin}
        isEdit={false}
      />
    );

    // Step 1: Fill Name and select System
    const nomeInput = container.querySelector('input[name="nome"]');
    fireEvent.change(nomeInput, { target: { value: 'Nova Regra Incrível' } });

    const sistemaSelect = container.querySelector('select[name="sistema_associado"]');
    fireEvent.change(sistemaSelect, { target: { value: 'SGC' } });

    // Categoria should automatically select 'Bolsas' or we can set it
    const categoriaSelect = container.querySelector('select[name="categoria"]');
    fireEvent.change(categoriaSelect, { target: { value: 'Bolsas' } });

    const nextButton = screen.getByRole('button', { name: /Próximo/i });
    fireEvent.click(nextButton);

    // Step 2: Description section should be visible
    const descricaoTextarea = container.querySelector('textarea[name="descricao_funcional"]');
    expect(descricaoTextarea).toBeInTheDocument();

    // Click next without description
    fireEvent.click(nextButton);
    expect(screen.getByText(/Impedimento/i)).toBeInTheDocument();

    // Dismiss error modal
    fireEvent.click(screen.getByRole('button', { name: /Ok/i }));

    // Fill description
    fireEvent.change(descricaoTextarea, { target: { value: 'Esta regra valida se o aluno tem direito a bolsas.' } });

    // Click next
    fireEvent.click(nextButton);

    // Step 3: Vigência section should be visible
    const vigenciaInput = container.querySelector('input[name="vigencia_inicio"]');
    expect(vigenciaInput).toBeInTheDocument();

    // Fill Vigência Início
    fireEvent.change(vigenciaInput, { target: { value: '2026-06-29' } });

    // Click next
    fireEvent.click(nextButton);

    // Step 4: Governança section should be visible (Histórico e Justificativa)
    const justificativaTextarea = container.querySelector('textarea[name="justificativa_alteracao"]');
    expect(justificativaTextarea).toBeInTheDocument();
  });

  it('triggers error if name is duplicate when trying to save', () => {
    const onSaveMock = vi.fn();
    const { container } = render(
      <CreateRuleForm
        regras={mockRegrasList}
        systems={mockSystems}
        currentUser={mockUserAdmin}
        isEdit={false}
        onSave={onSaveMock}
      />
    );

    // Fill duplicate name
    fireEvent.change(container.querySelector('input[name="nome"]'), { target: { value: 'Regra Duplicada' } });
    fireEvent.change(container.querySelector('select[name="sistema_associado"]'), { target: { value: 'SGC' } });
    fireEvent.change(container.querySelector('select[name="categoria"]'), { target: { value: 'Bolsas' } });

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    // Step 2 Description
    fireEvent.change(container.querySelector('textarea[name="descricao_funcional"]'), { target: { value: 'Descrição da regra' } });
    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    // Step 3 Vigência
    fireEvent.change(container.querySelector('input[name="vigencia_inicio"]'), { target: { value: '2026-06-29' } });
    // Step 3 -> Step 4
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    // Click save
    const saveButton = screen.getByRole('button', { name: /Finalizar e Salvar/i });
    fireEvent.click(saveButton);

    // Modal with error should be visible due to duplicate name
    expect(screen.getByText(/Impedimento/i)).toBeInTheDocument();
    expect(screen.getByText(/Já existe uma regra cadastrada com o nome "Regra Duplicada"/i)).toBeInTheDocument();
    expect(onSaveMock).not.toHaveBeenCalled();
  });

  it('calls onSave with correct data when saving is valid', () => {
    const onSaveMock = vi.fn();
    const { container } = render(
      <CreateRuleForm
        regras={mockRegrasList}
        systems={mockSystems}
        currentUser={mockUserAdmin}
        isEdit={false}
        onSave={onSaveMock}
      />
    );

    // Fill valid data
    fireEvent.change(container.querySelector('input[name="nome"]'), { target: { value: 'Regra Nova Exclusiva' } });
    fireEvent.change(container.querySelector('select[name="sistema_associado"]'), { target: { value: 'SGC' } });
    fireEvent.change(container.querySelector('select[name="categoria"]'), { target: { value: 'Bolsas' } });

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    // Step 2 Description
    fireEvent.change(container.querySelector('textarea[name="descricao_funcional"]'), { target: { value: 'Descrição exclusiva' } });
    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    // Step 3 Vigência
    fireEvent.change(container.querySelector('input[name="vigencia_inicio"]'), { target: { value: '2026-06-29' } });
    // Step 3 -> Step 4
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    // Step 4 Justificativa
    fireEvent.change(container.querySelector('textarea[name="justificativa_alteracao"]'), { target: { value: 'Criação inicial' } });

    // Click save
    const saveButton = screen.getByRole('button', { name: /Finalizar e Salvar/i });
    fireEvent.click(saveButton);

    // Modal with success should be visible
    expect(screen.getByText(/Sucesso!/i)).toBeInTheDocument();
    expect(onSaveMock).toHaveBeenCalled();
  });

  it('disables save button and displays lock icon for viewer user', () => {
    const { container } = render(
      <CreateRuleForm
        regras={[]}
        systems={mockSystems}
        currentUser={mockUserViewer}
        isEdit={false}
      />
    );

    // Navigate to step 4 directly by mocking form state or just filling it
    fireEvent.change(container.querySelector('input[name="nome"]'), { target: { value: 'Regra Nova' } });
    fireEvent.change(container.querySelector('select[name="sistema_associado"]'), { target: { value: 'SGC' } });
    fireEvent.change(container.querySelector('select[name="categoria"]'), { target: { value: 'Bolsas' } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    fireEvent.change(container.querySelector('textarea[name="descricao_funcional"]'), { target: { value: 'Descrição' } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    fireEvent.change(container.querySelector('input[name="vigencia_inicio"]'), { target: { value: '2026-06-29' } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }));

    // Final button should be disabled
    const saveButton = screen.getByRole('button', { name: /Finalizar e Salvar/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveAttribute('title', 'Você não possui permissão para salvar alterações.');
  });
});
