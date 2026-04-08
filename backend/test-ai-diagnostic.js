/**
 * AI Feature Diagnostic Script
 * Tests every layer of the AI chat pipeline independently.
 */

const results = [];

function log(label, status, detail = '') {
  const icon = status === 'OK' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  results.push({ label, status, detail });
  console.log(`${icon} [${label}] ${status} ${detail}`);
}

async function run() {
  require('dotenv').config();
  console.log('═══════════════════════════════════════════');
  console.log('  AI FEATURE DIAGNOSTIC');
  console.log('═══════════════════════════════════════════\n');

  // ── 1. ENV VARIABLES ──
  console.log('── 1. Environment Variables ──');
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
  };

  for (const [key, val] of Object.entries(envVars)) {
    if (!val) {
      log(`ENV: ${key}`, 'FAIL', 'Not set');
    } else if (key === 'GEMINI_API_KEY') {
      log(`ENV: ${key}`, 'OK', `${val.substring(0, 10)}...${val.substring(val.length - 4)}`);
    } else if (key === 'DATABASE_URL') {
      // Mask password
      const masked = val.replace(/:([^@]+)@/, ':***@');
      log(`ENV: ${key}`, 'OK', masked);
    } else {
      log(`ENV: ${key}`, 'OK', val);
    }
  }

  // ── 2. DATABASE CONNECTION ──
  console.log('\n── 2. Database Connection ──');
  let prisma;
  try {
    prisma = require('./config/prisma');
    const testResult = await prisma.$queryRawUnsafe('SELECT 1 as test');
    log('DB Connection', 'OK', `Connected to MySQL`);
  } catch (err) {
    log('DB Connection', 'FAIL', err.message.split('\n')[0]);
    console.log('   → Fix: Make sure MySQL is running on the port specified in DATABASE_URL');
  }

  // ── 3. DATABASE TABLES ──
  console.log('\n── 3. Database Tables ──');
  if (prisma) {
    const tables = [
      { name: 'users', query: 'SELECT COUNT(*) as cnt FROM users' },
      { name: 'regions', query: 'SELECT COUNT(*) as cnt FROM regions' },
      { name: 'provinces', query: 'SELECT COUNT(*) as cnt FROM provinces' },
      { name: 'categories', query: 'SELECT COUNT(*) as cnt FROM categories' },
      { name: 'departments', query: 'SELECT COUNT(*) as cnt FROM departments' },
      { name: 'kernel404_transactions', query: 'SELECT COUNT(*) as cnt FROM kernel404_transactions' },
      { name: 'targets', query: 'SELECT COUNT(*) as cnt FROM targets' },
    ];

    for (const t of tables) {
      try {
        const r = await prisma.$queryRawUnsafe(t.query);
        const count = Number(r[0].cnt);
        log(`Table: ${t.name}`, count > 0 ? 'OK' : 'WARN', `${count} rows`);
      } catch (err) {
        log(`Table: ${t.name}`, 'FAIL', 'Table not found or error');
      }
    }
  } else {
    log('Database Tables', 'FAIL', 'Skipped (no DB connection)');
  }

  // ── 4. MODULES ──
  console.log('\n── 4. Module Imports ──');
  const modules = [
    { name: '@google/generative-ai', path: '@google/generative-ai' },
    { name: 'aiService', path: './services/aiService' },
    { name: 'rlsService', path: './services/rlsService' },
    { name: 'authMiddleware', path: './middlewares/authMiddleware' },
  ];

  for (const m of modules) {
    try {
      const mod = require(m.path);
      const exports = Object.keys(mod);
      log(`Module: ${m.name}`, 'OK', `exports: [${exports.join(', ')}]`);
    } catch (err) {
      log(`Module: ${m.name}`, 'FAIL', err.message.split('\n')[0]);
    }
  }

  // ── 5. RLS SERVICE ──
  console.log('\n── 5. RLS Service ──');
  if (prisma) {
    try {
      const { buildRlsFilter } = require('./services/rlsService');
      const adminFilter = await buildRlsFilter({ id: 1, role: 'ADMIN' }, prisma);
      const isAdminFull = Object.keys(adminFilter).length === 0;
      log('RLS: ADMIN filter', isAdminFull ? 'OK' : 'WARN', JSON.stringify(adminFilter));
    } catch (err) {
      log('RLS Service', 'FAIL', err.message.split('\n')[0]);
    }
  } else {
    log('RLS Service', 'FAIL', 'Skipped (no DB connection)');
  }

  // ── 6. GEMINI API ──
  console.log('\n── 6. Gemini API Connection ──');
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      log('Gemini API', 'FAIL', 'No API key');
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent('Say "OK" in one word');
      const text = result.response.text().trim();
      log('Gemini API', 'OK', `Response: "${text.substring(0, 50)}"`);
    }
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('429') || msg.includes('quota')) {
      log('Gemini API', 'FAIL', 'QUOTA EXCEEDED — API key limit reached. Get a new key at https://aistudio.google.com/apikey');
    } else if (msg.includes('401') || msg.includes('API_KEY_INVALID')) {
      log('Gemini API', 'FAIL', 'INVALID API KEY — Check GEMINI_API_KEY in .env');
    } else if (msg.includes('fetch') || msg.includes('ENOTFOUND')) {
      log('Gemini API', 'FAIL', 'NETWORK ERROR — Cannot reach Google API servers');
    } else {
      log('Gemini API', 'FAIL', msg.substring(0, 150));
    }
  }

  // ── 7. FULL INTEGRATION TEST ──
  console.log('\n── 7. Full Integration (chatWithAI) ──');
  if (prisma) {
    try {
      const { chatWithAI } = require('./services/aiService');
      const response = await chatWithAI(
        { id: 1, role: 'ADMIN' },
        'Xin chào, hãy trả lời "OK" bằng một từ.',
        'chat',
        []
      );
      log('chatWithAI()', response.content ? 'OK' : 'WARN', 
        `type=${response.type}, content="${(response.content || '').substring(0, 80)}..."`);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('429') || msg.includes('quota')) {
        log('chatWithAI()', 'FAIL', 'Gemini quota exceeded');
      } else if (msg.includes('database') || msg.includes('connect')) {
        log('chatWithAI()', 'FAIL', 'Database connection error inside AI flow');
      } else {
        log('chatWithAI()', 'FAIL', msg.substring(0, 150));
      }
    }
  } else {
    log('chatWithAI()', 'FAIL', 'Skipped (no DB connection)');
  }

  // ── SUMMARY ──
  console.log('\n═══════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════');
  const fails = results.filter(r => r.status === 'FAIL');
  const warns = results.filter(r => r.status === 'WARN');
  console.log(`✅ Passed: ${results.length - fails.length - warns.length}`);
  console.log(`⚠️  Warnings: ${warns.length}`);
  console.log(`❌ Failed: ${fails.length}`);

  if (fails.length > 0) {
    console.log('\n🔥 FAILURES:');
    fails.forEach(f => console.log(`   - ${f.label}: ${f.detail}`));
  }
  if (warns.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warns.forEach(w => console.log(`   - ${w.label}: ${w.detail}`));
  }

  console.log('\n═══════════════════════════════════════════\n');

  // Cleanup
  if (prisma) await prisma.$disconnect();
  process.exit(fails.length > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Diagnostic crashed:', err);
  process.exit(2);
});
