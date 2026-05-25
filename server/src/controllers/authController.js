const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/db');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

function signAccess(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES,
  });
}

function signRefresh(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).optional(),
  language: z.enum(['en', 'he']).default('en'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, displayName: data.displayName, language: data.language },
      select: { id: true, email: true, displayName: true, language: true },
    });

    const accessToken  = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({ data: { userId: user.id, refreshToken, expiresAt } });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.status(201).json({ user, accessToken });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken  = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({ data: { userId: user.id, refreshToken, expiresAt } });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({
      accessToken,
      user: { id: user.id, email: user.email, displayName: user.displayName, language: user.language },
    });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const session = await prisma.session.findUnique({ where: { refreshToken: token } });
    if (!session || session.expiresAt < new Date()) {
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({ error: 'Session expired' });
    }

    // Rotate refresh token
    const newRefresh = signRefresh(payload.sub);
    const expiresAt  = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefresh, expiresAt },
    });

    res.cookie('refreshToken', newRefresh, COOKIE_OPTS);
    res.json({ accessToken: signAccess(payload.sub) });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await prisma.session.deleteMany({ where: { refreshToken: token } });
    }
    res.clearCookie('refreshToken', { path: '/' });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, displayName: true, language: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, me };
