-- ==============================================================================
-- Dhigrowth CRM / Sendiee - Supabase RLS Policies & Full Seed Data
-- Run this in your Supabase SQL Editor to enable frontend access & populate data
-- ==============================================================================

-- 1. Enable Full Access Policies for anon / authenticated roles
-- (Allows dashboard frontend to read, insert, update messages and leads)

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon organizations" ON organizations;
CREATE POLICY "Allow all for anon organizations" ON organizations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon workspaces" ON workspaces;
CREATE POLICY "Allow all for anon workspaces" ON workspaces FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon users" ON users;
CREATE POLICY "Allow all for anon users" ON users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon workspace_members" ON workspace_members;
CREATE POLICY "Allow all for anon workspace_members" ON workspace_members FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon channels" ON channels;
CREATE POLICY "Allow all for anon channels" ON channels FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon contacts" ON contacts;
CREATE POLICY "Allow all for anon contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon tags" ON tags;
CREATE POLICY "Allow all for anon tags" ON tags FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon contact_tags" ON contact_tags;
CREATE POLICY "Allow all for anon contact_tags" ON contact_tags FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon conversations" ON conversations;
CREATE POLICY "Allow all for anon conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon messages" ON messages;
CREATE POLICY "Allow all for anon messages" ON messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE ai_assistants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon ai_assistants" ON ai_assistants;
CREATE POLICY "Allow all for anon ai_assistants" ON ai_assistants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon wallet_accounts" ON wallet_accounts;
CREATE POLICY "Allow all for anon wallet_accounts" ON wallet_accounts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon wallet_transactions" ON wallet_transactions;
CREATE POLICY "Allow all for anon wallet_transactions" ON wallet_transactions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon templates" ON templates;
CREATE POLICY "Allow all for anon templates" ON templates FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon campaigns" ON campaigns;
CREATE POLICY "Allow all for anon campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);

-- 2. Seed Tags
INSERT INTO tags (id, workspace_id, name, color_hex)
VALUES
('a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', 'VIP Customer', '#7C3AED'),
('a0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000001', 'High Intent (COD)', '#10B981'),
('a0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000001', 'Abandoned Cart', '#F59E0B')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Realistic Contacts / Leads
INSERT INTO contacts (id, workspace_id, phone_number, email, full_name, lead_stage, lead_score, source)
VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '+919791471277',
    'priya.sharma@example.com',
    'Priya Sharma',
    'Won / Confirmed',
    95,
    'whatsapp_inbound'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    '+14158924192',
    'david.miller@example.com',
    'David Miller',
    'Negotiation',
    78,
    'instagram_dm'
),
(
    'f0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    '+919820551122',
    'ananya.patel@example.com',
    'Ananya Patel',
    'Discovery',
    60,
    'messenger'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Conversations
INSERT INTO conversations (id, workspace_id, contact_id, channel_id, channel_type, status, unread_count, last_message_at)
VALUES
(
    'c1000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001', -- WhatsApp
    'whatsapp',
    'bot_active',
    0,
    NOW()
),
(
    'c1000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002', -- Instagram
    'instagram',
    'open',
    1,
    NOW() - INTERVAL '15 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Messages
INSERT INTO messages (id, workspace_id, conversation_id, channel_id, direction, ai_generated, type, content, status, sent_at)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'inbound',
    false,
    'text',
    'Hi, do you have the king size organic linen bedcover in beige?',
    'read',
    NOW() - INTERVAL '35 minutes'
),
(
    '10000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'outbound',
    true,
    'text',
    'Hello Priya! 👋 Yes, our Premium King Size Linen Cover (Beige · 90"×72") is in stock and ready to ship today.\n\nPrice is ₹2,499 with complimentary express delivery and Cash on Delivery available.',
    'delivered',
    NOW() - INTERVAL '34 minutes'
),
(
    '10000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'inbound',
    false,
    'text',
    'Great! Can you confirm if matching pillowcases come with it?',
    'read',
    NOW() - INTERVAL '20 minutes'
),
(
    '10000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'outbound',
    true,
    'text',
    'Yes, 2 matching flange pillowcases are included! Would you like me to reserve one for you with code LAUNCH10 for 10% off?',
    'read',
    NOW() - INTERVAL '19 minutes'
),
(
    '10000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'inbound',
    false,
    'text',
    'Yes please, add COD to Bandra West address.',
    'read',
    NOW() - INTERVAL '5 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed $5 Credit Wallet Transaction
INSERT INTO wallet_transactions (id, workspace_id, type, amount_usd, balance_after_usd, description)
VALUES
(
    'a0000000-0000-0000-0000-000000000099',
    'b0000000-0000-0000-0000-000000000001',
    'bonus',
    5.0000,
    5.0000,
    'Welcome Bonus: $5.00 complimentary AI & messaging credit applied'
)
ON CONFLICT (id) DO NOTHING;
