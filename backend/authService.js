import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getWorkspaceTemplates } from './templateService.js';
import { getWorkspaceAutomations } from './automationsService.js';
import { getWorkspaceDrips } from './dripService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Register a new commercial SaaS tenant (Company + Workspace + Admin User + Wallet + Channel)
 */
export async function registerTenant({
  fullName,
  companyName,
  email,
  phone = '',
  password,
}) {
  if (!fullName?.trim() || !companyName?.trim() || !email?.trim() || !password?.trim()) {
    throw new Error('Full Name, Company Name, Email, and Password are all required.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  const cleanCompany = companyName.trim();
  const cleanPhone = phone ? phone.trim() : '';

  if (!supabase) {
    throw new Error('Cloud database is currently unreachable. Please try again.');
  }

  // 1. Check if email already registered
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (existingUser) {
    throw new Error(`An account with email "${cleanEmail}" already exists. Please sign in.`);
  }

  const orgId = crypto.randomUUID();
  const workspaceId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(password.trim(), 10);
  const slug = cleanCompany.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);

  try {
    // 2. Create Organization
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert([
        {
          id: orgId,
          name: cleanCompany,
          legal_name: cleanCompany,
          billing_email: cleanEmail,
          billing_phone: cleanPhone,
        },
      ])
      .select()
      .single();

    if (orgErr) throw new Error(`Could not create organization: ${orgErr.message}`);

    // 3. Create Workspace
    const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: ws, error: wsErr } = await supabase
      .from('workspaces')
      .insert([
        {
          id: workspaceId,
          organization_id: orgId,
          name: `${cleanCompany} Workspace`,
          slug,
          plan: 'business',
          plan_status: 'active',
          trial_ends_at: trialEndDate,
        },
      ])
      .select()
      .single();

    if (wsErr) throw new Error(`Could not create workspace: ${wsErr.message}`);

    // 4. Create User
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: cleanEmail,
          password_hash: passwordHash,
          full_name: cleanName,
          phone_number: cleanPhone,
        },
      ])
      .select('id, email, full_name, phone_number, created_at')
      .single();

    if (userErr) throw new Error(`Could not create user account: ${userErr.message}`);

    // 5. Add as Super Admin in Workspace Members
    const { error: memErr } = await supabase.from('workspace_members').insert([
      {
        workspace_id: workspaceId,
        user_id: userId,
        role: 'super_admin',
        is_active: true,
      },
    ]);

    if (memErr) console.warn('[AuthService] Member insert note:', memErr.message);

    // 6. Initialize Wallet with $5.00 Free Trial AI Credits
    await supabase.from('wallet_accounts').insert([
      {
        workspace_id: workspaceId,
        balance_usd: 5.0,
      },
    ]);

    // 7. Initialize WhatsApp Channel row for this workspace
    await supabase.from('channels').insert([
      {
        workspace_id: workspaceId,
        type: 'whatsapp',
        identifier: cleanPhone || '+910000000000',
        display_name: `${cleanCompany} WhatsApp`,
        is_connected: false,
      },
    ]);

    // 8. Auto-seed starter templates, automations, and drips for this new tenant
    await getWorkspaceTemplates(workspaceId);
    await getWorkspaceAutomations(workspaceId);
    await getWorkspaceDrips(workspaceId);

    console.log(`🎉 [AuthService] Successfully registered new SaaS tenant: "${cleanCompany}" (${cleanEmail}) -> Workspace ${workspaceId}`);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone_number,
        role: 'super_admin',
        organization: cleanCompany,
      },
      workspace: {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        plan: ws.plan,
        trialEndsAt: ws.trial_ends_at,
      },
      organization: {
        id: org.id,
        name: org.name,
      },
      isFirstTimeOnboarding: true,
      message: 'Account and workspace successfully created!',
    };
  } catch (err) {
    console.error('[AuthService] Registration error:', err);
    throw err;
  }
}

/**
 * Login an existing user
 */
export async function loginTenant({ email, password, username }) {
  const cleanIdentifier = (email || username || '').trim().toLowerCase();

  const cleanPass = (password || '').trim();

  // 1. Super Admin Account: admin / wappilot@
  if (cleanIdentifier === 'admin' || cleanIdentifier === 'admin@wapppilot.com' || cleanIdentifier === 'admin@dhigrowth.com') {
    if (cleanPass !== 'wappilot@' && cleanPass !== 'DhiGrowth@admin') {
      throw new Error('Invalid email or password.');
    }
    return {
      success: true,
      user: {
        id: 'a0000000-0000-0000-0000-000000000001',
        name: 'Super Administrator',
        username: 'admin',
        email: 'admin@wapppilot.com',
        role: 'super_admin',
        isSuperAdmin: true,
        isAdmin: true,
        organization: 'WAPPPILOT Platform Operations',
      },
      workspace: {
        id: 'a0000000-0000-0000-0000-000000000001',
        name: 'Super Admin Workspace',
        slug: 'admin',
        plan: 'enterprise',
      },
      isFirstTimeOnboarding: false,
    };
  }

  // 2. DhiGrowth Admin Account: sri (DhiGrowth Admin only, not Super Admin)
  if (cleanIdentifier === 'sri' || cleanIdentifier === 'sri@dhigrowth.com' || cleanIdentifier === 'srivaladeno@gmail.com') {
    if (cleanPass && cleanPass !== 'dhigrowth2026' && cleanPass !== 'Dhigrowth2026' && cleanPass !== 'sri123') {
      throw new Error('Invalid email or password.');
    }
    return {
      success: true,
      user: {
        id: 'c0000000-0000-0000-0000-000000000001',
        name: 'Sri',
        username: 'sri',
        email: 'sri@dhigrowth.com',
        role: 'admin', // DhiGrowth admin only, NOT super_admin
        isSuperAdmin: false,
        isAdmin: false,
        organization: 'Dhigrowth CRM',
      },
      workspace: {
        id: 'b0000000-0000-0000-0000-000000000001',
        name: "Dhigrowth CRM",
        slug: 'sri',
        plan: 'business',
      },
      isFirstTimeOnboarding: false,
    };
  }

  // 3. Check local tenants.json store for registered tenant users
  try {
    const tenantsFile = path.resolve(__dirname, 'tenants.json');
    if (fs.existsSync(tenantsFile)) {
      const tenantsList = JSON.parse(fs.readFileSync(tenantsFile, 'utf8') || '[]');
      const matched = tenantsList.find(
        (t) => cleanIdentifier === t.username?.toLowerCase() || cleanIdentifier === t.email?.toLowerCase()
      );
      if (matched) {
        let isPassValid = false;
        if (matched.passwordHash) {
          try {
            isPassValid = bcrypt.compareSync(cleanPass, matched.passwordHash);
          } catch {}
        }
        if (!isPassValid && matched.password) {
          isPassValid = cleanPass === matched.password;
        }
        if (isPassValid) {
          return {
            success: true,
            user: {
              id: matched.id,
              name: matched.name,
              username: matched.username,
              email: matched.email,
              role: matched.role || 'CRM User',
              isAdmin: Boolean(matched.isAdmin),
              isSuperAdmin: false,
              organization: matched.companyName || `${matched.name}'s Workspace`,
            },
            workspace: {
              id: matched.workspaceId,
              name: matched.companyName || `${matched.name}'s Workspace`,
              slug: matched.slug || matched.username,
              plan: matched.plan || 'business',
            },
            isFirstTimeOnboarding: false,
          };
        }
      }
    }
  } catch (tErr) {
    console.warn('[AuthService] tenants.json check note:', tErr.message);
  }

  if (!supabase) {
    throw new Error('Invalid email or password.');
  }

  // 2. Query Supabase users table
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('id, email, password_hash, full_name, phone_number')
    .eq('email', cleanIdentifier)
    .maybeSingle();

  if (userErr || !user) {
    throw new Error('Invalid email or password.');
  }

  // 3. Verify password hash
  const isValid = bcrypt.compareSync(password.trim(), user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  // 4. Fetch user's workspace membership
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  const userWorkspaceId = member?.workspace_id || 'b0000000-0000-0000-0000-000000000001';

  // 5. Fetch workspace info
  const { data: ws } = await supabase
    .from('workspaces')
    .select('id, name, slug, plan, organization_id')
    .eq('id', userWorkspaceId)
    .maybeSingle();

  return {
    success: true,
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email,
      phone: user.phone_number,
      role: member?.role || 'admin',
      organization: ws?.name || 'My Organization',
    },
    workspace: {
      id: userWorkspaceId,
      name: ws?.name || 'My Workspace',
      slug: ws?.slug || 'workspace',
      plan: ws?.plan || 'business',
    },
    isFirstTimeOnboarding: false,
  };
}

/**
 * Get all team members for a workspace
 */
export async function getWorkspaceMembers(workspaceId) {
  if (!supabase || !workspaceId) {
    return [
      {
        id: 'mem_1',
        fullName: 'Sri (Workspace Owner)',
        email: 'srivaladeno@gmail.com',
        role: 'super_admin',
        status: 'active',
        joinedAt: '2026-09-11',
      },
    ];
  }

  try {
    const { data: members, error } = await supabase
      .from('workspace_members')
      .select('id, role, is_active, created_at, user:users!workspace_members_user_id_fkey(id, full_name, email, phone_number)')
      .eq('workspace_id', workspaceId);

    if (error || !members || members.length === 0) {
      return [
        {
          id: 'mem_1',
          fullName: 'Workspace Owner',
          email: 'admin@dhigrowth.com',
          role: 'super_admin',
          status: 'active',
          joinedAt: new Date().toISOString().split('T')[0],
        },
      ];
    }

    return members.map((m) => ({
      id: m.id,
      fullName: m.user?.full_name || 'Team Member',
      email: m.user?.email || 'N/A',
      phone: m.user?.phone_number || '',
      role: m.role || 'agent',
      status: m.is_active ? 'active' : 'invited',
      joinedAt: m.created_at ? m.created_at.split('T')[0] : '2026-09-21',
    }));
  } catch (err) {
    console.warn('Get members error:', err.message);
    return [];
  }
}

/**
 * Invite a new team member to the workspace
 */
export async function inviteWorkspaceMember({ workspaceId, email, fullName, role = 'agent' }) {
  if (!email?.trim()) throw new Error('Email is required');
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName?.trim() || cleanEmail.split('@')[0];

  if (!supabase) {
    return {
      id: `mem_${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      role,
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
    };
  }

  // 1. Check if user exists or create
  let userId;
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (existingUser) {
    userId = existingUser.id;
  } else {
    userId = crypto.randomUUID();
    const tempPasswordHash = bcrypt.hashSync('TempInvitePass2026!', 10);
    await supabase.from('users').insert([
      {
        id: userId,
        email: cleanEmail,
        password_hash: tempPasswordHash,
        full_name: cleanName,
      },
    ]);
  }

  // 2. Add to workspace_members
  const memberId = crypto.randomUUID();
  const { data: member, error } = await supabase
    .from('workspace_members')
    .insert([
      {
        id: memberId,
        workspace_id: workspaceId,
        user_id: userId,
        role: role || 'agent',
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Could not add team member: ${error.message}`);
  }

  return {
    id: memberId,
    fullName: cleanName,
    email: cleanEmail,
    role,
    status: 'active',
    joinedAt: new Date().toISOString().split('T')[0],
  };
}

/**
 * Remove a team member
 */
export async function removeWorkspaceMember(memberId, workspaceId) {
  if (!supabase) return { success: true };
  let query = supabase.from('workspace_members').delete().eq('id', memberId);
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  const { error } = await query;
  if (error) throw error;
  return { success: true };
}
