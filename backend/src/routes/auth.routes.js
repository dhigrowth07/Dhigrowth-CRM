import { Router } from 'express';
import {
  login,
  register,
  getMembers,
  inviteMember,
  removeMember,
  getTenantsDirectory,
  createOrUpdateTenant,
  updateTenantPerms,
  deleteTenant,
} from '../controllers/auth.controller.js';

const router = Router();

/**
 * Authentication, Workspace Members & Super Admin Tenant Directory Routes
 * Handles commercial tenant login/registration, team member invitations,
 * and Super Admin tenant provisioning and granular permission management.
 */

// 1. Authentication & Tenant Onboarding
router.post('/api/auth/login', login);
router.post('/api/auth/register', register);

// 2. Multi-Tenant Workspace Team Members
router.get('/api/workspace/members', getMembers);
router.post('/api/workspace/members/invite', inviteMember);
router.delete('/api/workspace/members/:id', removeMember);

// 3. Super Admin Tenant Directory & Permissions Management
router.get('/api/tenants', getTenantsDirectory);
router.post('/api/tenants', createOrUpdateTenant);
router.put('/api/tenants/:id/permissions', updateTenantPerms);
router.delete('/api/tenants/:id', deleteTenant);

export default router;
