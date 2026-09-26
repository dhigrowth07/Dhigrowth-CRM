-- ==============================================================================
-- Dhigrowth CRM / Sendiee - Initial Seed Data Script
-- Populates default Organization, Workspace, User, Channels, and Demo Records
-- ==============================================================================

-- 1. Create Organization
INSERT INTO organizations (id, name, legal_name, gstin, billing_email, billing_phone, billing_address)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Sri Enterprises',
    'Sri Retail Enterprises LLP',
    '27AADCS1234F1Z5',
    'srivaladeno@gmail.com',
    '+919791471277',
    '124, Linking Road, Bandra West, Mumbai, MH - 400050'
) ON CONFLICT DO NOTHING;

-- 2. Create Workspace
INSERT INTO workspaces (id, organization_id, name, slug, plan, plan_status, trial_ends_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Sri''s Workspace',
    'sri-workspace-live',
    'business',
    'active',
    NOW() + INTERVAL '6 days'
) ON CONFLICT DO NOTHING;

-- 3. Create Super Admin User
INSERT INTO users (id, email, password_hash, full_name, phone_number, is_2fa_enabled)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'srivaladeno@gmail.com',
    '$2a$12$e8x/0M46E97w.hBqK3B0p.P.jI9p4uWfK0N2XzU7L/JbBvJvJbBvJ', -- bcrypt demo hash
    'Sri',
    '+919791471277',
    false
) ON CONFLICT DO NOTHING;

-- 4. Associate User with Workspace as Super Admin
INSERT INTO workspace_members (workspace_id, user_id, role, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'super_admin',
    true
) ON CONFLICT DO NOTHING;

-- 5. Create Messaging Channels
INSERT INTO channels (id, workspace_id, type, identifier, display_name, is_connected)
VALUES 
(
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'whatsapp',
    '+919791471277',
    'WhatsApp Business (+91 97914 71277)',
    false
),
(
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'instagram',
    '@dhigrowth_crm',
    'Instagram (@dhigrowth_crm)',
    false
),
(
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'messenger',
    'page_884920',
    'Facebook Page (Apex Retail)',
    false
),
(
    'd0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'line',
    '@line_dhigrowth',
    'LINE Official Account',
    false
) ON CONFLICT DO NOTHING;

-- 6. Seed Tags
INSERT INTO tags (id, workspace_id, name, color_hex)
VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'VIP Customer', '#7C3AED'),
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'High Intent', '#10B981'),
('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Abandoned Cart', '#F59E0B')
ON CONFLICT DO NOTHING;

-- 7. Seed Contacts / Leads
INSERT INTO contacts (id, workspace_id, phone_number, email, full_name, lead_stage, lead_score, source)
VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '+919820144521',
    'priya.sharma@example.com',
    'Priya Sharma',
    'Proposal',
    85,
    'whatsapp_inbound'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    '+14158924192',
    'david.miller@example.com',
    'David Miller',
    'Demo Booked',
    70,
    'instagram_dm'
) ON CONFLICT DO NOTHING;

-- 8. Seed AI Assistant
INSERT INTO ai_assistants (id, workspace_id, name, model, system_prompt, temperature)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Dhigrowth Sales Concierge',
    'gemini-1.5-flash',
    'You are the intelligent customer service and sales AI for Dhigrowth CRM. Be polite, concise, and helpful.',
    0.70
) ON CONFLICT DO NOTHING;

-- 9. Seed Wallet & Launch Credit
INSERT INTO wallet_accounts (id, workspace_id, balance_usd, auto_recharge_enabled)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    5.0000,
    false
) ON CONFLICT DO NOTHING;

INSERT INTO wallet_transactions (workspace_id, type, amount_usd, balance_after_usd, description)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'bonus',
    5.0000,
    5.0000,
    'Promotional $5 launch credit applied to workspace wallet'
);
