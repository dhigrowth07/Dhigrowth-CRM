# WAP PILOT - Monorepo Structure

WAP PILOT is split into two dedicated directories: `frontend` and `backend`, managed via npm workspaces.

```
wappilot/
├── frontend/             # Vite + React 19 Frontend SPA
│   ├── src/              # React components, pages, contexts, services
│   ├── public/           # Static icons, logos, public assets
│   ├── index.html        # HTML entry point
│   ├── vite.config.js    # Vite configuration & API proxy
│   └── package.json      # Frontend client dependencies
│
├── backend/              # Node.js + Express API Gateway
│   ├── database/         # PostgreSQL / Supabase SQL schemas & migrations
│   ├── index.js          # Monolithic server entry point (API + Frontend SPA)
│   ├── *Service.js       # Business logic (Meta, AI, Invoices, Billing, etc.)
│   ├── *Store.json       # JSON persistence stores
│   ├── webhookHandler.js # Meta WhatsApp/Instagram Cloud API webhooks
│   └── package.json      # Backend server dependencies
│
├── scripts/              # Automation and screenshot scripts
├── package.json          # Root workspace configuration & scripts
├── render.yaml           # Unified monolithic deployment configuration
└── Dockerfile            # Unified production container
```

---

## Getting Started

### 1. Install Dependencies
Run from the root directory to install and link both workspaces:
```bash
npm install
```

### 2. Development Commands
You can run services from the project root:

- **Run Frontend:**
  ```bash
  npm run dev
  ```
  *(Runs on `http://localhost:5173` with proxying to backend)*

- **Run Backend:**
  ```bash
  npm run dev:backend
  ```
  *(Runs Node.js server with hot-reload `--watch` on `http://localhost:4000`)*

- **Build Frontend:**
  ```bash
  npm run build
  ```

- **Start Production Backend:**
  ```bash
  npm start
  ```

---

## Working in Subdirectories
You can also navigate directly into either folder to run commands isolated:

```bash
# Frontend
cd frontend
npm run dev
npm run build

# Backend
cd backend
npm run dev
npm start
```
