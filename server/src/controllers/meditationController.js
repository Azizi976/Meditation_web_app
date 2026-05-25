const prisma = require('../config/db');

async function list(req, res, next) {
  try {
    const { category, lang = 'en', limit = 20, offset = 0, tag } = req.query;

    const where = { isPublished: true };
    if (category) {
      where.category = { slug: category };
    }

    const meditations = await prisma.meditation.findMany({
      where,
      include: { category: true },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
    });

    const result = meditations.map(m => formatMeditation(m, lang));
    const total  = await prisma.meditation.count({ where });

    res.json({ meditations: result, total, limit: Number(limit), offset: Number(offset) });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { lang = 'en' } = req.query;
    const m = await prisma.meditation.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!m) return res.status(404).json({ error: 'Meditation not found' });
    res.json({ meditation: formatMeditation(m, lang) });
  } catch (err) {
    next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    const { lang = 'en' } = req.query;
    const cats = await prisma.category.findMany({ orderBy: { id: 'asc' } });
    const result = cats.map(c => ({
      id: c.id,
      slug: c.slug,
      name: lang === 'he' ? c.nameHe : c.nameEn,
      icon: c.icon,
    }));
    res.json({ categories: result });
  } catch (err) {
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
    createdAt: m.createdAt,
  };
}

module.exports = { list, getById, getCategories };
