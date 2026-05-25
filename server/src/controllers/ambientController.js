const prisma = require('../config/db');

async function list(req, res, next) {
  try {
    const { lang = 'en' } = req.query;
    const sounds = await prisma.ambientSound.findMany({ orderBy: { id: 'asc' } });
    const result = sounds.map(s => ({
      id: s.id,
      name: lang === 'he' ? s.nameHe : s.nameEn,
      audioUrl: s.audioUrl,
      icon: s.icon,
    }));
    res.json({ ambientSounds: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
