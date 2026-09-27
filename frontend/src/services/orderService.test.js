import { beforeEach, expect, test, vi } from 'vitest';

const { apiFetch } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock('./api', () => ({ apiFetch }));

import { criarPedido } from './orderService';

beforeEach(() => {
  apiFetch.mockReset();
});

test('envia a chave de idempotência ao criar o pedido', async () => {
  apiFetch.mockResolvedValue({ pedido: { id: '42' } });
  const entrega = { nome: 'Cliente' };

  await expect(criarPedido({ entrega }, 'checkout-42')).resolves.toEqual({
    id: '42',
  });
  expect(apiFetch).toHaveBeenCalledWith('/orders', {
    method: 'POST',
    headers: { 'Idempotency-Key': 'checkout-42' },
    body: JSON.stringify({ entrega }),
  });
});
