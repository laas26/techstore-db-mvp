const {
  hashSenha,
  compararSenha,
  gerarToken,
  verificarToken,
} = require('../src/utils/crypto');

describe('Utilitário de Criptografia e JWT (Testes Unitários)', () => {
  test('deve gerar um hash de senha válido e confirmá-lo corretamente', async () => {
    const senhaPura = 'senhaSegura123';

    const hash = await hashSenha(senhaPura);
    expect(hash).not.toBe(senhaPura);

    const senhaCorretaValida = await compararSenha(senhaPura, hash);
    expect(senhaCorretaValida).toBe(true);

    const senhaIncorretaValida = await compararSenha('senhaErrada', hash);
    expect(senhaIncorretaValida).toBe(false);
  });

  test('deve gerar e verificar um token JWT com sucesso', () => {
    const payload = { id: 1, email: 'usuario@techstore.com' };

    const token = gerarToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);

    const tokenDecodificado = verificarToken(token);
    expect(tokenDecodificado).toHaveProperty('id', 1);
    expect(tokenDecodificado).toHaveProperty('email', 'usuario@techstore.com');
  });
});
