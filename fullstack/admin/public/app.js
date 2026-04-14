// Admin Panel JavaScript
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

let currentToken = localStorage.getItem('adminToken');
let currentUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
let siteData = {};
let currentModalType = '';
let currentEditId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (currentToken) {
    verifyToken();
  } else {
    showLogin();
  }
  
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Login form
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  
  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      showSection(section);
      
      // Update active nav
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
  
  // Settings form
  document.getElementById('settings-form')?.addEventListener('submit', handleSettingsSave);
}

// Auth Functions
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentToken = data.token;
      currentUser = data.user;
      localStorage.setItem('adminToken', currentToken);
      localStorage.setItem('adminUser', JSON.stringify(currentUser));
      showDashboard();
      loadSiteData();
      showToast('Успешный вход!', 'success');
    } else {
      showToast(data.error || 'Ошибка входа', 'error');
    }
  } catch (e) {
    showToast('Ошибка соединения с сервером', 'error');
  }
}

async function verifyToken() {
  try {
    const response = await fetch(`${API_URL}/admin/verify`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    
    if (response.ok) {
      showDashboard();
      loadSiteData();
    } else {
      handleLogout();
    }
  } catch (e) {
    handleLogout();
  }
}

function handleLogout() {
  currentToken = null;
  currentUser = null;
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  showLogin();
}

// UI Functions
function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
}

function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  
  // Show selected section
  const section = document.getElementById(`section-${sectionName}`);
  if (section) {
    section.classList.remove('hidden');
    document.getElementById('page-title').textContent = getSectionTitle(sectionName);
    
    // Load section data
    switch(sectionName) {
      case 'overview':
        loadStats();
        loadRecentLeads();
        break;
      case 'settings':
        loadSettings();
        break;
      case 'benefits':
        loadBenefits();
        break;
      case 'lawn-types':
        loadLawnTypes();
        break;
      case 'portfolio':
        loadPortfolio();
        break;
      case 'reviews':
        loadReviews();
        break;
      case 'promotions':
        loadPromotions();
        break;
      case 'leads':
        loadLeads();
        break;
      case 'logs':
        loadLogs();
        break;
    }
  }
}

function getSectionTitle(section) {
  const titles = {
    'overview': 'Обзор',
    'settings': 'Настройки',
    'benefits': 'Преимущества',
    'lawn-types': 'Виды газонов',
    'portfolio': 'Портфолио',
    'reviews': 'Отзывы',
    'promotions': 'Акции',
    'leads': 'Заявки',
    'logs': 'Логи'
  };
  return titles[section] || section;
}

// API Functions
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }
  
  const response = await fetch(url, config);
  return response.json();
}

// Load Data Functions
async function loadSiteData() {
  try {
    const data = await apiRequest('/site-data');
    siteData = data;
  } catch (e) {
    console.error('Error loading site data:', e);
  }
}

async function loadStats() {
  try {
    const stats = await apiRequest('/admin/stats');
    document.getElementById('stat-leads').textContent = stats.leads.total;
    document.getElementById('stat-new-leads').textContent = stats.leads.new;
    document.getElementById('stat-reviews').textContent = stats.reviews;
    document.getElementById('stat-portfolio').textContent = stats.portfolio;
  } catch (e) {
    console.error('Error loading stats:', e);
  }
}

async function loadRecentLeads() {
  try {
    const leads = await apiRequest('/admin/leads');
    const recentLeads = leads.slice(-5).reverse();
    
    const container = document.getElementById('recent-leads-list');
    if (recentLeads.length === 0) {
      container.innerHTML = '<p class="empty">Нет заявок</p>';
      return;
    }
    
    container.innerHTML = recentLeads.map(lead => `
      <div class="lead-item">
        <div class="lead-info">
          <h4>${lead.name}</h4>
          <p>${lead.phone}</p>
        </div>
        <span class="lead-date">${formatDate(lead.createdAt)}</span>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading recent leads:', e);
  }
}

async function loadSettings() {
  try {
    const settings = await apiRequest('/admin/settings');
    
    document.getElementById('setting-brand-name').value = settings.brand?.name || '';
    document.getElementById('setting-phone').value = settings.contacts?.phone || '';
    document.getElementById('setting-telegram').value = settings.contacts?.telegram || '';
    document.getElementById('setting-email').value = settings.contacts?.email || '';
    document.getElementById('setting-address').value = settings.contacts?.address || '';
    document.getElementById('setting-workhours').value = settings.contacts?.workHours || '';
    document.getElementById('setting-service-area').value = settings.contacts?.serviceArea || '';
    document.getElementById('setting-price-hydro').value = settings.prices?.hydroseed || '';
    document.getElementById('setting-price-roll').value = settings.prices?.rollLawn || '';
    document.getElementById('setting-seo-title').value = settings.seo?.title || '';
    document.getElementById('setting-seo-desc').value = settings.seo?.description || '';
    document.getElementById('setting-bot-token').value = settings.telegramBotToken || '';
    document.getElementById('setting-chat-id').value = settings.telegramChatId || '';
  } catch (e) {
    console.error('Error loading settings:', e);
  }
}

async function handleSettingsSave(e) {
  e.preventDefault();
  
  const settings = {
    brand: { name: document.getElementById('setting-brand-name').value },
    contacts: {
      phone: document.getElementById('setting-phone').value,
      telegram: document.getElementById('setting-telegram').value,
      email: document.getElementById('setting-email').value,
      address: document.getElementById('setting-address').value,
      workHours: document.getElementById('setting-workhours').value,
      serviceArea: document.getElementById('setting-service-area').value
    },
    prices: {
      hydroseed: parseInt(document.getElementById('setting-price-hydro').value) || 150,
      rollLawn: parseInt(document.getElementById('setting-price-roll').value) || 400
    },
    seo: {
      title: document.getElementById('setting-seo-title').value,
      description: document.getElementById('setting-seo-desc').value
    },
    telegramBotToken: document.getElementById('setting-bot-token').value,
    telegramChatId: document.getElementById('setting-chat-id').value
  };
  
  try {
    await apiRequest('/admin/settings', {
      method: 'PUT',
      body: settings
    });
    showToast('Настройки сохранены!', 'success');
  } catch (e) {
    showToast('Ошибка сохранения', 'error');
  }
}

// Benefits
async function loadBenefits() {
  try {
    const benefits = await apiRequest('/admin/benefits');
    const container = document.getElementById('benefits-list');
    
    container.innerHTML = benefits.map(b => `
      <div class="item-card ${b.active ? '' : 'inactive'}">
        <h4>${b.title}</h4>
        <p>${b.description}</p>
        <div class="item-actions">
          <button class="btn btn-sm btn-secondary" onclick="editItem('benefit', ${b.id})">✏️ Редактировать</button>
          <button class="btn btn-sm ${b.active ? 'btn-secondary' : 'btn-primary'}" onclick="toggleItem('benefits', ${b.id}, ${!b.active})">
            ${b.active ? '👁️ Скрыть' : '👁️ Показать'}
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('benefits', ${b.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading benefits:', e);
  }
}

// Lawn Types
async function loadLawnTypes() {
  try {
    const types = await apiRequest('/admin/lawn-types');
    const container = document.getElementById('lawn-types-list');
    
    container.innerHTML = types.map(t => `
      <div class="item-card ${t.active ? '' : 'inactive'}">
        <h4>${t.title}</h4>
        <p>${t.description}</p>
        <ul class="features">
          ${(t.features || []).map(f => `<li>• ${f}</li>`).join('')}
        </ul>
        <div class="item-actions">
          <button class="btn btn-sm btn-secondary" onclick="editItem('lawn-type', ${t.id})">✏️ Редактировать</button>
          <button class="btn btn-sm ${t.active ? 'btn-secondary' : 'btn-primary'}" onclick="toggleItem('lawn-types', ${t.id}, ${!t.active})">
            ${t.active ? '👁️ Скрыть' : '👁️ Показать'}
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('lawn-types', ${t.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading lawn types:', e);
  }
}

// Portfolio
async function loadPortfolio() {
  try {
    const items = await apiRequest('/admin/portfolio');
    const container = document.getElementById('portfolio-list');
    
    container.innerHTML = items.map(p => `
      <div class="portfolio-item ${p.active ? '' : 'inactive'}">
        <img src="${p.image}" alt="${p.title}" onerror="this.src='/lawn1.jpg'">
        <div class="content">
          <h4>${p.title}</h4>
          <p class="meta">${p.location} • ${p.area}</p>
          <div class="item-actions">
            <button class="btn btn-sm btn-secondary" onclick="editItem('portfolio', ${p.id})">✏️</button>
            <button class="btn btn-sm ${p.active ? 'btn-secondary' : 'btn-primary'}" onclick="toggleItem('portfolio', ${p.id}, ${!p.active})">
              ${p.active ? '👁️' : '👁️'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteItem('portfolio', ${p.id})">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading portfolio:', e);
  }
}

// Reviews
async function loadReviews() {
  try {
    const reviews = await apiRequest('/admin/reviews');
    const container = document.getElementById('reviews-list');
    
    container.innerHTML = reviews.map(r => `
      <div class="item-card ${r.active ? '' : 'inactive'}">
        <div class="rating">
          ${Array(5).fill(0).map((_, i) => `
            <span class="star">${i < r.rating ? '★' : '☆'}</span>
          `).join('')}
        </div>
        <p>"${r.text}"</p>
        <h4>${r.name}</h4>
        <p class="meta">${r.location}</p>
        <div class="item-actions">
          <button class="btn btn-sm btn-secondary" onclick="editItem('review', ${r.id})">✏️ Редактировать</button>
          <button class="btn btn-sm ${r.active ? 'btn-secondary' : 'btn-primary'}" onclick="toggleItem('reviews', ${r.id}, ${!r.active})">
            ${r.active ? '👁️ Скрыть' : '👁️ Показать'}
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('reviews', ${r.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading reviews:', e);
  }
}

// Promotions
async function loadPromotions() {
  try {
    const promotions = await apiRequest('/admin/promotions');
    const container = document.getElementById('promotions-list');
    
    container.innerHTML = promotions.map(p => `
      <div class="item-card ${p.active ? '' : 'inactive'}">
        <h4>${p.title}</h4>
        <p>${p.description}</p>
        <p class="meta">Скидка: ${p.discount}%</p>
        <div class="item-actions">
          <button class="btn btn-sm btn-secondary" onclick="editItem('promotion', ${p.id})">✏️ Редактировать</button>
          <button class="btn btn-sm ${p.active ? 'btn-secondary' : 'btn-primary'}" onclick="toggleItem('promotions', ${p.id}, ${!p.active})">
            ${p.active ? '👁️ Скрыть' : '👁️ Показать'}
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('promotions', ${p.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading promotions:', e);
  }
}

// Leads
async function loadLeads() {
  try {
    const leads = await apiRequest('/admin/leads');
    const tbody = document.getElementById('leads-table-body');
    
    tbody.innerHTML = leads.map(l => `
      <tr>
        <td>${formatDate(l.createdAt)}</td>
        <td>${l.name}</td>
        <td>${l.phone}</td>
        <td>${l.message || '-'}</td>
        <td><span class="status-badge status-${l.status}">${l.status === 'new' ? 'Новая' : 'Обработана'}</span></td>
        <td>
          ${l.status === 'new' ? `
            <button class="btn btn-sm btn-primary" onclick="processLead(${l.id})">✓ Обработать</button>
          ` : '-'}
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Error loading leads:', e);
  }
}

async function processLead(id) {
  try {
    await apiRequest(`/admin/leads/${id}`, {
      method: 'PUT',
      body: { status: 'processed' }
    });
    loadLeads();
    showToast('Заявка обработана', 'success');
  } catch (e) {
    showToast('Ошибка', 'error');
  }
}

// Logs
async function loadLogs() {
  try {
    const logs = await apiRequest('/admin/logs');
    const container = document.getElementById('logs-list');
    
    container.innerHTML = logs.map(l => `
      <div class="log-item">
        <span class="log-time">${formatDateTime(l.timestamp)}</span>
        <span class="log-user">${l.username}</span>
        <span>${l.details}</span>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading logs:', e);
  }
}

// Modal Functions
function openModal(type, id = null) {
  currentModalType = type;
  currentEditId = id;
  
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('modal-form');
  
  modal.classList.remove('hidden');
  
  if (id) {
    title.textContent = 'Редактирование';
    loadModalData(type, id);
  } else {
    title.textContent = 'Добавление';
    form.innerHTML = getModalForm(type);
  }
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  currentModalType = '';
  currentEditId = null;
}

function getModalForm(type) {
  const forms = {
    'benefit': `
      <div class="form-group">
        <label>Заголовок</label>
        <input type="text" name="title" required>
      </div>
      <div class="form-group">
        <label>Описание</label>
        <textarea name="description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Иконка</label>
        <select name="icon">
          <option value="Clock">⏰ Часы</option>
          <option value="Shield">🛡️ Щит</option>
          <option value="Sprout">🌱 Росток</option>
          <option value="Droplets">💧 Капли</option>
          <option value="Leaf">🍃 Лист</option>
          <option value="Award">🏆 Награда</option>
        </select>
      </div>
    `,
    'lawn-type': `
      <div class="form-group">
        <label>Название</label>
        <input type="text" name="title" required>
      </div>
      <div class="form-group">
        <label>Описание</label>
        <textarea name="description" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Особенности (через запятую)</label>
        <input type="text" name="features" placeholder="Особенность 1, Особенность 2">
      </div>
      <div class="form-group">
        <label>Изображение URL</label>
        <input type="text" name="image" placeholder="/lawn1.jpg">
      </div>
    `,
    'portfolio': `
      <div class="form-group">
        <label>Название</label>
        <input type="text" name="title" required>
      </div>
      <div class="form-group">
        <label>Локация</label>
        <input type="text" name="location" placeholder="Пермь">
      </div>
      <div class="form-group">
        <label>Площадь</label>
        <input type="text" name="area" placeholder="500 м²">
      </div>
      <div class="form-group">
        <label>Категория</label>
        <select name="category">
          <option value="private">Частный дом</option>
          <option value="cottage">Коттеджный посёлок</option>
          <option value="landscape">Ландшафтный дизайн</option>
          <option value="sport">Спортивная площадка</option>
        </select>
      </div>
      <div class="form-group">
        <label>Изображение URL</label>
        <input type="text" name="image" placeholder="/lawn1.jpg">
      </div>
    `,
    'review': `
      <div class="form-group">
        <label>Имя</label>
        <input type="text" name="name" required>
      </div>
      <div class="form-group">
        <label>Город</label>
        <input type="text" name="location" placeholder="Пермь">
      </div>
      <div class="form-group">
        <label>Текст отзыва</label>
        <textarea name="text" rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label>Рейтинг</label>
        <select name="rating">
          <option value="5">★★★★★</option>
          <option value="4">★★★★☆</option>
          <option value="3">★★★☆☆</option>
        </select>
      </div>
    `,
    'promotion': `
      <div class="form-group">
        <label>Название акции</label>
        <input type="text" name="title" required>
      </div>
      <div class="form-group">
        <label>Описание</label>
        <textarea name="description" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Скидка (%)</label>
        <input type="number" name="discount" value="15">
      </div>
    `
  };
  return forms[type] || '';
}

async function loadModalData(type, id) {
  const form = document.getElementById('modal-form');
  form.innerHTML = getModalForm(type);
  
  try {
    const endpoint = type === 'lawn-type' ? 'lawn-types' : `${type}s`;
    const items = await apiRequest(`/admin/${endpoint}`);
    const item = items.find(i => i.id === id);
    
    if (item) {
      Object.keys(item).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (key === 'features' && Array.isArray(item[key])) {
            input.value = item[key].join(', ');
          } else {
            input.value = item[key];
          }
        }
      });
    }
  } catch (e) {
    console.error('Error loading modal data:', e);
  }
}

async function saveModal() {
  const form = document.getElementById('modal-form');
  const formData = new FormData(form);
  const data = {};
  
  formData.forEach((value, key) => {
    if (key === 'features') {
      data[key] = value.split(',').map(f => f.trim()).filter(f => f);
    } else if (key === 'rating' || key === 'discount') {
      data[key] = parseInt(value);
    } else {
      data[key] = value;
    }
  });
  
  try {
    const endpoint = currentModalType === 'lawn-type' ? 'lawn-types' : `${currentModalType}s`;
    
    if (currentEditId) {
      await apiRequest(`/admin/${endpoint}/${currentEditId}`, {
        method: 'PUT',
        body: data
      });
      showToast('Обновлено!', 'success');
    } else {
      await apiRequest(`/admin/${endpoint}`, {
        method: 'POST',
        body: data
      });
      showToast('Добавлено!', 'success');
    }
    
    closeModal();
    showSection(getSectionName(currentModalType));
  } catch (e) {
    showToast('Ошибка сохранения', 'error');
  }
}

function getSectionName(type) {
  const map = {
    'benefit': 'benefits',
    'lawn-type': 'lawn-types',
    'portfolio': 'portfolio',
    'review': 'reviews',
    'promotion': 'promotions'
  };
  return map[type] || type;
}

// CRUD Operations
async function editItem(type, id) {
  openModal(type, id);
}

async function toggleItem(type, id, active) {
  try {
    await apiRequest(`/admin/${type}/${id}`, {
      method: 'PUT',
      body: { active }
    });
    showSection(getSectionName(type.replace('s', '')));
    showToast(active ? 'Элемент показан' : 'Элемент скрыт', 'success');
  } catch (e) {
    showToast('Ошибка', 'error');
  }
}

async function deleteItem(type, id) {
  if (!confirm('Удалить этот элемент?')) return;
  
  try {
    await apiRequest(`/admin/${type}/${id}`, {
      method: 'DELETE'
    });
    showSection(getSectionName(type.replace('s', '')));
    showToast('Удалено!', 'success');
  } catch (e) {
    showToast('Ошибка удаления', 'error');
  }
}

// Utilities
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
