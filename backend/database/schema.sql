-- ==============================================================================
-- Dhigrowth CRM / Sendiee - Multi-Tenant PostgreSQL Production Schema
-- Every tenant table is strictly partitioned with `workspace_id`
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- for AI embeddings (pgvector)

-- 2. Custom Enumerations
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'agent', 'viewer');
CREATE TYPE channel_type AS ENUM ('whatsapp', 'instagram', 'messenger', 'line');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_type AS ENUM ('text', 'image', 'audio', 'video', 'document', 'template', 'interactive', 'location');
CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE conversation_status AS ENUM ('open', 'bot_active', 'human_needed', 'closed', 'archived');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'processing', 'completed', 'paused', 'failed');
CREATE TYPE template_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'paused');
CREATE TYPE template_category AS ENUM ('marketing', 'utility', 'authentication');
CREATE TYPE wallet_tx_type AS ENUM ('topup', 'ai_tokens', 'whatsapp_utility', 'whatsapp_marketing', 'refund', 'bonus');
CREATE TYPE plan_tier AS ENUM ('creator_lite', 'creator_plus', 'growth', 'business');

-- ==============================================================================
-- 3. Core Multi-Tenancy Hierarchy: Organizations & Workspaces
-- ==============================================================================

CREATE TABLE organizations (
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

CREATE TABLE workspaces (
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

CREATE INDEX idx_workspaces_org ON workspaces(organization_id);

CREATE TABLE users (
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

CREATE TABLE workspace_members (
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

CREATE INDEX idx_workspace_members_ws ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- ==============================================================================
-- 4. Messaging Channels & Configurations
-- ==============================================================================

CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type channel_type NOT NULL,
    identifier VARCHAR(255) NOT NULL, -- e.g. Phone Number ID, IG Account ID, Page ID
    display_name VARCHAR(255) NOT NULL,
    is_connected BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Encrypted tokens and secrets
    access_token TEXT,
    refresh_token TEXT,
    channel_secret TEXT,
    app_id VARCHAR(100),
    waba_id VARCHAR(100), -- WhatsApp Business Account ID
    
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, type, identifier)
);

CREATE INDEX idx_channels_ws ON channels(workspace_id);

-- ==============================================================================
-- 5. Contacts & CRM Leads Engine
-- ==============================================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    phone_number VARCHAR(50),
    email VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    lead_stage VARCHAR(50) NOT NULL DEFAULT 'Discovery', -- Discovery, Demo Booked, Proposal, Customer
    lead_score INT NOT NULL DEFAULT 0,
    source VARCHAR(100) DEFAULT 'organic_chat',
    custom_attributes JSONB DEFAULT '{}'::jsonb,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, phone_number)
);

CREATE INDEX idx_contacts_ws ON contacts(workspace_id);
CREATE INDEX idx_contacts_ws_phone ON contacts(workspace_id, phone_number);
CREATE INDEX idx_contacts_ws_stage ON contacts(workspace_id, lead_stage);
CREATE INDEX idx_contacts_ws_active ON contacts(workspace_id, last_active_at DESC);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20) DEFAULT '#7C3AED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, name)
);

CREATE INDEX idx_tags_ws ON tags(workspace_id);

CREATE TABLE contact_tags (
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(contact_id, tag_id)
);

CREATE INDEX idx_contact_tags_ws ON contact_tags(workspace_id);

CREATE TABLE segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_segments_ws ON segments(workspace_id);

-- ==============================================================================
-- 6. Conversations & Real-Time Omnichannel Messages
-- ==============================================================================

CREATE TABLE conversations (
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

CREATE INDEX idx_conversations_ws ON conversations(workspace_id);
CREATE INDEX idx_conversations_ws_contact ON conversations(workspace_id, contact_id);
CREATE INDEX idx_conversations_ws_last_msg ON conversations(workspace_id, last_message_at DESC);
CREATE INDEX idx_conversations_ws_status ON conversations(workspace_id, status);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    
    direction message_direction NOT NULL,
    type message_type NOT NULL DEFAULT 'text',
    status message_status NOT NULL DEFAULT 'sent',
    
    external_message_id VARCHAR(255), -- Meta WAMID / IG mid
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

CREATE INDEX idx_messages_ws ON messages(workspace_id);
CREATE INDEX idx_messages_conv ON messages(conversation_id);
CREATE INDEX idx_messages_ws_ext ON messages(workspace_id, external_message_id);
CREATE INDEX idx_messages_ws_created ON messages(workspace_id, created_at DESC);

-- ==============================================================================
-- 7. Meta Message Templates & Broadcast Campaigns
-- ==============================================================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    meta_template_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    category template_category NOT NULL DEFAULT 'marketing',
    language VARCHAR(10) NOT NULL DEFAULT 'en_US',
    status template_status NOT NULL DEFAULT 'pending',
    
    header_type VARCHAR(50), -- TEXT, IMAGE, VIDEO, DOCUMENT
    header_content TEXT,
    body_text TEXT NOT NULL,
    footer_text VARCHAR(120),
    buttons JSONB DEFAULT '[]'::jsonb, -- Quick replies, URL buttons, Phone call
    
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, name, language)
);

CREATE INDEX idx_templates_ws ON templates(workspace_id);

CREATE TABLE campaigns (
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

CREATE INDEX idx_campaigns_ws ON campaigns(workspace_id);

CREATE TABLE campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status message_status NOT NULL DEFAULT 'pending',
    external_message_id VARCHAR(255),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    UNIQUE(campaign_id, contact_id)
);

CREATE INDEX idx_campaign_recipients_ws ON campaign_recipients(workspace_id);
CREATE INDEX idx_campaign_recipients_camp ON campaign_recipients(campaign_id);

-- ==============================================================================
-- 8. AI Assistants, Tools & Vector Knowledge Base (RAG)
-- ==============================================================================

CREATE TABLE ai_assistants (
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

CREATE INDEX idx_ai_assistants_ws ON ai_assistants(workspace_id);

CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- PDF, DOCX, TXT, FAQ, URL
    original_file_url TEXT,
    content_raw TEXT NOT NULL,
    chunk_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_docs_ws ON knowledge_documents(workspace_id);

CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536), -- Standard OpenAI / Gemini embedding dimensionality
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_embeddings_ws ON document_embeddings(workspace_id);
-- Fast vector similarity search using Cosine distance:
CREATE INDEX idx_embeddings_vector ON document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE ai_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    function_schema JSONB NOT NULL, -- OpenAPI / JSON Schema format for tool calling
    endpoint_url TEXT,
    http_method VARCHAR(10) DEFAULT 'POST',
    auth_header TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_tools_ws ON ai_tools(workspace_id);

-- ==============================================================================
-- 9. File Manager & Media Storage
-- ==============================================================================

CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_key TEXT NOT NULL, -- S3 / R2 key
    public_url TEXT NOT NULL,
    folder VARCHAR(100) DEFAULT 'root',
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_files_ws ON media_files(workspace_id);

-- ==============================================================================
-- 10. Billing, Wallet Ledger & Invoices
-- ==============================================================================

CREATE TABLE wallet_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    balance_usd NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    auto_recharge_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    auto_recharge_threshold_usd NUMERIC(10, 2) DEFAULT 10.00,
    auto_recharge_amount_usd NUMERIC(10, 2) DEFAULT 25.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type wallet_tx_type NOT NULL,
    amount_usd NUMERIC(10, 4) NOT NULL, -- positive for credits, negative for deductions
    balance_after_usd NUMERIC(10, 4) NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(255), -- e.g. Payment Gateway ID / Message ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_tx_ws ON wallet_transactions(workspace_id);
CREATE INDEX idx_wallet_tx_ws_created ON wallet_transactions(workspace_id, created_at DESC);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount_inr NUMERIC(10, 2) NOT NULL,
    tax_inr NUMERIC(10, 2) NOT NULL, -- 18% GST
    total_inr NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'paid',
    gstin VARCHAR(50),
    pdf_url TEXT,
    billing_period_start TIMESTAMPTZ,
    billing_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_ws ON invoices(workspace_id);

-- ==============================================================================
-- 11. Scoped API Keys & Webhooks
-- ==============================================================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL, -- e.g. "dhigrowth_live_sk_"
    key_hash VARCHAR(255) NOT NULL, -- bcrypt/sha256 hash of secret
    scopes TEXT[] NOT NULL DEFAULT ARRAY['messages.read', 'messages.send'],
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_ws ON api_keys(workspace_id);

-- ==============================================================================
-- 12. Multi-Tenant Row Level Security (RLS) Setup
-- ==============================================================================

-- Enable RLS on all tenant tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Sample RLS Policy: Only allow access to rows matching current tenant session
CREATE POLICY tenant_isolation_contacts ON contacts
    FOR ALL
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::UUID);

CREATE POLICY tenant_isolation_conversations ON conversations
    FOR ALL
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::UUID);

CREATE POLICY tenant_isolation_messages ON messages
    FOR ALL
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::UUID);

-- ==============================================================================
-- 13. Automatic updated_at Trigger Function
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_workspaces_updated BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
