// Testa o comportamento de erro da tela de login em ambiente DOM simulado.
// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ProductCatalogProvider } from '../../context/ProductCatalogContext';
import { login } from '../../services/authService';
import Login from '../Login';

vi.mock('../../services/authService', () => ({
  login: vi.fn(),
}));

vi.mock('../../services/productService', () => ({
  listarProdutos: vi.fn().mockResolvedValue([]),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('exibe mensagem de erro quando o login falha', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  login.mockRejectedValueOnce(new Error('E-mail ou senha inválidos'));

  render(
    <MemoryRouter>
      <AuthProvider>
        <ProductCatalogProvider>
          <Login />
        </ProductCatalogProvider>
      </AuthProvider>
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByLabelText(/e-mail/i), {
    target: { value: 'errado@exemplo.com' },
  });
  fireEvent.change(screen.getByLabelText('Senha', { selector: 'input' }), {
    target: { value: 'senhaErrada' },
  });

  fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

  const mensagemErro = await screen.findByRole('alert');
  expect(mensagemErro).toBeInTheDocument();
});
