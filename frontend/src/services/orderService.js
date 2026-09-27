// Encapsula criação de pedidos e aprovação simulada do pagamento.
import { apiFetch } from './api';

async function criarPedido(dadosCheckout = {}, idempotencyKey) {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
  const resposta = await apiFetch('/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify(dadosCheckout),
  });
  return resposta.pedido;
}

async function simularPagamento(pedidoId) {
  const resposta = await apiFetch(`/orders/${pedidoId}/simulate-payment`, {
    method: 'POST',
  });
  return resposta.pedido;
}

export { criarPedido, simularPagamento };
