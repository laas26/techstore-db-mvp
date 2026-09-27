require('dotenv').config();

const PORT = process.env.PORT || 3000;
const RETRY_DELAY_MS = 3000;

async function iniciarServidor() {
  const { inicializarBanco } = require('./database/connection');

  try {
    await inicializarBanco();
  } catch (error) {
    console.error('Banco indisponível. Nova tentativa em 3 segundos.', error);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    await inicializarBanco();
  }

  const app = require('./app');
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

iniciarServidor().catch((error) => {
  console.error('Erro crítico ao iniciar o servidor:', error);
  process.exitCode = 1;
});
