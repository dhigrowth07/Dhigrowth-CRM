import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');
const STORE_FILE = path.join(DATA_DIR, 'qualificationSessions.json');

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
    console.warn('[LeadQualification] Error reading sessions file:', err.message);
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
    console.error('[LeadQualification] Error persisting sessions:', err.message);
  }
}

/**
 * Get active lead qualification session for a customer phone or ID
 * Automatically expires sessions inactive for > 30 minutes
 *
 * @param {string} identifier Customer phone number or unique identifier
 * @returns {Object|null} Active session data or null
 */
export const getQualificationSession = (identifier) => {
  const cleanId = String(identifier || '').toLowerCase().trim();
  const session = memoryStore.get(cleanId) || null;
  if (session && session.updatedAt) {
    const ageMs = Date.now() - new Date(session.updatedAt).getTime();
    if (ageMs > 30 * 60 * 1000) {
      memoryStore.delete(cleanId);
      persist();
      return null;
    }
  }
  return session;
};

/**
 * Update or create a lead qualification session
 *
 * @param {string} identifier Customer phone number or unique identifier
 * @param {Object} data Session properties to update
 * @returns {Object} Updated session
 */
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

/**
 * Clear a customer's qualification session upon completion or manual reset
 *
 * @param {string} identifier Customer phone number or unique identifier
 */
export const clearQualificationSession = (identifier) => {
  const cleanId = String(identifier || '').toLowerCase().trim();
  memoryStore.delete(cleanId);
  persist();
};

/**
 * Get all active qualification sessions
 *
 * @returns {Array<Object>} List of active sessions
 */
export const getAllQualificationSessions = () => {
  const sessions = [];
  for (const [key, val] of memoryStore.entries()) {
    sessions.push({ identifier: key, ...val });
  }
  return sessions;
};

export default {
  getQualificationSession,
  updateQualificationSession,
  clearQualificationSession,
  getAllQualificationSessions,
};
