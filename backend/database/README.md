# Dhigrowth CRM / Sendiee — PostgreSQL Multi-Tenant Database Architecture

This directory contains the production-grade **PostgreSQL schema** and **seed data** with full multi-tenancy isolation using `workspace_id`.

---

## 🏗️ Architecture Overview

Every single operational table in this CRM is partitioned by `workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`.

### 1. Hierarchy
```
Organizations (Billing Entity, GSTIN, Legal Name)
   └── Workspaces (Tenant Container, Plan, Quota)
         ├── Workspace Members (Users with Roles: Super Admin, Admin, Agent)
         ├── Channels (WhatsApp Cloud API, Instagram, Messenger, LINE)
         ├── Contacts / Leads (CRM Audience, Stages, Custom Attributes)
         │     ├── Tags & Segments
         │     └── Conversations & Messages
         ├── Campaigns (Broadcasts, Drip Automations, Templates)
         ├── AI Assistants & Tools (LLM config, pgvector RAG embeddings)
         ├── Files (Media Storage metadata)
         └── Wallet Accounts (Real-time credit balance & transaction ledger)
```

### 2. Multi-Tenant Security Guarantees
* **Composite Indexes**: Every query filters by `workspace_id` (e.g. `CREATE INDEX idx_contacts_ws_phone ON contacts(workspace_id, phone_number)`), ensuring lightning-fast single-digit ms queries.
* **Row-Level Security (RLS)**: Pre-configured PostgreSQL RLS policies ensuring that even if an application bug occurs, no tenant can ever read or modify another tenant's records:
  ```sql
  SET app.current_workspace_id = 'b0000000-0000-0000-0000-000000000001';
  ```
* **Vector Embeddings (`pgvector`)**: Stores `vector(1536)` embeddings for RAG Knowledge Documents directly alongside tenant data with cosine similarity indexes (`ivfflat`).

---

## 🚀 Quick Setup Instructions

### Option 1: Run Locally with Docker (Recommended)

Requires Docker Desktop installed.

```bash
cd backend/database
docker compose up -d
```

* **PostgreSQL 16 with pgvector**: `localhost:5432`
  * **Database**: `dhigrowth_crm`
  * **User**: `postgres`
  * **Password**: `postgrespassword`
* **Adminer Web GUI**: [http://localhost:8080](http://localhost:8080)
  * System: `PostgreSQL`
  * Server: `postgres`
  * Username: `postgres`
  * Password: `postgrespassword`
  * Database: `dhigrowth_crm`

> Note: The Docker setup automatically runs `schema.sql` and `seed.sql` on startup!

---

### Option 2: Cloud Postgres (Supabase, Neon, AWS RDS, Render)

1. Create a PostgreSQL project on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Open the **SQL Editor**.
3. Copy and paste the entire contents of [`schema.sql`](./schema.sql) and click **Run**.
4. Copy and paste the contents of [`seed.sql`](./seed.sql) to populate initial demo data.

---

## 📋 Database Tables Summary

| Table | Description |
| :--- | :--- |
| `organizations` | Root company profile, GSTIN, legal name, invoicing address |
| `workspaces` | Workspace tenant boundary, subscription tier, trial counter |
| `users` | Auth credentials, name, email, 2FA secret |
| `workspace_members` | Tenant membership with roles (`super_admin`, `admin`, `agent`) |
| `channels` | WhatsApp Phone Number ID, WABA ID, IG/FB/LINE access tokens |
| `contacts` | Leads database, stages, phone numbers, custom attributes |
| `tags` / `segments` | Segmentation and categorization filters |
| `conversations` | Thread state (`open`, `bot_active`, `human_needed`, `closed`) |
| `messages` | Chat history, inbound/outbound, tokens consumed, delivery receipts |
| `templates` | Meta WhatsApp approved message templates (Marketing, Utility) |
| `campaigns` | Broadcast campaign metrics (sent, delivered, read, replied) |
| `ai_assistants` | System prompt, model (`gemini-1.5-flash`), temperature |
| `knowledge_documents` | Uploaded knowledge docs for customer support RAG |
| `document_embeddings` | `pgvector` chunks for semantic search |
| `ai_tools` | Function calling schemas for CRM actions |
| `media_files` | File manager storage tracker |
| `wallet_accounts` | Real-time dollar balance ($ USD) |
| `wallet_transactions` | Micro-cent ledger tracking AI tokens and Meta utility/marketing fees |
| `invoices` | Tax invoices with 18% GST calculation |
| `api_keys` | Scoped API keys with permission hashes |
