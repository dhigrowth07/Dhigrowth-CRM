import { env } from '../config/env.js';
import {
  loginTenant,
  registerTenant,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  removeWorkspaceMember,
  loadTenants,
  upsertTenant,
  updateTenantPermissions,
  deleteTenantRecord,
} from '../services/auth/auth.service.js';

// =========================================================================
// 1. Authentication Handlers
// =========================================================================

/**
 * POST /api/auth/login
 * User and tenant login with multi-tier fallback (Super Admin, Sri, Si'Tarc, tenants.json, Supabase)
 */
export async function login(req, res) {
  try {
    const { email, username, password } = req.body || {};

    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email or Username, and Password are required.',
      });
    }

    const result = await loginTenant({ email, username, password });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[AuthController] Login error:', err.message);
    return res.status(401).json({
      success: false,
      error: err.message || 'Invalid email or password.',
    });
  }
}

/**
 * POST /api/auth/register
 * New commercial tenant onboarding (Company, Workspace, Admin, Wallet)
 */
export async function register(req, res) {
  try {
    const { fullName, companyName, email, phone, password } = req.body || {};

    if (!fullName || !companyName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full Name, Company Name, Email, and Password are all required.',
      });
    }

    const result = await registerTenant({
      fullName,
      companyName,
      email,
      phone,
      password,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[AuthController] Registration error:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to complete tenant registration.',
    });
  }
}

// =========================================================================
// 2. Workspace Team Members Handlers
// =========================================================================

/**
 * GET /api/workspace/members
 * Retrieve all team members for a workspace
 */
export async function getMembers(req, res) {
  try {
    const workspaceId =
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const members = await getWorkspaceMembers(workspaceId);
    return res.status(200).json({
      success: true,
      members,
    });
  } catch (err) {
    console.error('[AuthController] Error getting members:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/workspace/members/invite & POST /api/workspace/members
 * Invite a new agent or manager to workspace
 */
export async function inviteMember(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const { fullName, email, role, phone } = req.body || {};

    if (!fullName || !email) {
      return res.status(400).json({ success: false, error: 'Full name and email are required.' });
    }

    const member = await inviteWorkspaceMember({
      workspaceId,
      fullName,
      email,
      role: role || 'agent',
      phone: phone || '',
    });

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (err) {
    console.error('[AuthController] Error inviting member:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/workspace/members/:id
 * Remove a team member from workspace
 */
export async function removeMember(req, res) {
  try {
    const memberId = req.params.id;
    const workspaceId =
      req.query?.workspaceId ||
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = await removeWorkspaceMember(memberId, workspaceId);
    return res.status(200).json({
      success: true,
      message: 'Team member removed from workspace.',
      ...result,
    });
  } catch (err) {
    console.error('[AuthController] Error removing member:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// =========================================================================
// 3. Super Admin Tenant Provisioning Handlers
// =========================================================================

/**
 * GET /api/tenants
 * Retrieve all registered tenant configurations from data/tenants.json
 */
export function getTenants(req, res) {
  try {
    const list = loadTenants();
    return res.status(200).json({
      success: true,
      tenants: list,
    });
  } catch (err) {
    console.error('[AuthController] Error getting tenants:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/tenants
 * Provision or update tenant record in cloud directory
 */
export function createOrUpdateTenant(req, res) {
  try {
    const newTenant = req.body;
    if (!newTenant || !newTenant.username) {
      return res.status(400).json({ success: false, error: 'Tenant username is required' });
    }

    const tenant = upsertTenant(newTenant);
    return res.status(200).json({
      success: true,
      message: `Tenant "${tenant.name || tenant.username}" saved!`,
      tenant,
    });
  } catch (err) {
    console.error('[AuthController] Error saving tenant:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/tenants/permissions
 * Update granular permissions for a tenant
 */
export function updatePermissions(req, res) {
  try {
    const { identifier, permissions } = req.body || {};
    if (!identifier || !permissions) {
      return res.status(400).json({ success: false, error: 'Identifier and permissions required' });
    }

    const tenant = updateTenantPermissions(identifier, permissions);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    return res.status(200).json({
      success: true,
      tenant,
    });
  } catch (err) {
    console.error('[AuthController] Error updating permissions:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/tenants/:id
 * Remove tenant from cloud directory
 */
export function deleteTenant(req, res) {
  try {
    const { id } = req.params;
    const result = deleteTenantRecord(id);
    return res.status(200).json({
      success: true,
      message: 'Tenant removed from cloud directory',
      ...result,
    });
  } catch (err) {
    console.error('[AuthController] Error deleting tenant:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Aliases for parity
export const loginController = login;
export const registerController = register;
export const getWorkspaceMembersController = getMembers;
export const inviteWorkspaceMemberController = inviteMember;
export const removeWorkspaceMemberController = removeMember;
export const getTenantsDirectory = getTenants;
export const saveTenant = createOrUpdateTenant;
export const updateTenantPerms = updatePermissions;

export default {
  login,
  loginController,
  register,
  registerController,
  getMembers,
  getWorkspaceMembersController,
  inviteMember,
  inviteWorkspaceMemberController,
  removeMember,
  removeWorkspaceMemberController,
  getTenants,
  createOrUpdateTenant,
  saveTenant,
  updatePermissions,
  deleteTenant,
};
