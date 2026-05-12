import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('App Component', () => {
  it('should render the login screen by default', () => {
    // Como a rota inicial geralmente é o login, testamos a renderização de um elemento do login
    render(<App />);
    // O texto específico depende de como o Login.jsx está estruturado
    // Vamos procurar por algo genérico que exista na tela
    expect(screen.getByRole('button', { name: /acessar sistema/i })).toBeInTheDocument();
  });
});
