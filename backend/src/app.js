// src/app.js
// Configura o aplicativo Express, middlewares globais e registro das rotas da API.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const registerRoutes = require('./routes/registerRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.set('trust proxy', 1);

// Configuração do Helmet liberando as portas oficiais do Docker na política CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'connect-src': [
          "'self'",
          'http://localhost:3000',
          'http://localhost:3001', // Porta do Frontend no Docker
          'http://localhost:3002', // Porta do Backend no Docker
          'http://localhost',
          'http://localhost:5173',
        ],
      },
    },
  }),
);

// Configuração do CORS dinâmica baseada na própria origem da requisição
const origensPermitidas = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost',
  'http://localhost:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origensPermitidas.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Rota de Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Registro das rotas
app.use('/api/auth', authRoutes);
app.use('/api', registerRoutes);
app.use('/api/users', userRoutes);
app.use('/api', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', orderRoutes);
app.use('/api/cart', cartRoutes);

// Middleware global de tratamento de erro
app.use(errorHandler);

module.exports = app;
