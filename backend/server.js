const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
require('dotenv').config();

// Переменные для MAX Messenger
const MAX_MESSENGER_TOKEN =
  process.env.MAX_MESSENGER_TOKEN ||
  process.env.MAX_BOT_TOKEN ||
  process.env.BOT_TOKEN ||
  process.env.ADMIN_TOKEN;

const parseIds = (raw) =>
  String(raw || '')
    .replace(/['"`]/g, '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

const MAX_MESSENGER_CHAT_IDS_RAW =
  process.env.MAX_MESSENGER_CHAT_IDS ||
  process.env.MAX_MESSENGER_CHAT_ID ||
  process.env.MAX_CHAT_ID ||
  process.env.ADMIN_CHAT_ID ||
  process.env.MAX_MESENGER_CHAT_ID ||
  '';

const MAX_MESSENGER_USER_IDS_RAW =
  process.env.MAX_MESSENGER_USER_IDS ||
  process.env.MAX_MESSENGER_USER_ID ||
  process.env.MAX_USER_ID ||
  process.env.USER_ID ||
  process.env.ADMIN_USER_ID ||
  '';

const MAX_MESSENGER_CHAT_IDS = parseIds(MAX_MESSENGER_CHAT_IDS_RAW);
const MAX_MESSENGER_USER_IDS = parseIds(MAX_MESSENGER_USER_IDS_RAW);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

console.info('MAX_MESSENGER_TOKEN configured:', !!MAX_MESSENGER_TOKEN);
console.info('MAX_MESSENGER_CHAT_IDS raw:', MAX_MESSENGER_CHAT_IDS_RAW);
console.info('MAX_MESSENGER_CHAT_IDS count:', MAX_MESSENGER_CHAT_IDS.length);
console.info('MAX_MESSENGER_USER_IDS raw:', MAX_MESSENGER_USER_IDS_RAW);
console.info('MAX_MESSENGER_USER_IDS count:', MAX_MESSENGER_USER_IDS.length);
if (MAX_MESSENGER_CHAT_IDS.some((id) => !/^\d+$/.test(id))) {
  console.warn('MAX_MESSENGER_CHAT_IDS contains non-numeric value(s):', MAX_MESSENGER_CHAT_IDS);
}
if (MAX_MESSENGER_USER_IDS.some((id) => !/^\d+$/.test(id))) {
  console.warn('MAX_MESSENGER_USER_IDS contains non-numeric value(s):', MAX_MESSENGER_USER_IDS);
}

// Check required environment variables
if (!JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not set in environment. Server will not start.');
  console.error('Please set JWT_SECRET in Railway environment variables or backend/.env for local development.');
  process.exit(1);
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Слишком много запросов, попробуйте позже' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Слишком много попыток входа, попробуйте через 15 минут' }
});

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const CLIENT_DIST = path.join(__dirname, '..', 'fullstack', 'client', 'dist');
const ADMIN_DIST = path.join(__dirname, '..', 'fullstack', 'admin', 'dist');

async function ensureDirectories() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(path.join(UPLOADS_DIR, 'images'), { recursive: true });
}

// JSON DB helpers
async function readDB(fileName) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, `${fileName}.json`), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

async function writeDB(fileName, data) {
  await fs.writeFile(path.join(DATA_DIR, `${fileName}.json`), JSON.stringify(data, null, 2));
}

// Отправка уведомления в MAX Messenger
async function sendToMaxMessenger({ name, phone, message, createdAt }) {
  if (!MAX_MESSENGER_TOKEN) {
    const warning = 'MAX_MESSENGER_TOKEN is not configured, skipping MAX Messenger notification.';
    console.warn(warning);
    return { success: false, error: warning };
  }

  const timestamp = createdAt
    ? new Date(createdAt).toLocaleString('ru-RU')
    : new Date().toLocaleString('ru-RU');

  const textLines = [
    '🔔 Новая заявка с сайта Газон АкваГрин!',
    '',
    `👤 Имя: ${name}`,
    `📞 Телефон: ${phone}`,
  ];

  if (message) {
    textLines.push(`💬 ${message}`);
  }

  textLines.push(`🕐 ${timestamp}`);

  const text = textLines.join('\n');

  const sendMessageTo = async (type, id) => {
    const url = new URL('https://platform-api.max.ru/messages');
    url.searchParams.set(type, String(parseInt(id, 10)));

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: MAX_MESSENGER_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        notify: true,
        disable_link_preview: false
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    return { id, type, success: true };
  };

  const sendAttempts = async (destinations) =>
    Promise.allSettled(
      destinations.map(async ({ type, id }) => sendMessageTo(type, id))
    );

  const chatDestinations = MAX_MESSENGER_CHAT_IDS.map((id) => ({ type: 'chat_id', id }));
  const userDestinations = MAX_MESSENGER_USER_IDS.map((id) => ({ type: 'user_id', id }));
  let destinations = chatDestinations.length > 0 ? chatDestinations : userDestinations;

  if (destinations.length === 0) {
    const warning = 'MAX_MESSENGER_CHAT_IDS or MAX_MESSENGER_USER_IDS is not configured.';
    console.warn(warning);
    return { success: false, error: warning };
  }

  let results = await sendAttempts(destinations);

  const allChatNotFound =
    chatDestinations.length > 0 &&
    results.every(
      (r) =>
        r.status === 'rejected' &&
        String(r.reason?.message || '').includes('chat.not.found')
    );

  if (allChatNotFound) {
    if (userDestinations.length > 0) {
      console.warn('Chat IDs failed with chat.not.found, retrying with configured user IDs');
      results = await sendAttempts(userDestinations);
    } else {
      console.warn('Chat IDs failed with chat.not.found; retrying same values as user_id');
      const fallbackUserDestinations = chatDestinations.map(({ id }) => ({ type: 'user_id', id }));
      results = await sendAttempts(fallbackUserDestinations);
    }
  }

  const errors = results.filter((r) => r.status === 'rejected');
  if (errors.length > 0) {
    const errorMessages = errors.map((e) => e.reason?.message || String(e.reason));
    console.error(`MAX send failed for ${errors.length} destination(s):`, errorMessages);
    return { success: false, error: errorMessages.join('; ') };
  }

  console.log(`MAX notification sent to ${results.length} destination(s)`);
  return { success: true };
}

// Initialize DB (оставляем без изменений, но убираем telegramBotToken из настроек при желании)
async function initDB() {
  await ensureDirectories();
  
  // Users
  const users = await readDB('users');
  if (!users) {
    const envPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
    const defaultPassword = crypto.createHash('sha256').update(envPassword).digest('hex');
    await writeDB('users', {
      users: [{
        id: 1,
        username: 'admin',
        password: defaultPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      }]
    });
    console.log(`Admin credentials - Username: admin, Password: ${envPassword}`);
    console.log('⚠️  Change ADMIN_PASSWORD in .env for production!');
  } else if (process.env.ADMIN_PASSWORD) {
    // users.json already exists but ADMIN_PASSWORD is set — keep the password in sync
    const envPassword = process.env.ADMIN_PASSWORD;
    const hashedPassword = crypto.createHash('sha256').update(envPassword).digest('hex');
    const adminUser = users.users.find(u => u.username === 'admin');
    if (adminUser && adminUser.password !== hashedPassword) {
      adminUser.password = hashedPassword;
      await writeDB('users', users);
      console.log('Admin password updated to match ADMIN_PASSWORD env var.');
    }
  }
  
  // Settings – убираем telegramBotToken и telegramChatId, если они больше не нужны
  const settings = await readDB('settings');
  if (!settings) {
    await writeDB('settings', {
      brand: { name: 'Газон АкваГрин', logo: null },
      header: {
        phone: '+7 (912) 589-30-09',
        telegram: 'https://max.ru/id5905056440_1_bot',
        whatsapp: null,
        showDiscount: true,
        discountText: 'Скидка 15%'
      },
      hero: {
        title: 'Гидропосев газона',
        subtitle: 'за 2 недели',
        description: 'Идеальный газон без хлопот! Гарантированный всход 95%',
        features: ['Гарантия результата', 'Работаем по договору', 'Бесплатный выезд']
      },
      prices: {
        hydroseed: 150,
        rollLawn: 400,
        hydroseedLabel: 'от 150 ₽/м²',
        rollLawnLabel: 'от 400 ₽/м²'
      },
      contacts: {
        phone: '+7 (912) 589-30-09',
        email: null,
        telegram: 'https://max.ru/id5905056440_1_bot',
        address: 'Пермь, с. Култаево',
        workHours: 'Пн-Сб: 9:00 - 20:00',
        serviceArea: 'Пермь и Пермский край'
      },
      seo: {
        title: 'Газон АкваГрин - Гидропосев газона в Перми',
        description: 'Профессиональный гидропосев газона с гарантией 95%',
        keywords: 'гидропосев, газон, Пермь'
      },
      analytics: { yandexMetrika: null, googleAnalytics: null }
      // telegramBotToken и telegramChatId удалены
    });
  }
  
  // Benefits, Lawn Types, Reviews, Portfolio, Promotions, Steps – без изменений
  const benefits = await readDB('benefits');
  if (!benefits) {
    await writeDB('benefits', {
      benefits: [
        { id: 1, icon: 'Clock', title: 'Всего 2 недели', description: 'Первые всходы через 5-7 дней', active: true },
        { id: 2, icon: 'Shield', title: 'Гарантия 95%', description: 'Гарантированный всход семян', active: true },
        { id: 3, icon: 'Sprout', title: 'Ровный газон', description: 'Идеально ровное покрытие', active: true },
        { id: 4, icon: 'Droplets', title: 'Экономия воды', description: 'В 3 раза меньше воды', active: true },
        { id: 5, icon: 'Leaf', title: 'Удобрения в составе', description: 'Мульча и питание в смеси', active: true },
        { id: 6, icon: 'Award', title: 'Без пересадки', description: 'Корни уходят глубоко сразу', active: true }
      ]
    });
  }
  
  const lawnTypes = await readDB('lawnTypes');
  if (!lawnTypes) {
    await writeDB('lawnTypes', {
      types: [
        { id: 1, title: 'Партерные газоны', description: 'Декоративные газоны для элитных ландшафтов', features: ['Переносит тень', 'Овсяница красная'], image: '/lawn1.jpg', active: true },
        { id: 2, title: 'Садово-парковый газон', description: 'Универсальный газон для садов', features: ['Среднеплодородная почва', 'Переносит вытаптывание'], image: '/lawn2.jpg', active: true },
        { id: 3, title: 'Мавританский газон', description: 'Пестроцветный газон', features: ['Разноцветные цветы', 'Минимальный уход'], image: '/lawn3.jpg', active: true },
        { id: 4, title: 'Луговой газон', description: 'Натуральный луговой газон', features: ['Минимальный уход', 'Засухоустойчивость'], image: '/lawn4.jpg', active: true },
        { id: 5, title: 'Спортивный газон', description: 'Прочный газон для спорта', features: ['Высокая износостойкость'], image: '/lawn2.jpg', active: true },
        { id: 6, title: 'Теневыносливый газон', description: 'Для затененных участков под деревьями', features: ['Овсяница теневыносливая', 'Мятлик луговой', 'Устойчив к полутени'], image: '/lawn5.jpg', active: true }
      ]
    });
  }
  
  const reviews = await readDB('reviews');
  if (!reviews) {
    await writeDB('reviews', {
      reviews: [
        { id: 1, name: 'Александр Петров', location: 'Пермь', text: 'Результат превзошёл ожидания!', rating: 5, active: true },
        { id: 2, name: 'Елена Смирнова', location: 'с. Култаево', text: 'Быстро, качественно!', rating: 5, active: true },
        { id: 3, name: 'Дмитрий Иванов', location: 'Пермь', text: 'Гидропосев вышел дешевле!', rating: 5, active: true }
      ]
    });
  }
  
  const portfolio = await readDB('portfolio');
  if (!portfolio) {
    await writeDB('portfolio', {
      items: [
        { id: 1, title: 'Частный дом', location: 'Пермь', area: '500 м²', category: 'private', image: '/lawn1.jpg', active: true },
        { id: 2, title: 'Коттеджный посёлок', location: 'Култаево', area: '1200 м²', category: 'cottage', image: '/lawn2.jpg', active: true },
        { id: 3, title: 'Ландшафтный дизайн', location: 'Пермь', area: '800 м²', category: 'landscape', image: '/lawn3.jpg', active: true },
        { id: 4, title: 'Спортивная площадка', location: 'Пермь', area: '600 м²', category: 'sport', image: '/lawn4.jpg', active: true }
      ]
    });
  }
  
  const promotions = await readDB('promotions');
  if (!promotions) {
    await writeDB('promotions', {
      promotions: [
        { id: 1, title: 'Скидка 15%', description: 'При заказе до конца месяца', discount: 15, startDate: null, endDate: null, active: true, isDefault: true }
      ]
    });
  }
  
  const steps = await readDB('steps');
  if (!steps) {
    await writeDB('steps', {
      steps: [
        { id: 1, number: '01', title: 'Подготовка почвы', description: 'Очистка, выравнивание, удобрения', active: true },
        { id: 2, number: '02', title: 'Нанесение смеси', description: 'Гидропосев семян и мульчи', active: true },
        { id: 3, number: '03', title: 'Полив и уход', description: 'Регулярный полив 2 недели', active: true },
        { id: 4, number: '04', title: 'Готовый газон', description: 'Густое зелёное покрытие', active: true }
      ]
    });
  }
  
  console.log('Database initialized');
}

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
}

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOADS_DIR, 'images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Только изображения'));
  }
});

// ============ PUBLIC API ============

app.get('/api/site-data', async (req, res) => {
  try {
    const [settings, benefits, lawnTypes, reviews, portfolio, promotions, steps] = await Promise.all([
      readDB('settings'), readDB('benefits'), readDB('lawnTypes'),
      readDB('reviews'), readDB('portfolio'), readDB('promotions'), readDB('steps')
    ]);
    
    res.json({
      settings: settings || {},
      benefits: (benefits?.benefits || []).filter(b => b.active),
      lawnTypes: (lawnTypes?.types || []).filter(t => t.active),
      reviews: (reviews?.reviews || []).filter(r => r.active),
      portfolio: (portfolio?.items || []).filter(p => p.active),
      promotions: (promotions?.promotions || []).filter(p => p.active),
      steps: (steps?.steps || []).filter(s => s.active)
    });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await readDB('settings');
    res.json(settings || {});
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Имя и телефон обязательны' });
    }
    
    const leads = await readDB('leads') || { leads: [] };
    const newLead = {
      id: Date.now(),
      name,
      phone,
      message: message || null,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    leads.leads.push(newLead);
    await writeDB('leads', leads);
    
    const maxResult = await sendToMaxMessenger({
      name,
      phone,
      message,
      createdAt: newLead.createdAt
    });

    if (!maxResult.success) {
      console.error('MAX messenger error:', maxResult.error);
      return res.json({
        success: true,
        message: 'Заявка принята',
        warning: 'Уведомление MAX не отправлено',
        details: maxResult.error
      });
    }
    
    res.json({ success: true, message: 'Заявка принята' });
  } catch (e) {
    console.error('Lead submission error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.use('/uploads', express.static(UPLOADS_DIR));

// ============ ADMIN API (без изменений) ============

app.post('/api/admin/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }
    
    const users = await readDB('users');
    const user = users?.users?.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const logs = await readDB('logs') || { logs: [] };
    logs.logs.push({ id: Date.now(), userId: user.id, username: user.username, action: 'login', details: 'Вход', timestamp: new Date().toISOString() });
    await writeDB('logs', logs);
    
    res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const [leads, reviews, portfolio, promotions] = await Promise.all([
      readDB('leads'), readDB('reviews'), readDB('portfolio'), readDB('promotions')
    ]);
    
    res.json({
      leads: { total: leads?.leads?.length || 0, new: leads?.leads?.filter(l => l.status === 'new').length || 0 },
      reviews: reviews?.reviews?.length || 0,
      portfolio: portfolio?.items?.length || 0,
      promotions: promotions?.promotions?.length || 0
    });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Settings
app.get('/api/admin/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await readDB('settings');
    res.json(settings || {});
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/admin/settings', authenticateToken, async (req, res) => {
  try {
    const current = await readDB('settings') || {};
    const updated = { ...current, ...req.body };
    await writeDB('settings', updated);
    
    const logs = await readDB('logs') || { logs: [] };
    logs.logs.push({ id: Date.now(), userId: req.user.userId, username: req.user.username, action: 'update_settings', details: 'Обновление настроек', timestamp: new Date().toISOString() });
    await writeDB('logs', logs);
    
    res.json({ success: true, settings: updated });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Benefits
app.get('/api/admin/benefits', authenticateToken, async (req, res) => {
  try {
    const benefits = await readDB('benefits');
    res.json(benefits?.benefits || []);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/admin/benefits', authenticateToken, async (req, res) => {
  try {
    const benefits = await readDB('benefits') || { benefits: [] };
    const newItem = { id: Date.now(), ...req.body, active: true };
    benefits.benefits.push(newItem);
    await writeDB('benefits', benefits);
    res.json({ success: true, benefit: newItem });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/admin/benefits/:id', authenticateToken, async (req, res) => {
  try {
    const benefits = await readDB('benefits');
    const index = benefits.benefits.findIndex(b => b.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Не найдено' });
    benefits.benefits[index] = { ...benefits.benefits[index], ...req.body };
    await writeDB('benefits', benefits);
    res.json({ success: true, benefit: benefits.benefits[index] });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/admin/benefits/:id', authenticateToken, async (req, res) => {
  try {
    const benefits = await readDB('benefits');
    benefits.benefits = benefits.benefits.filter(b => b.id != req.params.id);
    await writeDB('benefits', benefits);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Lawn Types
app.get('/api/admin/lawn-types', authenticateToken, async (req, res) => {
  try {
    const types = await readDB('lawnTypes');
    res.json(types?.types || []);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/admin/lawn-types', authenticateToken, async (req, res) => {
  try {
    const types = await readDB('lawnTypes') || { types: [] };
    const newItem = { id: Date.now(), ...req.body, active: true };
    types.types.push(newItem);
    await writeDB('lawnTypes', types);
    res.json({ success: true, type: newItem });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/admin/lawn-types/:id', authenticateToken, async (req, res) => {
  try {
    const types = await readDB('lawnTypes');
    const index = types.types.findIndex(t => t.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Не найдено' });
    types.types[index] = { ...types.types[index], ...req.body };
    await writeDB('lawnTypes', types);
    res.json({ success: true, type: types.types[index] });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/admin/lawn-types/:id', authenticateToken, async (req, res) => {
  try {
    const types = await readDB('lawnTypes');
    types.types = types.types.filter(t => t.id != req.params.id);
    await writeDB('lawnTypes', types);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Reviews
app.get('/api/admin/reviews', authenticateToken, async (req, res) => {
  try {
    const reviews = await readDB('reviews');
    res.json(reviews?.reviews || []);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/admin/reviews', authenticateToken, async (req, res) => {
  try {
    const reviews = await readDB('reviews') || { reviews: [] };
    const newItem = { id: Date.now(), ...req.body, active: true };
    reviews.reviews.push(newItem);
    await writeDB('reviews', reviews);
    res.json({ success: true, review: newItem });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/admin/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const reviews = await readDB('reviews');
    const index = reviews.reviews.findIndex(r => r.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Не найдено' });
    reviews.reviews[index] = { ...reviews.reviews[index], ...req.body };
    await writeDB('reviews', reviews);
    res.json({ success: true, review: reviews.reviews[index] });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/admin/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const reviews = await readDB('reviews');
    reviews.reviews = reviews.reviews.filter(r => r.id != req.params.id);
    await writeDB('reviews', reviews);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Portfolio
app.get('/api/admin/portfolio', authenticateToken, async (req, res) => {
  try {
    const portfolio = await readDB('portfolio');
    res.json(portfolio?.items || []);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/admin/portfolio', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const portfolio = await readDB('portfolio') || { items: [] };
    const newItem = {
      id: Date.now(),
      ...req.body,
      image: req.file ? `/uploads/images/${req.file.filename}` : req.body.image,
      active: true
    };
    portfolio.items.push(newItem);
    await writeDB('portfolio', portfolio);
    res.json({ success: true, item: newItem });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/admin/portfolio/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const portfolio = await readDB('portfolio');
    const index = portfolio.items.findIndex(p => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Не найдено' });
    portfolio.items[index] = { 
      ...portfolio.items[index], 
      ...req.body,
      image: req.file ? `/uploads/images/${req.file.filename}` : (req.body.image || portfolio.items[index].image)
    };
    await writeDB('portfolio', portfolio);
    res.json({ success: true, item: portfolio.items[index] });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/admin/portfolio/:id', authenticateToken, async (req, res) => {
  try {
    const portfolio = await readDB('portfolio');
    portfolio.items = portfolio.items.filter(p => p.id != req.params.id);
    await writeDB('portfolio', portfolio);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Promotions
app.get('/api/admin/promotions', authenticateToken, async (req, res) => {
  try {
    const promotions = await readDB('promotions');
    res.json(promotions?.promotions || []);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/admin/promotions', authenticateToken, async (req, res) => {
  try {
    const promotions = await readDB('promotions') || { promotions: [] };
    const newItem = { id: Date.now(), ...req.body, active: true };
    promotions.promotions.push(newItem);
    await writeDB('promotions', promotions);
    res.json({ success: true, promotion: newItem });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/admin/promotions/:id', authenticateToken, async (req, res) => {
  try {
    const promotions = await readDB('promotions');
    const index = promotions.promotions.findIndex(p => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Не найдено' });
    promotions.promotions[index] = { ...promotions.promotions[index], ...req.body };
    await writeDB('promotions', promotions);
    res.json({ success: true, promotion: promotions.promotions[index] });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/admin/promotions/:id', authenticateToken, async (req, res) => {
  try {
    const promotions = await readDB('promotions');
    promotions.promotions = promotions.promotions.filter(p => p.id != req.params.id);
    await writeDB('promotions', promotions);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Leads
app.get('/api/admin/leads', authenticateToken, async (req, res) => {
  try {
    const leads = await readDB('leads');
    res.json(leads?.leads || []);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/admin/leads/:id', authenticateToken, async (req, res) => {
  try {
    const leads = await readDB('leads');
    const index = leads.leads.findIndex(l => l.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Не найдено' });
    leads.leads[index] = { ...leads.leads[index], ...req.body };
    await writeDB('leads', leads);
    res.json({ success: true, lead: leads.leads[index] });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Logs
app.get('/api/admin/logs', authenticateToken, async (req, res) => {
  try {
    const logs = await readDB('logs');
    res.json((logs?.logs || []).slice(-100).reverse());
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Upload
app.post('/api/admin/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  res.json({ success: true, url: `/uploads/images/${req.file.filename}` });
});

// Serve built client and admin static files after all API routes
app.use('/admin', express.static(ADMIN_DIST));
app.use(express.static(CLIENT_DIST));

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(ADMIN_DIST, 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Внутренняя ошибка' });
});

// Start
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
  });
});
