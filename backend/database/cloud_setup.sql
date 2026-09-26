-- ==============================================================================
-- Dhigrowth CRM / Sendiee - Cloud PostgreSQL Setup Script (Supabase / Neon)
-- Run this entire script in your Supabase or Neon SQL Editor
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector for AI memory & RAG

-- 2. Custom Enumerations (wrapped to avoid duplicate errors on re-runs)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'agent', 'viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE channel_type AS ENUM ('whatsapp', 'instagram', 'messenger', 'line');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'image', 'audio', 'video', 'document', 'template', 'interactive', 'location');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE conversation_status AS ENUM ('open', 'bot_active', 'human_needed', 'closed', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'processing', 'completed', 'paused', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE template_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'paused');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE template_category AS ENUM ('marketing', 'utility', 'authentication');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE wallet_tx_type AS ENUM ('topup', 'ai_tokens', 'whatsapp_utility', 'whatsapp_marketing', 'refund', 'bonus');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM ('creator_lite', 'creator_plus', 'growth', 'business');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Core Multi-Tenancy Tables
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    gstin VARCHAR(50),
    billing_email VARCHAR(255) NOT NULL,
    billing_phone VARCHAR(50),
    billing_address TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan plan_tier NOT NULL DEFAULT 'business',
    plan_status VARCHAR(50) NOT NULL DEFAULT 'active',
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    billing_cycle_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    billing_cycle_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_org ON workspaces(organization_id);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    avatar_url TEXT,
    is_2fa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'agent',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_ws ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);

-- 4. Messaging Channels
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type channel_type NOT NULL,
    identifier VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    is_connected BOOLEAN NOT NULL DEFAULT TRUE,
    access_token TEXT,
    refresh_token TEXT,
    channel_secret TEXT,
    app_id VARCHAR(100),
    waba_id VARCHAR(100),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, type, identifier)
);

CREATE INDEX IF NOT EXISTS idx_channels_ws ON channels(workspace_id);

-- 5. Contacts & CRM Leads
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    phone_number VARCHAR(50),
    email VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    lead_stage VARCHAR(50) NOT NULL DEFAULT 'Discovery',
    lead_score INT NOT NULL DEFAULT 0,
    source VARCHAR(100) DEFAULT 'organic_chat',
    custom_attributes JSONB DEFAULT '{}'::jsonb,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_contacts_ws ON contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_ws_phone ON contacts(workspace_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_ws_stage ON contacts(workspace_id, lead_stage);

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20) DEFAULT '#7C3AED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_ws ON tags(workspace_id);

CREATE TABLE IF NOT EXISTS contact_tags (
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(contact_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_tags_ws ON contact_tags(workspace_id);

CREATE TABLE IF NOT EXISTS segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_segments_ws ON segments(workspace_id);

-- 6. Conversations & Omnichannel Messages
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status conversation_status NOT NULL DEFAULT 'open',
    channel_type channel_type NOT NULL,
    channel_conversation_id VARCHAR(255),
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unread_count INT NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_ws ON conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_conversations_ws_last_msg ON conversations(workspace_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    direction message_direction NOT NULL,
    type message_type NOT NULL DEFAULT 'text',
    status message_status NOT NULL DEFAULT 'sent',
    external_message_id VARCHAR(255),
    sender_id VARCHAR(255),
    content TEXT,
    media_url TEXT,
    media_mime_type VARCHAR(100),
    payload JSONB DEFAULT '{}'::jsonb,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    ai_tokens_used INT DEFAULT 0,
    ai_model VARCHAR(100),
    ai_latency_ms INT DEFAULT 0,
    error_code VARCHAR(50),
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_ws ON messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_ws_created ON messages(workspace_id, created_at DESC);

-- 7. Meta WhatsApp Templates & Campaigns
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    meta_template_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    category template_category NOT NULL DEFAULT 'marketing',
    language VARCHAR(10) NOT NULL DEFAULT 'en_US',
    status template_status NOT NULL DEFAULT 'pending',
    header_type VARCHAR(50),
    header_content TEXT,
    body_text TEXT NOT NULL,
    footer_text VARCHAR(120),
    buttons JSONB DEFAULT '[]'::jsonb,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, name, language)
);

CREATE INDEX IF NOT EXISTS idx_templates_ws ON templates(workspace_id);

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    channel_type channel_type NOT NULL DEFAULT 'whatsapp',
    segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
    status campaign_status NOT NULL DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_recipients INT NOT NULL DEFAULT 0,
    sent_count INT NOT NULL DEFAULT 0,
    delivered_count INT NOT NULL DEFAULT 0,
    read_count INT NOT NULL DEFAULT 0,
    replied_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_ws ON campaigns(workspace_id);

-- 8. AI Assistants & Vector Search
CREATE TABLE IF NOT EXISTS ai_assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100) NOT NULL DEFAULT 'gemini-1.5-flash',
    system_prompt TEXT NOT NULL,
    temperature NUMERIC(3,2) NOT NULL DEFAULT 0.70,
    max_tokens INT NOT NULL DEFAULT 1024,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    confidence_threshold NUMERIC(3,2) DEFAULT 0.80,
    handoff_on_unresolved BOOLEAN DEFAULT TRUE,
    voice_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_assistants_ws ON ai_assistants(workspace_id);

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    original_file_url TEXT,
    content_raw TEXT NOT NULL,
    chunk_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_ws ON knowledge_documents(workspace_id);

CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_ws ON document_embeddings(workspace_id);

CREATE TABLE IF NOT EXISTS ai_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    function_schema JSONB NOT NULL,
    endpoint_url TEXT,
    http_method VARCHAR(10) DEFAULT 'POST',
    auth_header TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tools_ws ON ai_tools(workspace_id);

-- 9. Wallet & Invoices
CREATE TABLE IF NOT EXISTS wallet_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    balance_usd NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    auto_recharge_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    auto_recharge_threshold_usd NUMERIC(10, 2) DEFAULT 10.00,
    auto_recharge_amount_usd NUMERIC(10, 2) DEFAULT 25.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type wallet_tx_type NOT NULL,
    amount_usd NUMERIC(10, 4) NOT NULL,
    balance_after_usd NUMERIC(10, 4) NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_ws ON wallet_transactions(workspace_id);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount_inr NUMERIC(10, 2) NOT NULL,
    tax_inr NUMERIC(10, 2) NOT NULL,
    total_inr NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'paid',
    gstin VARCHAR(50),
    pdf_url TEXT,
    billing_period_start TIMESTAMPTZ,
    billing_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_ws ON invoices(workspace_id);

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT ARRAY['messages.read', 'messages.send'],
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_ws ON api_keys(workspace_id);

-- ==============================================================================
-- 10. SEED INITIAL DEMO DATA
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
) ON CONFLICT (id) DO NOTHING;

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
) ON CONFLICT (id) DO NOTHING;

-- 3. Create Super Admin User
INSERT INTO users (id, email, password_hash, full_name, phone_number, is_2fa_enabled)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'srivaladeno@gmail.com',
    '$2a$12$e8x/0M46E97w.hBqK3B0p.P.jI9p4uWfK0N2XzU7L/JbBvJvJbBvJ',
    'Sri',
    '+919791471277',
    false
) ON CONFLICT (id) DO NOTHING;

-- 4. Associate User with Workspace as Super Admin
INSERT INTO workspace_members (workspace_id, user_id, role, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'super_admin',
    true
) ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- 5. Seed Channels
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
) ON CONFLICT (id) DO NOTHING;

-- 6. Seed AI Assistant
INSERT INTO ai_assistants (id, workspace_id, name, model, system_prompt, temperature)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Dhigrowth Sales Concierge',
    'gemini-1.5-flash',
    'You are the intelligent customer service and sales AI for Dhigrowth CRM.',
    0.70
) ON CONFLICT (id) DO NOTHING;

-- 7. Seed Wallet & Launch Credit
INSERT INTO wallet_accounts (id, workspace_id, balance_usd, auto_recharge_enabled)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    5.0000,
    false
) ON CONFLICT (id) DO NOTHING;

