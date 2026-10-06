import { Router } from 'express';
import {
  getAutomationsController,
  createAutomationController,
  updateAutomationController,
  deleteAutomationController,
  toggleAutomationController,
  testAutomationController,
  getFollowupStatusController,
  triggerFollowupTestController,
} from '../controllers/automations.controller.js';
import {
  getDripsController,
  createDripController,
  updateDripController,
  deleteDripController,
  toggleDripController,
  testDripController,
  enrollContactController,
} from '../controllers/drips.controller.js';

const router = Router();

/**
 * Automations & Drip Sequences Routes
 * Handles keyword/welcome automation rules, scheduled multi-step drip campaigns,
 * and 24-hour session keep-alive follow-up engine triggers.
 */

// 1. Keyword & Event Automation Rules
router.get('/api/automations', getAutomationsController);
router.post('/api/automations', createAutomationController);
router.put('/api/automations/:id', updateAutomationController);
router.delete('/api/automations/:id', deleteAutomationController);
router.post('/api/automations/:id/toggle', toggleAutomationController);
router.post('/api/automations/test', testAutomationController);

// 2. 24-Hour Keep-Alive Follow-Up Engine Status & Triggers
router.get('/api/followups/status', getFollowupStatusController);
router.post('/api/followups/trigger-test', triggerFollowupTestController);

// 3. Multi-Step Drip Campaigns
router.get('/api/drips', getDripsController);
router.post('/api/drips', createDripController);
router.put('/api/drips/:id', updateDripController);
router.delete('/api/drips/:id', deleteDripController);
router.post('/api/drips/:id/toggle', toggleDripController);
router.post('/api/drips/test', testDripController);
router.post('/api/drips/enroll', enrollContactController);

export default router;
