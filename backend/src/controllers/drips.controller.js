import { env } from '../config/env.js';
import {
  getWorkspaceDrips,
  createDripCampaign,
  updateDripCampaign,
  deleteDripCampaign,
  toggleDripStatus,
  testTriggerDrip,
  enrollContactInDrip,
} from '../services/campaigns/drip.service.js';

/**
 * GET /api/drips
 * Retrieve all automated drip nurturing campaigns for a workspace
 */
export async function getDrips(req, res) {
  try {
    const workspaceId =
      req.query.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const drips = await getWorkspaceDrips(workspaceId);
    return res.status(200).json({
      success: true,
      drips,
    });
  } catch (err) {
    console.error('[DripsController] Error getting drips:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/drips
 * Create a new multi-step automated drip sequence
 */
export async function createDrip(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const { name, category, trigger, delay, steps } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Drip campaign name is required' });
    }

    const drip = await createDripCampaign({
      workspaceId,
      name,
      category,
      trigger,
      delay,
      steps,
      ...(req.body || {}),
    });

    return res.status(200).json({
      success: true,
      drip,
    });
  } catch (err) {
    console.error('[DripsController] Error creating drip:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PUT /api/drips/:id
 * Update an existing drip campaign configuration or step sequence
 */
export async function updateDrip(req, res) {
  try {
    const dripId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const updated = await updateDripCampaign(workspaceId, dripId, req.body || {});
    return res.status(200).json({
      success: true,
      drip: updated,
    });
  } catch (err) {
    console.error('[DripsController] Error updating drip:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/drips/:id
 * Remove a drip campaign sequence
 */
export async function deleteDripController(req, res) {
  try {
    const dripId = req.params.id;
    const workspaceId =
      req.query?.workspaceId ||
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = await deleteDripCampaign(workspaceId, dripId);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[DripsController] Error deleting drip:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/drips/:id/toggle
 * Toggle active / paused status of a drip campaign
 */
export async function toggleDrip(req, res) {
  try {
    const dripId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const drip = await toggleDripStatus(workspaceId, dripId);
    return res.status(200).json({
      success: true,
      drip,
    });
  } catch (err) {
    console.error('[DripsController] Error toggling drip status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/drips/:id/test
 * Test trigger a drip sequence in sandbox mode
 */
export async function testDrip(req, res) {
  try {
    const dripId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = await testTriggerDrip(workspaceId, dripId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[DripsController] Error testing drip:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/drips/:id/enroll
 * Enroll a contact into a drip campaign sequence
 */
export async function enrollContactController(req, res) {
  try {
    const dripId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const contact = req.body?.contact || req.body || {};
    const result = await enrollContactInDrip(workspaceId, dripId, contact);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[DripsController] Error enrolling contact in drip:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Aliases for parity
export const getWorkspaceDripsController = getDrips;
export const getDripsController = getDrips;
export const createDripController = createDrip;
export const updateDripController = updateDrip;
export const deleteDrip = deleteDripController;
export const toggleDripController = toggleDrip;
export const testDripController = testDrip;

export default {
  getDrips,
  getWorkspaceDripsController,
  createDrip,
  updateDrip,
  deleteDripController,
  deleteDrip,
  toggleDrip,
  testDrip,
  enrollContactController,
};
