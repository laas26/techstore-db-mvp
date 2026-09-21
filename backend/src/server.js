// src/server.js
const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  const { inicializarBanco } = require('./database/connection');
  
  // DevOps: Se o banco falhar por timing, espera 3 segundos e tenta de novo antes de quebrar
  try {
    await inicializarBanco();
  } catch (error) {
    console.log('⏳ Banco de dados ainda inicializando... Tentando novamente em 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await inicializarBanco();
  }

  const app = require('./app');

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

iniciarServidor().catch((error) => {
  console.error('❌ Erro crítico ao iniciar o servidor:', error);
  process.exitCode = 1;
});
