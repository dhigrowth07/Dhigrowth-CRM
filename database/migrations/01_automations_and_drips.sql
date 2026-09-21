-- ==============================================================================
-- Dhigrowth CRM / Sendiee - Migration 01: Automations & Drip Campaigns
-- Run this script in the Supabase SQL Editor: https://supabase.com/dashboard/project/ttjtlqsfwaksyqrrutvv/sql
-- ==============================================================================

-- 1. Automations Table (Keyword & Event Auto-Pilots)
CREATE TABLE IF NOT EXISTS automations (
    id TEXT PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger VARCHAR(100) NOT NULL,
    trigger_condition TEXT,
    action VARCHAR(100) NOT NULL,
    action_details TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    runs INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_run_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automations_ws ON automations(workspace_id);

-- Enable RLS & open policy for anon client
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon automations" ON automations;
CREATE POLICY "Allow all for anon automations" ON automations FOR ALL USING (true) WITH CHECK (true);


-- 2. Drip Campaigns Table (Multi-Step Spaced WhatsApp Sequences)
CREATE TABLE IF NOT EXISTS drip_campaigns (
    id TEXT PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'lead_stage',
    trigger_stage VARCHAR(100) NOT NULL,
    delay VARCHAR(100) NOT NULL DEFAULT '1 day(s)',
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    enrolled INTEGER NOT NULL DEFAULT 0,
    delivered INTEGER NOT NULL DEFAULT 0,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_trigger_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drip_campaigns_ws ON drip_campaigns(workspace_id);

-- Enable RLS & open policy for anon client
ALTER TABLE drip_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon drip_campaigns" ON drip_campaigns;
CREATE POLICY "Allow all for anon drip_campaigns" ON drip_campaigns FOR ALL USING (true) WITH CHECK (true);


-- 3. Seed Starter Drip Campaigns for Sri's Workspace
INSERT INTO drip_campaigns (id, workspace_id, name, category, trigger_stage, delay, status, enrolled, delivered, steps)
VALUES
(
    'drip_hot_fasttrack',
    'b0000000-0000-0000-0000-000000000001',
    'Hot Lead Fast-Track Nurture',
    'lead_stage',
    'Hot',
    '1 day(s)',
    'Active',
    124,
    120,
    '[{"step": 1, "delay": "Instant", "action": "Send Product Deck & Client Case Studies"}, {"step": 2, "delay": "After 1 Day", "action": "Offer 1-on-1 Consultation Call Link"}]'::jsonb
),
(
    'drip_cart_recovery',
    'b0000000-0000-0000-0000-000000000001',
    'Abandoned Cart 24-Hour Recovery',
    'cart_recovery',
    'Interested',
    '2 day(s)',
    'Active',
    86,
    82,
    '[{"step": 1, "delay": "After 1 Hour", "action": "Send 10% Discount Promo Code (LAUNCH10)"}, {"step": 2, "delay": "After 24 Hours", "action": "Send Direct WhatsApp Checkout Link"}]'::jsonb
),
(
    'drip_post_purchase',
    'b0000000-0000-0000-0000-000000000001',
    'Post-Purchase VIP Loyalty Sequence',
    'post_purchase',
    'Converted',
    '7 day(s)',
    'Active',
    210,
    204,
    '[{"step": 1, "delay": "Day 3", "action": "Product Setup & Onboarding Guide"}, {"step": 2, "delay": "Day 7", "action": "Google Review Request & Feedback Survey"}, {"step": 3, "delay": "Day 14", "action": "₹500 Referral Bonus Invitation"}]'::jsonb
),
(
    'drip_cold_reactivation',
    'b0000000-0000-0000-0000-000000000001',
    'Cold Lead Re-engagement Winback',
    'lead_stage',
    'Cold',
    '15 day(s)',
    'Active',
    95,
    91,
    '[{"step": 1, "delay": "Day 15", "action": "Share Major New Feature & AI Enhancements"}, {"step": 2, "delay": "Day 30", "action": "Exclusive Reactivation 20% Voucher"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;


-- 4. Seed Starter Automations for Sri's Workspace
INSERT INTO automations (id, workspace_id, name, description, trigger, trigger_condition, action, action_details, status, runs)
VALUES
(
    'auto_welcome_greeting',
    'b0000000-0000-0000-0000-000000000001',
    'WhatsApp AI Welcome & Service Menu',
    'Instantly send interactive button card & service menu on first customer message',
    'First Inbound Message',
    'First message from new contact or 24h inactive',
    'Dispatch Interactive Greeting',
    'Send button card with App Dev, CRM, and AI Solutions',
    'Active',
    142
),
(
    'auto_app_inquiry',
    'b0000000-0000-0000-0000-000000000001',
    'Mobile & Web App Funnel',
    'Auto-respond with portfolio deck when customer asks about apps or websites',
    'Keyword Match',
    'Matches: "app", "website", "ios", "android", "1"',
    'Send Portfolio & Tech Deck',
    'Send Flutter & React Native portfolio with consultation link',
    'Active',
    89
),
(
    'auto_crm_funnel',
    'b0000000-0000-0000-0000-000000000001',
    'WhatsApp CRM & Auto-Pilot Funnel',
    'Explain WhatsApp API features and pricing when requested',
    'Keyword Match',
    'Matches: "crm", "auto-pilot", "whatsapp api", "2"',
    'Send WhatsApp CRM Overview',
    'Send Cloud API features, lead funnels, and pricing plans',
    'Active',
    64
),
(
    'auto_agent_handoff',
    'b0000000-0000-0000-0000-000000000001',
    'High-Intent Human Agent Handoff',
    'Assign to live human agent when user asks for quote, call, or urgent help',
    'Keyword Match',
    'Matches: "quote", "call", "urgent", "human", "talk"',
    'Assign to Agent & Pause AI',
    'Move to Manual Agent mode and notify team inbox',
    'Active',
    31
)
ON CONFLICT (id) DO NOTHING;
