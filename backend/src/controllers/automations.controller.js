import { env } from '../config/env.js';
import {
  getWorkspaceAutomations as getWorkspaceAutomationsService,
  createAutomation as createAutomationService,
  updateAutomation as updateAutomationService,
  deleteAutomation as deleteAutomationService,
  toggleAutomationStatus as toggleAutomationStatusService,
  testTriggerAutomation as testTriggerAutomationService,
} from '../services/campaigns/automations.service.js';
import {
  getFollowUpStatus,
  triggerTestFollowUp,
  DELAY_STEP_1_MS,
  DELAY_STEP_2_MS,
} from '../services/campaigns/followUp.service.js';


/**
 * GET /api/automations
 * Retrieve all trigger/action automation rules for a workspace
 */
export async function getAutomations(req, res) {
  try {
    const workspaceId =
      req.query.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const automations = await getWorkspaceAutomationsService(workspaceId);
    return res.status(200).json({
      success: true,
      automations,
    });
  } catch (err) {
    console.error('[AutomationsController] Error getting automations:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/automations
 * Create a new keyword trigger or stage transition automation rule
 */
export async function createAutomationRule(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const { name, description, trigger, triggerCondition, action, actionDetails } = req.body || {};

    if (!name) {
      return res.status(400).json({ success: false, error: 'Rule name is required' });
    }

    const automation = await createAutomationService({
      workspaceId,
      name,
      description,
      trigger,
      triggerCondition,
      action,
      actionDetails,
    });

    return res.status(200).json({
      success: true,
      automation,
    });
  } catch (err) {
    console.error('[AutomationsController] Error creating automation rule:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PUT /api/automations/:id
 * Update an existing automation rule
 */
export async function updateAutomationRule(req, res) {
  try {
    const automationId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const updated = await updateAutomationService(workspaceId, automationId, req.body || {});
    return res.status(200).json({
      success: true,
      automation: updated,
    });
  } catch (err) {
    console.error('[AutomationsController] Error updating automation rule:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/automations/:id
 * Delete an automation rule
 */
export async function deleteAutomationRule(req, res) {
  try {
    const automationId = req.params.id;
    const workspaceId =
      req.query?.workspaceId ||
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = await deleteAutomationService(workspaceId, automationId);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[AutomationsController] Error deleting automation rule:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/automations/:id/toggle
 * Toggle active / paused status of an automation rule
 */
export async function toggleAutomation(req, res) {
  try {
    const automationId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const updated = await toggleAutomationStatusService(workspaceId, automationId);
    return res.status(200).json({
      success: true,
      automation: updated,
    });
  } catch (err) {
    console.error('[AutomationsController] Error toggling automation status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/automations/:id/test
 * Simulate triggering an automation rule in sandbox
 */
export async function testAutomation(req, res) {
  try {
    const automationId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = await testTriggerAutomationService(workspaceId, automationId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[AutomationsController] Error testing automation rule:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/automations/follow-up-status
 * 2-min and 3-hr session keep-alive follow-up status
 */
export function getFollowUpStatusController(req, res) {
  try {
    const { phone } = req.query;
    const status = getFollowUpStatus(phone);
    return res.status(200).json({
      success: true,
      delays: {
        step1: '2 minutes',
        step1Ms: DELAY_STEP_1_MS,
        step2: '3 hours',
        step2Ms: DELAY_STEP_2_MS,
      },
      status,
    });
  } catch (err) {
    console.error('[AutomationsController] Error getting follow up status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/automations/trigger-follow-up
 * Trigger manual test follow-up sequence step
 */
export async function triggerFollowUpController(req, res) {
  try {
    const { phone, step = 1 } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, error: 'phone is required' });
    }
    const result = await triggerTestFollowUp(phone, Number(step));
    return res.status(200).json(result);
  } catch (err) {
    console.error('[AutomationsController] Error triggering follow up:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Aliases for parity
export const getWorkspaceAutomationsController = getAutomations;
export const getAutomationsController = getAutomations;
export const createAutomation = createAutomationRule;
export const createAutomationController = createAutomationRule;
export const updateAutomation = updateAutomationRule;
export const updateAutomationController = updateAutomationRule;
export const deleteAutomation = deleteAutomationRule;
export const deleteAutomationController = deleteAutomationRule;
export const toggleAutomationController = toggleAutomation;
export const testAutomationController = testAutomation;
export const getFollowupStatusController = getFollowUpStatusController;
export const triggerFollowupTestController = triggerFollowUpController;

export default {
  getAutomations,
  getWorkspaceAutomationsController,
  createAutomationRule,
  createAutomation,
  updateAutomationRule,
  updateAutomation,
  deleteAutomationRule,
  deleteAutomation,
  toggleAutomation,
  testAutomation,
  getFollowUpStatusController,
  triggerFollowUpController,
};

