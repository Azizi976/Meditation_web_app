const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'sleep' },   update: {}, create: { slug: 'sleep',   nameEn: 'Sleep',          nameHe: 'שינה',        icon: '🌙' } }),
    prisma.category.upsert({ where: { slug: 'anxiety' }, update: {}, create: { slug: 'anxiety', nameEn: 'Anxiety Relief',  nameHe: 'הפגת חרדה',   icon: '🌊' } }),
    prisma.category.upsert({ where: { slug: 'focus' },   update: {}, create: { slug: 'focus',   nameEn: 'Focus',           nameHe: 'מיקוד',        icon: '🎯' } }),
    prisma.category.upsert({ where: { slug: 'morning' }, update: {}, create: { slug: 'morning', nameEn: 'Morning',         nameHe: 'בוקר',         icon: '☀️' } }),
    prisma.category.upsert({ where: { slug: 'breath' },  update: {}, create: { slug: 'breath',  nameEn: 'Breathwork',      nameHe: 'נשימה',        icon: '💨' } }),
    prisma.category.upsert({ where: { slug: 'body' },    update: {}, create: { slug: 'body',    nameEn: 'Body Scan',       nameHe: 'סריקת גוף',   icon: '🧘' } }),
  ]);

  const [sleep, anxiety, focus, morning, breath, body] = categories;

  // Ambient sounds
  await Promise.all([
    prisma.ambientSound.upsert({ where: { id: 1 }, update: {}, create: { id: 1, nameEn: 'Rain',        nameHe: 'גשם',      audioUrl: '/audio/ambient/rain.mp3',        icon: '🌧️' } }),
    prisma.ambientSound.upsert({ where: { id: 2 }, update: {}, create: { id: 2, nameEn: 'Forest',      nameHe: 'יער',      audioUrl: '/audio/ambient/forest.mp3',      icon: '🌲' } }),
    prisma.ambientSound.upsert({ where: { id: 3 }, update: {}, create: { id: 3, nameEn: 'Ocean',       nameHe: 'ים',       audioUrl: '/audio/ambient/ocean.mp3',       icon: '🌊' } }),
    prisma.ambientSound.upsert({ where: { id: 4 }, update: {}, create: { id: 4, nameEn: 'White Noise', nameHe: 'רעש לבן', audioUrl: '/audio/ambient/white-noise.mp3', icon: '🌫️' } }),
    prisma.ambientSound.upsert({ where: { id: 5 }, update: {}, create: { id: 5, nameEn: 'Fire',        nameHe: 'אש',       audioUrl: '/audio/ambient/fire.mp3',        icon: '🔥' } }),
    prisma.ambientSound.upsert({ where: { id: 6 }, update: {}, create: { id: 6, nameEn: 'Singing Bowl',nameHe: 'קערת שירה',audioUrl: '/audio/ambient/bowl.mp3',        icon: '🔔' } }),
  ]);

  // Meditations
  const meditations = [
    { categoryId: sleep.id,   titleEn: 'Deep Sleep Journey',      titleHe: 'מסע לשינה עמוקה',     descriptionEn: 'Drift into restful sleep with this gentle body-scan meditation.', descriptionHe: 'הירדם בשלווה עם מדיטציה עדינה לסריקת גוף.', instructor: 'Maya Cohen',    durationSeconds: 1200, audioUrl: '/audio/meditations/deep-sleep.mp3',      thumbnailUrl: '/images/sleep.jpg',   tags: JSON.stringify(['sleep','body-scan','night']) },
    { categoryId: anxiety.id, titleEn: 'Calm the Storm',          titleHe: 'הרגע את הסערה',         descriptionEn: 'Release tension and find your calm center.', descriptionHe: 'שחרר מתח ומצא את מרכז השלווה שלך.', instructor: 'David Levy',    durationSeconds: 600,  audioUrl: '/audio/meditations/calm-storm.mp3',      thumbnailUrl: '/images/anxiety.jpg', tags: JSON.stringify(['anxiety','stress','calm']) },
    { categoryId: focus.id,   titleEn: 'Laser Focus',             titleHe: 'מיקוד עמוק',             descriptionEn: 'Sharpen your mind and enter a flow state.', descriptionHe: 'חדד את מוחך וכנס למצב זרימה.', instructor: 'Sarah Katz',    durationSeconds: 900,  audioUrl: '/audio/meditations/laser-focus.mp3',     thumbnailUrl: '/images/focus.jpg',   tags: JSON.stringify(['focus','productivity','mind']) },
    { categoryId: morning.id, titleEn: 'Sunrise Intention',       titleHe: 'כוונת הזריחה',           descriptionEn: 'Set a powerful intention for the day ahead.', descriptionHe: 'הצב כוונה עוצמתית ליום שלפניך.', instructor: 'Maya Cohen',    durationSeconds: 480,  audioUrl: '/audio/meditations/sunrise.mp3',         thumbnailUrl: '/images/morning.jpg', tags: JSON.stringify(['morning','intention','energy']) },
    { categoryId: breath.id,  titleEn: '4-7-8 Breathing',         titleHe: 'נשימת 4-7-8',            descriptionEn: 'The scientifically proven breathing pattern for instant calm.', descriptionHe: 'דפוס הנשימה המוכח מדעית להרגעה מיידית.', instructor: 'Dr. Amir Ben', durationSeconds: 360,  audioUrl: '/audio/meditations/478-breathing.mp3',  thumbnailUrl: '/images/breath.jpg',  tags: JSON.stringify(['breathing','quick','calm']) },
    { categoryId: body.id,    titleEn: 'Full Body Release',        titleHe: 'שחרור גוף מלא',          descriptionEn: 'Melt away tension from head to toe.', descriptionHe: 'מס את המתח מהראש ועד כף הרגל.', instructor: 'Sarah Katz',    durationSeconds: 1500, audioUrl: '/audio/meditations/body-release.mp3',    thumbnailUrl: '/images/body.jpg',    tags: JSON.stringify(['body-scan','relax','tension']) },
    { categoryId: sleep.id,   titleEn: 'Moon Breath',             titleHe: 'נשימת הירח',             descriptionEn: 'Lunar breathing technique for the deepest sleep.', descriptionHe: 'טכניקת נשימת ירח לשינה עמוקה ביותר.', instructor: 'David Levy',    durationSeconds: 1800, audioUrl: '/audio/meditations/moon-breath.mp3',     thumbnailUrl: '/images/moon.jpg',    tags: JSON.stringify(['sleep','breathing','night']) },
    { categoryId: anxiety.id, titleEn: 'Safe Harbor',             titleHe: 'מפרץ בטוח',              descriptionEn: 'Visualization for when anxiety feels overwhelming.', descriptionHe: 'דמיון מודרך כשהחרדה מרגישה מכריעה.', instructor: 'Maya Cohen',    durationSeconds: 720,  audioUrl: '/audio/meditations/safe-harbor.mp3',    thumbnailUrl: '/images/harbor.jpg',  tags: JSON.stringify(['anxiety','visualization','safety']) },
    { categoryId: focus.id,   titleEn: 'Clear Mind Reset',        titleHe: 'איפוס מח צלול',          descriptionEn: 'Clear mental clutter and reset your cognitive baseline.', descriptionHe: 'נקה עומס מנטלי ואפס את קו הבסיס הקוגניטיבי שלך.', instructor: 'Dr. Amir Ben', durationSeconds: 540,  audioUrl: '/audio/meditations/clear-mind.mp3',     thumbnailUrl: '/images/clear.jpg',   tags: JSON.stringify(['focus','clarity','reset']) },
    { categoryId: morning.id, titleEn: 'Gratitude Practice',      titleHe: 'תרגול הכרת תודה',        descriptionEn: 'Begin your day with an open and grateful heart.', descriptionHe: 'התחל את יומך עם לב פתוח ומלא הכרת תודה.', instructor: 'Sarah Katz',    durationSeconds: 600,  audioUrl: '/audio/meditations/gratitude.mp3',       thumbnailUrl: '/images/gratitude.jpg',tags: JSON.stringify(['morning','gratitude','heart']) },
  ];

  for (const m of meditations) {
    await prisma.meditation.create({ data: m });
  }

  // Demo user
  const hash = await bcrypt.hash('demo1234', 12);
  await prisma.user.upsert({
    where: { email: 'demo@calmreflect.app' },
    update: {},
    create: { email: 'demo@calmreflect.app', passwordHash: hash, displayName: 'Demo User', language: 'en' },
  });

  console.log('✅ Database seeded');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
