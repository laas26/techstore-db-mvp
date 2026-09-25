const authService = require('../services/authService');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { revogarSessao } = require('../services/sessionService');

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  };
}

function clearSessionCookie(res) {
  res.clearCookie('sessionToken', sessionCookieOptions());
}

async function login(req, res, next) {
  try {
    const email = req.body.email?.trim();
    const senha = req.body.senha || req.body.password;
    const { token, usuario } = await authService.autenticar(email, senha);

    res.cookie('sessionToken', token, {
      ...sessionCookieOptions(),
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({ usuario });
  } catch (error) {
    if (error instanceof authService.CredenciaisInvalidasError) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    }
    return next(error);
  }
}

async function register(req, res, next) {
  try {
    const nome = req.body.nome.trim();
    const email = req.body.email.trim();
    const usuario = await authService.cadastrar(nome, email, req.body.senha);

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    if (error instanceof userRepository.EmailJaCadastradoError) {
      return res.status(409).json({ erro: 'E-mail já cadastrado' });
    }
    return next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const email = req.body.email?.trim();
    await authService.gerarTokenRecuperacao(email);

    return res.status(200).json({
      mensagem:
        'Se o e-mail informado estiver cadastrado em nosso sistema, você receberá as instruções de recuperação em instantes.',
    });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, novaSenha } = req.body;
    await authService.redefinirSenha(token, novaSenha);
    return res.status(200).json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    if (error instanceof authService.TokenRedefinicaoInvalidoError) {
      return res.status(400).json({ erro: 'Token inválido ou expirado' });
    }
    return next(error);
  }
}

async function logout(req, res) {
  const token = req.cookies?.sessionToken;

  if (!token) {
    return res.status(401).json({ erro: 'Nenhuma sessão ativa encontrada' });
  }

  let sessao;
  try {
    sessao = jwt.verify(token, authService.obterJwtSecret());
  } catch {
    clearSessionCookie(res);
    return res.status(401).json({ erro: 'Sessão inválida ou expirada' });
  }

  try {
    await revogarSessao(sessao.jti, sessao.exp);
  } catch (error) {
    console.error('Falha ao revogar sessão:', error);
    return res
      .status(503)
      .json({ erro: 'Não foi possível encerrar a sessão.' });
  }

  clearSessionCookie(res);
  return res.status(200).json({ mensagem: 'Sessão encerrada com sucesso' });
}

module.exports = { login, logout, register, forgotPassword, resetPassword };
