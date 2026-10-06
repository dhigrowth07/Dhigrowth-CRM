import { env } from '../config/env.js';
import {
  getWorkspaceTemplates,
  syncMetaTemplates,
  createMetaTemplate,
  deleteMetaTemplate,
  updateMetaTemplate,
  submitTemplateForMetaApproval,
  checkMetaTemplateStatus,
} from '../services/campaigns/template.service.js';
import { broadcastTemplateToAll } from '../services/campaigns/broadcast.service.js';

/**
 * GET /api/templates and GET /api/meta/templates
 * Retrieve all registered Meta WhatsApp message templates for a workspace
 */
export function getTemplates(req, res) {
  try {
    const workspaceId =
      req.query.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const templates = getWorkspaceTemplates(workspaceId);
    return res.status(200).json({
      success: true,
      templates,
    });
  } catch (err) {
    console.error('[TemplatesController] Error getting templates:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/templates and POST /api/meta/templates/create
 * Create a new template and sync with Meta Graph API
 */
export async function createTemplate(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const template = await createMetaTemplate({
      workspaceId,
      ...req.body,
    });

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (err) {
    console.error('[TemplatesController] Error creating template:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/templates/sync and POST /api/meta/templates/sync
 * Sync templates with live Meta WhatsApp Cloud API
 */
export async function syncTemplates(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = await syncMetaTemplates({
      workspaceId,
      wabaId: req.body?.wabaId,
      accessToken: req.body?.accessToken,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[TemplatesController] Error syncing templates:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/templates/:id and DELETE /api/meta/templates/:id
 * Delete a template from Meta Cloud API and local catalog
 */
export async function deleteTemplate(req, res) {
  try {
    const templateId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const name = req.body?.name || req.query?.name;

    const result = await deleteMetaTemplate({
      workspaceId,
      name,
      templateId,
      wabaId: req.body?.wabaId,
      accessToken: req.body?.accessToken,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[TemplatesController] Error deleting template:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PUT /api/templates/:id and PUT /api/meta/templates/:id
 * Update template properties and optionally resubmit
 */
export async function updateTemplate(req, res) {
  try {
    const templateId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const updated = await updateMetaTemplate({
      workspaceId,
      templateId,
      updates: req.body,
      wabaId: req.body?.wabaId,
      accessToken: req.body?.accessToken,
    });

    return res.status(200).json({
      success: true,
      template: updated,
    });
  } catch (err) {
    console.error('[TemplatesController] Error updating template:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/templates/:id/submit-approval
 * Submit template directly to Meta for review
 */
export async function submitApproval(req, res) {
  try {
    const templateId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = await submitTemplateForMetaApproval({
      workspaceId,
      templateId,
      wabaId: req.body?.wabaId,
      accessToken: req.body?.accessToken,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[TemplatesController] Error submitting template for approval:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/templates/:id/status
 * Check live template status on Meta
 */
export async function checkStatus(req, res) {
  try {
    const templateId = req.params.id;
    const workspaceId =
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = await checkMetaTemplateStatus({
      workspaceId,
      templateId,
      wabaId: req.query?.wabaId,
      accessToken: req.query?.accessToken,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[TemplatesController] Error checking template status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/templates/broadcast-to-all
 * Broadcast Interactive Template with Reply Button to All Contacts
 */
export async function broadcastTemplateToAllController(req, res) {
  try {
    const {
      templateName,
      contacts,
      headerText,
      bodyText,
      footerText,
      buttons,
      workspaceId = req.body?.workspaceId ||
        req.headers['x-workspace-id'] ||
        env.VITE_DEFAULT_WORKSPACE_ID ||
        'b0000000-0000-0000-0000-000000000001',
    } = req.body || {};

    const summary = await broadcastTemplateToAll({
      templateName,
      contacts,
      headerText,
      bodyText,
      footerText,
      buttons,
      workspaceId,
    });

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (err) {
    console.error('[TemplatesController] Error broadcasting template to all:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Aliases for parity
export const getTemplatesController = getTemplates;
export const createTemplateController = createTemplate;
export const syncTemplatesController = syncTemplates;
export const getTemplateStatusController = checkStatus;
export const syncMetaTemplatesController = syncTemplates;
export const createMetaTemplateController = createTemplate;
export const broadcastTemplatesToAll = broadcastTemplateToAllController;

export default {
  getTemplates,
  createTemplate,
  syncTemplates,
  deleteTemplate,
  updateTemplate,
  submitApproval,
  checkStatus,
  broadcastTemplateToAllController,
  broadcastTemplatesToAll,
  syncMetaTemplatesController,
  createMetaTemplateController,
};

