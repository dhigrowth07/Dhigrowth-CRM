import { env } from '../config/env.js';
import {
  getAiConfigForWorkspace,
  getActiveAiConfig,
  saveActiveAiConfig,
  testAiConnection,
  generateAIResponse,
  SITARC_WELCOME,
} from '../services/ai/ai.service.js';
import { translateText } from '../utils/translate.js';
import { sendLeadToGoogleSheets } from '../services/crm/googleSheets.service.js';

/**
 * GET /api/ai-config
 * Retrieve active AI model, provider, and system prompt configuration
 */
export function getAIConfig(req, res) {
  try {
    const workspaceId =
      req.query.workspaceId ||
      req.headers['x-workspace-id'] ||
      req.query.tenant ||
      req.query.username ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const config = workspaceId ? getAiConfigForWorkspace(workspaceId) : getActiveAiConfig();
    return res.status(200).json({
      success: true,
      config,
    });
  } catch (err) {
    console.error('[AIController] Error getting AI config:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/ai-config
 * Update active AI provider (Gemini, Groq, OpenAI), API keys, model, and system prompt
 */
export async function updateAIConfig(req, res) {
  try {
    const {
      provider,
      apiKey,
      model,
      systemPrompt,
      updatedBy = 'user',
      workspaceId,
      tenantId,
    } = req.body || {};

    const targetWs =
      workspaceId ||
      tenantId ||
      req.headers['x-workspace-id'] ||
      req.query.workspaceId ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const saved = await saveActiveAiConfig({
      provider,
      apiKey,
      model,
      systemPrompt,
      updatedBy,
      workspaceId: targetWs,
      tenantId,
    });

    const provName = saved?.provider || provider || 'gemini';
    const modelName = saved?.model || model || 'gemini-1.5-flash';

    return res.status(200).json({
      success: true,
      message: `AI Engine updated successfully to ${String(provName).toUpperCase()} (${modelName})!`,
      config: {
        provider: provName,
        model: modelName,
        hasKey: Boolean(saved?.apiKey),
        maskedKey: saved?.apiKey ? `${saved.apiKey.slice(0, 7)}...${saved.apiKey.slice(-4)}` : '',
        systemPrompt: saved?.systemPrompt || systemPrompt || '',
        updatedAt: saved?.updatedAt || new Date().toISOString(),
        isTenantSpecific: Boolean(saved?.isTenantSpecific),
      },
    });
  } catch (err) {
    console.error('[AIController] Error updating AI config:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/ai-test & POST /api/ai-config/test
 * Test connection to configured AI LLM provider sandbox
 */
export async function testAIConnectionController(req, res) {
  try {
    const { provider, apiKey, model, testPrompt } = req.body || {};
    const result = await testAiConnection({ provider, apiKey, model, testPrompt });

    return res.status(200).json({
      success: true,
      data: result,
      message: `Connected successfully to ${(result?.provider || 'AI').toUpperCase()} (${result?.model || 'model'}) in ${result?.latencyMs || 0}ms!`,
    });
  } catch (err) {
    console.error('[AIController] AI test connection error:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/translate
 * Multilingual Translation Proxy with dual Google mirror failover
 */
export async function translateTextController(req, res) {
  try {
    const { text, targetLang, targetLangCode, sourceLang = 'auto' } = req.body || {};
    const lang = targetLang || targetLangCode || 'hi';

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text is required for translation' });
    }

    const result = await translateText({
      text,
      targetLang: lang,
      sourceLang,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[AIController] Translation error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/ai/generate & POST /api/ai-config/generate
 * Dynamic AI response generation on-demand with automatic Google Sheets lead sync
 */
export async function generateAIResponseController(req, res) {
  try {
    const {
      customerMessage,
      customerName = 'Valued Client',
      channelType = 'whatsapp',
      phone = '',
      workspaceId,
      businessPhone = '',
      phoneNumberId = '',
      service,
      purpose,
    } = req.body || {};

    if (!customerMessage) {
      return res.status(400).json({ success: false, error: 'customerMessage is required' });
    }

    // Strict detection for Si'Tarc tenant
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    const cleanBizPhone = String(businessPhone || '').replace(/[^0-9]/g, '');
    const isSitarc =
      workspaceId === 'b0000000-0000-0000-0000-000000000002' ||
      String(workspaceId || '').toLowerCase().includes('sitarc') ||
      phoneNumberId === '1399911839867541' ||
      cleanBizPhone.includes('9487580473') ||
      cleanPhone.includes('9487580473');

    const resolvedWsId = isSitarc
      ? 'b0000000-0000-0000-0000-000000000002'
      : workspaceId || env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001';

    const result = await generateAIResponse({
      customerName,
      customerMessage,
      channelType,
      workspaceId: resolvedWsId,
      phoneNumberId: isSitarc ? '1399911839867541' : phoneNumberId,
      businessPhone: isSitarc ? '9487580473' : businessPhone,
      customerPhone: phone,
    });

    let replyText = typeof result === 'object' && result?.reply ? result.reply : String(result);
    let imageUrl = typeof result === 'object' && result?.imageUrl ? result.imageUrl : null;

    if (isSitarc) {
      if (
        replyText.toLowerCase().includes('dhigrowth') ||
        replyText.toLowerCase().includes('app development') ||
        replyText.toLowerCase().includes('crm & automation')
      ) {
        replyText = SITARC_WELCOME?.reply || replyText;
      }
      if (!imageUrl || imageUrl.toLowerCase().includes('dhigrowth')) {
        imageUrl = 'https://www.sitarc.com/images/logo.png';
      }
    }

    // Automatically record customer interest and details to Google Sheets
    const lower = String(customerMessage || '').toLowerCase();
    let detectedService =
      service || (isSitarc ? "Si'Tarc Testing & Calibration Laboratory" : 'DhiGrowth IT Services');

    if (isSitarc) {
      if (lower.includes('pump') || lower.includes('motor') || lower === '1') {
        detectedService = 'Pump & Motor Testing (IS Standards)';
      } else if (lower.includes('calib') || lower.includes('gauge') || lower === '2') {
        detectedService = 'Calibration Services (NABL / ISO 17025)';
      } else if (lower.includes('chemical') || lower.includes('mechanical') || lower === '3') {
        detectedService = 'Electrical, Chemical & Mechanical Testing';
      } else if (lower.includes('water') || lower.includes('food') || lower === '4') {
        detectedService = 'Water & Food Testing';
      }
    } else {
      if (
        lower.includes('app') ||
        lower.includes('mobile') ||
        lower.includes('flutter') ||
        lower.includes('ios') ||
        lower.includes('android') ||
        lower === '1'
      ) {
        detectedService = 'Mobile App & Web Development';
      } else if (
        lower.includes('ai') ||
        lower.includes('bot') ||
        lower.includes('autopilot') ||
        lower.includes('auto-pilot') ||
        lower === '2'
      ) {
        detectedService = 'AI Business Solutions & Auto-Pilot Bots';
      } else if (
        lower.includes('whatsapp') ||
        lower.includes('crm') ||
        lower.includes('broadcast') ||
        lower === '3'
      ) {
        detectedService = 'WhatsApp CRM & Marketing Automation';
      } else if (
        lower.includes('software') ||
        lower.includes('custom') ||
        lower.includes('enterprise') ||
        lower === '4'
      ) {
        detectedService = 'Custom IT Software & Enterprise Systems';
      } else if (
        lower.includes('interested') ||
        lower.includes('yes') ||
        lower.includes('demo') ||
        lower.includes('sure')
      ) {
        detectedService = 'App Development, AI Auto-Pilot & WhatsApp CRM';
      }
    }

    const validPhone = phone ? String(phone).trim() : '';
    const validName =
      customerName && customerName !== 'Valued Client' && customerName !== 'Instagram User'
        ? customerName
        : '';

    if (validPhone || validName) {
      sendLeadToGoogleSheets({
        name: validName || 'Anonymous Customer',
        phone: validPhone,
        service: detectedService,
        purpose:
          purpose ||
          (lower.includes('interested') ? `Customer confirmed interest: "${customerMessage}"` : customerMessage),
        channel: channelType === 'instagram' ? 'Instagram' : 'WhatsApp',
        workspaceId: resolvedWsId,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      })
        .then((sheetRes) => {
          console.log(
            `📊 [AutoSync Sheets] Lead recorded to Google Sheet: ${validName || 'Client'} (${validPhone}) - Success: ${sheetRes?.success}`
          );
        })
        .catch((sheetErr) => {
          console.warn(`⚠️ [AutoSync Sheets] Error:`, sheetErr.message);
        });
    }

    const buttons = typeof result === 'object' && Array.isArray(result.buttons) ? result.buttons : [];

    return res.status(200).json({
      success: true,
      reply: replyText,
      imageUrl,
      buttons,
      leadSynced: Boolean(validPhone || validName),
    });
  } catch (err) {
    console.error('[AIController] AI Generate Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Aliases for parity
export const testAI = testAIConnectionController;
export const testAiConfig = testAIConnectionController;
export const testAIConnection = testAIConnectionController;
export const handleAiGenerate = generateAIResponseController;
export const generateAIResponseHandler = generateAIResponseController;
export const translate = translateTextController;
export const translateTextHandler = translateTextController;

export default {
  getAIConfig,
  updateAIConfig,
  testAIConnectionController,
  testAI,
  testAiConfig,
  translateTextController,
  translate,
  generateAIResponseController,
  handleAiGenerate,
};
