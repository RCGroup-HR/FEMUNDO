// Test all API endpoints
const BASE = 'http://localhost:4322';
let token = '';
let passed = 0, failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`✅ ${name}`);
  } catch (e) {
    failed++;
    console.log(`❌ ${name}: ${e.message}`);
  }
}

async function api(method, path, body) {
  const opts = { method, headers: {} };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body) {
    opts.body = body;
  }
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`${res.status} - ${JSON.stringify(data)}`);
  return data;
}

// ==== AUTH ====
await test('Login', async () => {
  const d = await api('POST', '/api/auth/login', { email: 'admin@femundo.org', password: 'FemundoAdmin2025!' });
  token = d.token;
  if (!token) throw new Error('No token');
});

await test('GET /api/auth/me', async () => {
  const d = await api('GET', '/api/auth/me');
  if (!d.user) throw new Error('No user');
});

// ==== SECTIONS ====
await test('GET /api/sections/hero', async () => {
  const d = await api('GET', '/api/sections/hero');
  if (!d.data) throw new Error('No data');
});

await test('PUT /api/sections/hero', async () => {
  const hero = (await api('GET', '/api/sections/hero')).data;
  await api('PUT', '/api/sections/hero', hero);
});

await test('GET /api/sections/about', async () => {
  const d = await api('GET', '/api/sections/about');
  if (!d.data) throw new Error('No data');
});

await test('PUT /api/sections/about', async () => {
  const about = (await api('GET', '/api/sections/about')).data;
  await api('PUT', '/api/sections/about', { sections: about });
});

await test('GET /api/sections/stats', async () => {
  const d = await api('GET', '/api/sections/stats');
  if (!d.data) throw new Error('No data');
});

await test('PUT /api/sections/stats', async () => {
  const stats = (await api('GET', '/api/sections/stats')).data;
  await api('PUT', '/api/sections/stats', { statistics: stats });
});

await test('GET /api/sections/video', async () => {
  const d = await api('GET', '/api/sections/video');
  if (!d.data) throw new Error('No data');
});

await test('PUT /api/sections/video', async () => {
  const video = (await api('GET', '/api/sections/video')).data;
  await api('PUT', '/api/sections/video', video);
});

await test('GET /api/sections/contact', async () => {
  const d = await api('GET', '/api/sections/contact');
  if (!d.data) throw new Error('No data');
});

await test('PUT /api/sections/contact', async () => {
  const contact = (await api('GET', '/api/sections/contact')).data;
  await api('PUT', '/api/sections/contact', contact);
});

await test('GET /api/sections/announcement', async () => {
  const d = await api('GET', '/api/sections/announcement');
  if (!d.data) throw new Error('No data');
});

await test('PUT /api/sections/announcement', async () => {
  const ann = (await api('GET', '/api/sections/announcement')).data;
  await api('PUT', '/api/sections/announcement', ann);
});

await test('GET /api/sections/footer', async () => {
  const d = await api('GET', '/api/sections/footer');
  if (!d.data) throw new Error('No data');
});

await test('PUT /api/sections/footer', async () => {
  const footer = (await api('GET', '/api/sections/footer')).data;
  await api('PUT', '/api/sections/footer', { sections: footer });
});

// ==== CAROUSEL ====
await test('GET /api/carousel', async () => {
  const d = await api('GET', '/api/carousel');
  if (!d.data) throw new Error('No data');
});

await test('POST /api/carousel', async () => {
  await api('POST', '/api/carousel', {
    title_es: 'Test Slide', title_en: 'Test Slide EN',
    description_es: 'Desc', description_en: 'Desc EN',
    image_url: '/test.jpg', sort_order: 99, is_active: 1
  });
});

// ==== EVENTS ====
await test('GET /api/events', async () => {
  const d = await api('GET', '/api/events');
  if (!d.data) throw new Error('No data');
});

await test('POST /api/events', async () => {
  await api('POST', '/api/events', {
    title_es: 'Evento Test', title_en: 'Test Event',
    description_es: 'Desc', description_en: 'Desc EN',
    location: 'Test City', start_date: '2025-06-01', status: 'upcoming'
  });
});

// ==== TEAM ====
await test('GET /api/team', async () => {
  const d = await api('GET', '/api/team');
  if (!d.data) throw new Error('No data');
});

await test('POST /api/team', async () => {
  await api('POST', '/api/team', {
    name: 'Test Person', position_es: 'Cargo', position_en: 'Position',
    country: 'Test', category_id: 1, is_active: 1
  });
});

// ==== ARTICLES ====
await test('GET /api/articles?all=true', async () => {
  const d = await api('GET', '/api/articles?all=true');
  if (!d.data) throw new Error('No data');
});

await test('POST /api/articles', async () => {
  await api('POST', '/api/articles', {
    title_es: 'Articulo Test', title_en: 'Test Article',
    content_es: 'Contenido', content_en: 'Content',
    excerpt_es: 'Extracto', excerpt_en: 'Excerpt',
    category: 'test', status: 'draft', is_featured: 0
  });
});

// ==== GALLERY ====
await test('GET /api/gallery', async () => {
  const d = await api('GET', '/api/gallery');
  if (!d.data) throw new Error('No data');
});

await test('POST /api/gallery', async () => {
  await api('POST', '/api/gallery', {
    title_es: 'Album Test', title_en: 'Test Album',
    description_es: 'Desc', description_en: 'Desc EN',
    is_active: 1
  });
});

// ==== NAVIGATION ====
await test('GET /api/navigation', async () => {
  const d = await api('GET', '/api/navigation');
  if (!d.data) throw new Error('No data');
});

await test('PUT /api/navigation', async () => {
  const nav = (await api('GET', '/api/navigation')).data;
  await api('PUT', '/api/navigation', { items: nav });
});

// ==== TRANSLATIONS ====
await test('GET /api/translations', async () => {
  const d = await api('GET', '/api/translations');
  if (!d.data) throw new Error('No data');
});

// ==== SETTINGS ====
await test('GET /api/settings', async () => {
  const d = await api('GET', '/api/settings');
  if (!d.data) throw new Error('No data');
});

await test('PUT /api/settings', async () => {
  const settings = (await api('GET', '/api/settings')).data;
  const payload = {};
  settings.forEach(s => { payload[s.setting_key] = s.setting_value; });
  await api('PUT', '/api/settings', payload);
});

// ==== USERS ====
await test('GET /api/users', async () => {
  const d = await api('GET', '/api/users');
  if (!d.data) throw new Error('No data');
});

// ==== MEDIA ====
await test('GET /api/media', async () => {
  const d = await api('GET', '/api/media');
  if (!d.data) throw new Error('No data');
});

console.log(`\n=============================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`=============================`);
