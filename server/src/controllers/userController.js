const { z } = require('zod');
const prisma = require('../config/db');

async function getFavorites(req, res, next) {
  try {
    const { lang = 'en' } = req.query;
    const favs = await prisma.userFavorite.findMany({
      where: { userId: req.userId },
      include: { meditation: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const meditations = favs.map(f => formatMeditation(f.meditation, lang));
    res.json({ meditations });
  } catch (err) {
    next(err);
  }
}

async function addFavorite(req, res, next) {
  try {
    await prisma.userFavorite.upsert({
      where: { userId_meditationId: { userId: req.userId, meditationId: req.params.id } },
      update: {},
      create: { userId: req.userId, meditationId: req.params.id },
    });
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    await prisma.userFavorite.deleteMany({
      where: { userId: req.userId, meditationId: req.params.id },
    });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

async function getProgress(req, res, next) {
  try {
    const { lang = 'en' } = req.query;
    const progress = await prisma.userProgress.findMany({
      where: { userId: req.userId },
      include: { meditation: { include: { category: true } } },
      orderBy: { listenedAt: 'desc' },
    });
    const result = progress.map(p => ({
      meditationId: p.meditationId,
      lastPositionSeconds: p.lastPositionSeconds,
      completed: p.completed,
      listenedAt: p.listenedAt,
      meditation: formatMeditation(p.meditation, lang),
    }));
    res.json({ progress: result });
  } catch (err) {
    next(err);
  }
}

const progressSchema = z.object({
  lastPositionSeconds: z.number().int().min(0),
  completed: z.boolean().optional(),
});

async function upsertProgress(req, res, next) {
  try {
    const data = progressSchema.parse(req.body);
    const record = await prisma.userProgress.upsert({
      where: { userId_meditationId: { userId: req.userId, meditationId: req.params.id } },
      update: { lastPositionSeconds: data.lastPositionSeconds, completed: data.completed ?? false, listenedAt: new Date() },
      create: { userId: req.userId, meditationId: req.params.id, ...data },
    });
    res.json({ progress: record });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
}

async function getPreferences(req, res, next) {
  try {
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId: req.userId },
      include: { ambientSound: true },
    });
    res.json({ preferences: prefs || { voiceVolume: 1.0, ambientVolume: 0.4, ambientSoundId: null } });
  } catch (err) {
    next(err);
  }
}

const prefsSchema = z.object({
  ambientSoundId: z.number().int().nullable().optional(),
  voiceVolume:    z.number().min(0).max(1).optional(),
  ambientVolume:  z.number().min(0).max(1).optional(),
});

async function updatePreferences(req, res, next) {
  try {
    const data = prefsSchema.parse(req.body);
    const prefs = await prisma.userPreferences.upsert({
      where: { userId: req.userId },
      update: data,
      create: { userId: req.userId, ...data },
    });
    res.json({ preferences: prefs });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
}

function formatMeditation(m, lang) {
  return {
    id: m.id,
    title: lang === 'he' ? m.titleHe : m.titleEn,
    description: lang === 'he' ? m.descriptionHe : m.descriptionEn,
    instructor: m.instructor,
    durationSeconds: m.durationSeconds,
    audioUrl: m.audioUrl,
    thumbnailUrl: m.thumbnailUrl,
    tags: JSON.parse(m.tags || '[]'),
    category: m.category ? {
      id: m.category.id,
      slug: m.category.slug,
      name: lang === 'he' ? m.category.nameHe : m.category.nameEn,
      icon: m.category.icon,
    } : null,
  };
}

module.exports = { getFavorites, addFavorite, removeFavorite, getProgress, upsertProgress, getPreferences, updatePreferences };
