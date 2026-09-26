import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, 'manualAgentStore.json');

let manualStore = {};

function normalizeKey(str) {
  if (!str) return '';
  const digitsOnly = String(str).replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 10) {
    return 'phone_' + digitsOnly.slice(-10);
  }
  return String(str).replace(/[^0-9a-zA-Z_-]/g, '').toLowerCase();
}

export function loadManualStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      manualStore = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[ManualAgentStore] Could not load store:', err.message);
    manualStore = {};
  }
}

export function saveManualStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(manualStore, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[ManualAgentStore] Could not save store:', err.message);
  }
}

loadManualStore();

export function setManualMode({ phone, conversationId, isManual }) {
  const boolVal = Boolean(isManual);
  if (phone) {
    const key = normalizeKey(phone);
    if (key) manualStore[key] = boolVal;
  }
  if (conversationId) {
    const key = normalizeKey(conversationId);
    if (key) manualStore[key] = boolVal;
  }
  saveManualStore();
  console.log(`👤 [ManualAgentStore] Mode updated -> manual=${boolVal} for Phone: "${phone || '-'}" Conv: "${conversationId || '-'}"`);
}

export function isManualMode({ phone, conversationId }) {
  if (phone) {
    const key = normalizeKey(phone);
    if (key && typeof manualStore[key] === 'boolean') {
      return manualStore[key];
    }
  }
  if (conversationId) {
    const key = normalizeKey(conversationId);
    if (key && typeof manualStore[key] === 'boolean') {
      return manualStore[key];
    }
  }
  return false;
}
