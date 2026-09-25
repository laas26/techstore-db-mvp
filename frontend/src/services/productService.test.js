import { beforeEach, expect, test, vi } from 'vitest';

const { apiFetch } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock('./api', () => ({ apiFetch }));

import { limparCacheCatalogo, listarProdutos } from './productService';

beforeEach(() => {
  apiFetch.mockReset();
  limparCacheCatalogo();
});

test('compartilha a requisição do catálogo em cache', async () => {
  let resolveRequest;
  const response = new Promise((resolve) => {
    resolveRequest = resolve;
  });
  apiFetch.mockReturnValue(response);

  const primeira = listarProdutos();
  const segunda = listarProdutos();

  expect(apiFetch).toHaveBeenCalledTimes(1);

  resolveRequest([{ id: 1, nome: 'Produto' }]);
  await expect(primeira).resolves.toEqual([
    { id: 1, nome: 'Produto', imagem: undefined, image: undefined },
  ]);
  await expect(segunda).resolves.toEqual([
    { id: 1, nome: 'Produto', imagem: undefined, image: undefined },
  ]);
});

test('usa o cache após uma carga bem-sucedida', async () => {
  apiFetch.mockResolvedValue([{ id: 1, nome: 'Produto' }]);

  await listarProdutos();
  await listarProdutos();

  expect(apiFetch).toHaveBeenCalledTimes(1);
});
