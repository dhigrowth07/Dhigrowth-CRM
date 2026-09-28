import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_FILE = path.resolve(__dirname, 'qualificationSessions.json');

const memoryStore = new Map();

function initStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      if (typeof data === 'object' && data !== null) {
        Object.entries(data).forEach(([key, val]) => memoryStore.set(key, val));
      }
    }
  } catch (err) {
    console.warn('[LeadQualificationStore] Error reading file:', err.message);
  }
}

initStore();

function persist() {
  try {
    const obj = {};
    for (const [k, v] of memoryStore.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('[LeadQualificationStore] Error persisting sessions:', err.message);
  }
}

export const getQualificationSession = (identifier) => {
  const cleanId = String(identifier || '').toLowerCase().trim();
  return memoryStore.get(cleanId) || null;
};

export const updateQualificationSession = (identifier, data) => {
  const cleanId = String(identifier || '').toLowerCase().trim();
  const current = memoryStore.get(cleanId) || {};
  const updated = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.set(cleanId, updated);
  persist();
  return updated;
};

export const clearQualificationSession = (identifier) => {
  const cleanId = String(identifier || '').toLowerCase().trim();
  memoryStore.delete(cleanId);
  persist();
};
