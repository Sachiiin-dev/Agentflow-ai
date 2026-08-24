# 🤖 Agentflow_AI — Agentic AI Operations Automation Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12.4-ff0072?style=flat-square)](https://reactflow.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Security](https://img.shields.io/badge/AES--256--GCM-Encrypted-10b981?style=flat-square)](https://nodejs.org/api/crypto.html)

**Agentflow_AI** is a full-stack, enterprise-grade AI Operations Automation Platform that allows operators to describe complex business automations in natural language and transform them into executable visual workflow graphs. Workflows are executed through a chain of 5 cooperating AI agents, integrated with real third-party tools (Gmail, Slack, Discord, Google Sheets), scheduled via background queues, and streamed live to the browser in real time.

---

## 🌟 Key Capabilities

1. **Prompt-to-Workflow AI Compiler**: Type an automation request in plain English (e.g. *"Extract invoices from emails, append to Google Sheets, and notify Slack"*). The engine synthesizes topological nodes, animated edge dependencies, tool bindings, and variables.
   - *Supported Engines*: OpenRouter (Claude 3.5 Sonnet / GPT-4o), Google Gemini, and a smart offline deterministic rule engine fallback.
2. **Visual DAG Studio (React Flow)**: Drag-and-drop node palette, custom status-glow nodes, dynamic parameter configuration inspector, and animated connection wires.
3. **5-Agent Co-Operative Substrate**:
   - 🟣 **Planner Agent**: Performs Kahn's topological DAG dependency sort, validates acyclic requirements, and emits confidence scores.
   - 🔵 **Execution Agent**: Performs dynamic template variable interpolation (`{{node_id.output}}`) and dispatches tool execution.
   - 🟢 **Validation Agent**: Enforces output contracts and detects schema violations or missing payload attributes.
   - 🟡 **Recovery Agent**: Classifies runtime errors (`RATE_LIMIT`, `AUTH_EXPIRED`, `MISSING_FIELDS`, `API_FAILURE`, `TRANSIENT`) and performs autonomous exponential backoff retry or operator escalation.
   - 🌐 **Monitoring Agent**: Emits structured audit events to `ExecutionLog` and streams live real-time updates via Socket.IO.
4. **Third-Party Integrations & AES-256 Vault**:
   - **Gmail**: Send email outreach, read incoming messages, parse attachments.
   - **Slack**: Post to public/private channels, dispatch rich interactive alerts.
   - **Discord**: Broadcast webhook embeds and bot announcements.
   - **Google Sheets**: Append row data, read ranges, update CRM logs.
   - *Zero-Trust Security*: All OAuth access & refresh tokens are encrypted at rest via AES-256-GCM.
5. **Zero-Dependency Local Failover**: Built-in automatic in-memory fallbacks for both MongoDB and Redis/BullMQ so the entire application runs smoothly out-of-the-box on any local environment with zero required background installations!

---

## 🏗️ Architecture & Directory Structure

```
.
├── package.json               # Root monorepo scripts (dev, build, test, install:all)
├── README.md                  # Local setup & architecture guide
├── spec.md                    # Specification source of truth
├── server/                    # Node.js + Express Backend
│   ├── package.json
│   ├── .env                   # Server configuration
│   ├── tests/                 # Automated test runner
│   └── src/
│       ├── config/            # Env, Database (with Memory Fallback), Socket.IO
│       ├── routes/            # Auth, Workflows, Executions, Integrations, Notifications
│       ├── controllers/       # Thin request/response shaping controllers
│       ├── services/          # Business logic & AI generation services
│       ├── agents/            # Planner, Executor, Validator, Recovery, Monitor, Orchestrator
│       ├── integrations/      # BaseIntegration, Gmail, Slack, Discord, Google Sheets
│       ├── models/            # Mongoose + In-Memory hybrid models
│       ├── middleware/        # JWT auth, express-validator, rate-limiter, error handling
│       ├── utils/             # AES-256-GCM credential encryption
│       └── queues/            # BullMQ on Redis with in-memory worker fallback
└── client/                    # Next.js Pages Router Frontend
    ├── package.json
    ├── tailwind.config.js
    ├── next.config.js
    └── src/
        ├── components/        # AppShell, MetricGrid, NodePalette, NodeConfigPanel, WorkflowCanvas
        ├── pages/             # Landing, Login, Register, Dashboard, Builder, Canvas, Executions, Integrations, Settings
        ├── store/             # Zustand stores (authStore, workflowStore)
        ├── services/          # Axios instance & Socket.IO client
        └── styles/            # Tailwind dark mode & React Flow styles
```

---

## 🚀 Step-by-Step Local Setup Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on `v20+` and `v24+`)
- **npm**: `v9.0.0` or higher

> [!TIP]
> **No Database or Redis Setup Required!**
> The platform includes zero-friction in-memory fallbacks for both MongoDB and Redis. If you don't have MongoDB or Redis installed, the platform will automatically activate the high-speed in-memory store and in-memory queue.

---

### 2. Clone & Install All Dependencies

In your project root directory (`c:\Users\sachi\OneDrive\Desktop\NEW PROJECT`), run:

```bash
# Install root, server, and client dependencies in one command:
npm run install:all
```

*(Or individually: `npm install && cd server && npm install && cd ../client && npm install`)*

---

### 3. Configure Environment Variables (Optional)

The backend comes pre-configured with defaults in `server/.env`. You can optionally adjust values or add real API keys:

```ini
# server/.env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database & Redis (Auto-fallback to In-Memory if not running locally)
MONGODB_URI=mongodb://127.0.0.1:27017/agentflow_ai
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Security & Secrets
JWT_SECRET=agentflow_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CREDENTIAL_ENCRYPTION_KEY=a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90

# AI Provider API Keys (Optional - built-in smart rule engine works without keys)
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

---

### 4. Start the Persistent Database (Optional)

Install and start Docker Desktop, then run this from the project root:

```bash
npm run db:start
```

This starts MongoDB on `localhost:27017` with data stored in a Docker volume. The server uses it automatically through `server/.env`. Stop it with `npm run db:stop`.

---

### 5. Run the Automated Backend Verification Test Suite

Run the built-in test runner to verify database fallbacks, encryption, user auth, AI prompt generation, and multi-agent execution:

```bash
npm run test:server
```

---

### 6. Launch the Platform in Development Mode

Run the following command in the root folder to start both the Backend Server (port 5000) and Next.js Frontend (port 3000) concurrently:

```bash
npm run dev
```

You can also start them in separate terminal tabs:
- **Terminal 1 (Backend)**: `npm run dev:server` (Starts API & Socket.IO at `http://localhost:5000`)
- **Terminal 2 (Frontend)**: `npm run dev:client` (Starts Next.js at `http://localhost:3000`)

---

### 7. Access the Application

1. Open your browser and navigate to: **`http://localhost:3000`**
2. Click **"Get Started"** to create an operator account, or use **"Instant Demo Operator Access"** on the login page:
   - **Email**: `operator@agentflow.ai`
   - **Password**: `OperatorPass2026!`
3. Explore the platform:
   - ⚡ **Dashboard** (`/dashboard`): Real-time MetricGrid KPIs, recent runs, and agent health mesh.
   - ✨ **AI Workflow Builder** (`/workflows/builder`): Enter natural language prompts and click "Generate Workflow Graph".
   - 🎨 **Visual Canvas Studio** (`/workflows/[id]`): Drag nodes from the left palette, connect handles, and edit parameters in the inspector.
   - ▶️ **Live Executions** (`/executions/[id]`): Watch the 5-agent chain execute in real-time over Socket.IO with Pause/Resume/Cancel controls.
   - 🔌 **Integrations** (`/integrations`): Connect Gmail, Slack, Discord, and Google Sheets with AES-256 encrypted credentials.
   - ⚙️ **Settings & Security** (`/settings`): Inspect encryption health and platform parameters.

### 8. Deploy with Vercel + Render

This repository includes `render.yaml` for the backend. Deploy it as follows:

1. Push the repository to GitHub, ensuring `.env` is not committed.
2. In Render, create a **Blueprint** from the repository and select `render.yaml`.
3. Set these Render environment variables:
   - `CLIENT_URL`: the final Vercel URL, such as `https://your-app.vercel.app`
   - `MONGODB_URI`: your MongoDB Atlas connection string
   - `CREDENTIAL_ENCRYPTION_KEY`: a new 64-character hex key
   - `GMAIL_USER` and `GMAIL_APP_PASSWORD`: optional Gmail SMTP credentials
   - `GEMINI_API_KEY` or `OPENROUTER_API_KEY`: optional AI provider key
4. Copy the Render service URL, such as `https://agentflow-api.onrender.com`.
5. In Vercel, import the same repository and set the project root directory to `client`.
6. Add these Vercel environment variables:
   - `NEXT_PUBLIC_API_URL`: `https://agentflow-api.onrender.com/api`
   - `NEXT_PUBLIC_SOCKET_URL`: `https://agentflow-api.onrender.com`
7. Deploy Vercel, then update Render's `CLIENT_URL` with the final Vercel URL and redeploy Render.

Generate an encryption key locally with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📡 REST API Reference

### Health & Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System heartbeat, DB status, and substrate availability |
| `POST` | `/api/auth/register` | Register new operator/admin account |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Retrieve active operator profile |

### Workflows
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/workflows/dashboard` | Aggregated metrics & recent execution summaries |
| `GET` | `/api/workflows` | List workflows with pagination, search, and filters |
| `POST` | `/api/workflows` | Create a new workflow manually |
| `POST` | `/api/workflows/generate` | Generate complete workflow graph from AI prompt |
| `GET` | `/api/workflows/:id` | Fetch single workflow details & DAG |
| `PUT` | `/api/workflows/:id` | Update workflow nodes, edges, or trigger configuration |
| `POST` | `/api/workflows/:id/duplicate`| Clone an existing workflow |
| `POST` | `/api/workflows/:id/execute` | Trigger an asynchronous execution run |
| `DELETE` | `/api/workflows/:id` | Delete a workflow |

### Executions & Timeline
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/executions` | List all historical and active runs |
| `GET` | `/api/executions/:id` | Fetch execution snapshot, outputs, and agent logs |
| `GET` | `/api/executions/:id/timeline` | Fetch granular agent timeline events |
| `POST` | `/api/executions/:id/pause` | Pause a running execution |
| `POST` | `/api/executions/:id/resume` | Resume a paused execution |
| `POST` | `/api/executions/:id/cancel` | Cancel an active execution run |

### Integrations & Notifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/integrations` | List user integration connections and status |
| `GET` | `/api/integrations/status` | Provider health & token validity checks |
| `GET` | `/api/integrations/oauth/:provider/start` | Initiate OAuth authorization flow |
| `GET` | `/api/integrations/oauth/:provider/callback` | OAuth callback handler |
| `POST` | `/api/integrations` | Save API key or OAuth credentials (AES-256 encrypted) |
| `DELETE`| `/api/integrations/:provider` | Disconnect third-party integration |
| `GET` | `/api/notifications` | Fetch user alerts and escalation notifications |
| `POST` | `/api/notifications/mark-all-read` | Mark all notifications as acknowledged |

---

## 🔒 Security Specifications

- **Bcrypt Cost 12**: Passwords hashed with bcrypt at cost factor 12.
- **AES-256-GCM Encryption**: OAuth tokens and API keys are encrypted at rest with an application-level 256-bit key. Plaintext tokens are never logged or exposed to the client.
- **JWT Protection**: Secure Bearer tokens with 7-day expiration.
- **Brute Force Protection**: Rate limiting on `/api/auth` endpoints.
- **HTTP Security Headers**: Set automatically using Helmet with custom CORS origin enforcement.

---

## 🧪 Production Build & Deployment

To generate an optimized production bundle and start in production mode:

```bash
# 1. Build Next.js frontend
npm run build:client

# 2. Start server
npm run start:server

# 3. Start client
npm run start:client
```

---

*Built with ❤️ for the Agentic AI Operations Platform (`Agentflow_AI`).*
