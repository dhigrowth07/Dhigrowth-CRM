import { AppError } from './errorHandler.middleware.js';

/**
 * Role-Based Access Control (RBAC) Hierarchy:
 * super_admin > admin > agent
 */
const ROLE_HIERARCHY = {
  super_admin: 3,
  admin: 2,
  agent: 1,
};

/**
 * Higher-order middleware that verifies if current user possesses one of the allowed roles
 *
 * @param {string[]} allowedRoles - Array of allowed role names (e.g. ['super_admin', 'admin'])
 */
export function requireRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('Unauthorized: User identity not authenticated', 401));
    }

    const userRole = String(req.user.role).toLowerCase();
    const isAllowed = allowedRoles.map((r) => r.toLowerCase()).includes(userRole);

    if (!isAllowed) {
      return next(
        new AppError(
          `Forbidden: Access denied. This operation requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: "${req.user.role}".`,
          403
        )
      );
    }

    next();
  };
}

/**
 * Strict Guard: Requires Super Administrator privileges (platform-wide operations, multi-tenant provisioning)
 */
export const requireSuperAdmin = requireRoles(['super_admin']);

/**
 * Guard: Requires Workspace Administrator privileges or higher (campaigns, templates, billing, settings)
 */
export const requireAdmin = requireRoles(['super_admin', 'admin']);

/**
 * Guard: Requires active workspace membership (agents, admins, super_admins)
 */
export const requireAgent = requireRoles(['super_admin', 'admin', 'agent']);

export default {
  requireRoles,
  requireSuperAdmin,
  requireAdmin,
  requireAgent,
};
