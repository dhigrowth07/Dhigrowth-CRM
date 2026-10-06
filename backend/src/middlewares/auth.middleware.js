import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import { AppError } from './errorHandler.middleware.js';

/**
 * Resolves workspace ID from headers, request body, query params, or default fallback
 */
export function resolveWorkspaceId(req) {
  const wsId =
    req.headers['x-workspace-id'] ||
    req.headers['workspace-id'] ||
    req.body?.workspaceId ||
    req.query?.workspaceId ||
    env.DEFAULT_WORKSPACE_ID;

  return String(wsId).trim();
}

/**
 * Authentication Middleware:
 * Inspects incoming request for Bearer Token or Workspace Headers,
 * verifies identity against Supabase Auth (or demo fallback), and attaches `req.user` & `req.workspaceId`.
 */
export async function authenticate(req, res, next) {
  try {
    const workspaceId = resolveWorkspaceId(req);
    req.workspaceId = workspaceId;

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    // 1. If Supabase JWT Token is present and Supabase client is online, verify token
    if (token && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'admin',
            workspaceId,
            fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          };
          return next();
        }
      } catch (tokenErr) {
        console.warn('[AuthMiddleware] Supabase token verification notice:', tokenErr.message);
      }
    }

    // 2. Demo & Fallback User Context for local development and offline mode
    const simulatedUsername = req.headers['x-user-id'] || req.query?.username || req.body?.username || 'sri';
    const isSuperAdmin = simulatedUsername.toLowerCase() === 'admin';

    req.user = {
      id: isSuperAdmin ? 'c0000000-0000-0000-0000-000000000001' : 'c0000000-0000-0000-0000-000000000002',
      email: isSuperAdmin ? 'admin@wapppilot.com' : 'srivaladeno@gmail.com',
      role: isSuperAdmin ? 'super_admin' : 'admin',
      workspaceId,
      fullName: isSuperAdmin ? 'Super Administrator' : 'Sri',
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Strict Guard: Rejects request with 401 Unauthorized if user is not authenticated
 */
export function requireAuth(req, res, next) {
  if (!req.user || !req.user.id) {
    return next(new AppError('Authentication required. Please provide a valid session token.', 401));
  }
  next();
}

export default {
  resolveWorkspaceId,
  authenticate,
  requireAuth,
};
