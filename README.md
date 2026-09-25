# Nexus CRM - AI-Powered Sales Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nexus--crm1.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://nexus-crm1.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Gourav-Sharma243/CRM)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini%20AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Nexus CRM** is a modern, full-stack Customer Relationship Management (CRM) platform engineered for high-velocity sales teams. It combines real-time deal tracking, interactive Kanban pipeline management, and **Google Gemini Generative AI** to analyze sales leads, score deal risks, recommend next best actions, and draft personalized outreach emails.

---

## 🚀 Live Demo & Credentials

- **Live Application:** [https://nexus-crm1.vercel.app/](https://nexus-crm1.vercel.app/)
- **Backend API:** [https://crm-backend-eta-dusky.vercel.app/api/health](https://crm-backend-eta-dusky.vercel.app/api/health)

### Demo Credentials
| Field | Value |
| :--- | :--- |
| **Email** | `gourav@test.ca` |
| **Password** | `Test@1234` |

*(Or click **"Try demo account"** on the login page for 1-click access)*

---

## ✨ Key Features

### 🤖 1. AI-Powered Sales Intelligence (Google Gemini)
- **Deal Risk Scoring:** Calculates real-time lead health scores ($0 - 100$) based on stage, value, interaction history, and notes.
- **Next Best Action:** Generates tailored, strategic action items for account executives to accelerate deal closing.
- **AI Email Composer:** Crafts contextual cold outreach, follow-up, and negotiation emails with tone and prompt customization.
- **Quick AI Summaries:** Instant bullet-point summaries directly accessible from lead inspection drawers.

### 📊 2. Interactive Pipeline Kanban Board (`@dnd-kit`)
- **Multi-Container Drag & Drop:** Fluid deal stage progression across **New**, **Contacted**, **Qualified**, **Proposal**, **Won**, and **Lost**.
- **Atomic State Updates:** Zero UI lag or re-render loops; dropped cards resolve atomically and persist real-time ordering to MongoDB.
- **Unified Click & Drag:** Built with custom pointer sensors—clicking a card opens full lead details, while dragging moves the card.
- **Live Stage Drop Targets:** Visual feedback highlights active droppable zones with dashed drop indicators.

### 📋 3. Comprehensive Lead & Contact Management
- **Dual Display Modes:** Switch seamlessly between tabular data view and interactive card grid.
- **Multi-Dimension Filtering:** Filter leads instantly by Pipeline Stage, Priority (Low/Medium/High), Lead Source, or date timeline range.
- **Bulk Operations:** Select multiple leads for batch deletion and stage reassignments.
- **Global Search Palette:** Command-bar style quick search across all active leads with instant drawer navigation and URL deep-linking (`?leadId=...`).

### 📈 4. Executive Analytics & Reporting
- **Real-Time KPIs:** Dynamic metrics displaying total pipeline value, open deals, won revenue, and calculated win rate.
- **Timeline Date Range Picker:** Filter entire dashboards and pipelines by custom date presets (Today, This Month, Year-to-Date, or Custom Range).
- **Interactive Visualizations:** Built with Recharts for visual deal distribution and revenue analytics.

### 🛡️ 5. Enterprise-Grade Security & Reliability
- **Stateless JWT Authentication:** Secure token-based session management with bcrypt-hashed passwords and HTTP route guards.
- **Serverless DB Connection Caching:** Optimized MongoDB Atlas connection pooling tailored for Vercel serverless execution.
- **Global Error Boundary:** Front-end crash protection with graceful error recovery and automated diagnostic reporting.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19, Vite
- **Routing:** React Router DOM v7
- **Styling:** TailwindCSS v4, Lucide Icons, Glassmorphism design system
- **Drag-and-Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Charts & Notifications:** Recharts, Sonner (toast notifications)
- **HTTP Client:** Axios with JWT interceptors

### Backend
- **Runtime:** Node.js, Express.js (ES Modules)
- **Database:** MongoDB Atlas, Mongoose ODM
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Security:** JSON Web Tokens (JWT), bcryptjs, CORS, Morgan logger
- **Deployment:** Vercel Serverless Functions

---

## 📁 Repository Structure

```
CRM/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection with serverless pooling
│   ├── controllers/
│   │   ├── auth.controller.js  # Registration, login, profile validation
│   │   ├── lead.controller.js  # CRUD, stage transitions, batch reordering
│   │   └── ai.controller.js    # Gemini summaries & email generation
│   ├── middleware/
│   │   └── auth.middleware.js  # JWT verification & route protection
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt password hashing
│   │   ├── Lead.js             # Lead schema with stage, priority, value
│   │   ├── Contact.js          # Contact directory profiles
│   │   └── Task.js             # Associated task trackers
│   ├── routes/
│   │   ├── auth.routes.js      # /api/auth endpoints
│   │   ├── lead.routes.js      # /api/leads endpoints
│   │   └── ai.routes.js        # /api/ai endpoints
│   ├── services/
│   │   └── ai.service.js       # Google Gemini SDK orchestration
│   ├── seed.js                 # Sample database seeder
│   ├── server.js               # Express application entrypoint
│   └── vercel.json             # Backend serverless deployment configuration
│
└── frontend/AICRMDashboard/
    ├── public/                 # Static assets, logo, custom favicon
    ├── src/
    │   ├── components/
    │   │   ├── ai/             # AI Email Composer modal
    │   │   ├── common/         # PageHeader, DateRangePicker, ErrorBoundary
    │   │   ├── dashboard/      # Metrics cards, charts, summaries
    │   │   ├── layout/         # AppLayout, Sidebar, TopNav with search
    │   │   ├── leads/          # LeadDrawer, LeadFormDialog
    │   │   └── ui/             # Reusable UI primitives (Badge, Card, Button, etc.)
    │   ├── context/
    │   │   └── AuthContext.jsx # Global user auth & session state
    │   ├── lib/
    │   │   ├── constants.js    # Stages, priorities, color tokens
    │   │   ├── format.js       # Currency & date formatters
    │   │   └── services.js     # Axios API service client
    │   ├── pages/
    │   │   ├── Dashboard.jsx   # Main executive overview
    │   │   ├── Leads.jsx       # Leads table & grid with filter chips
    │   │   ├── Pipeline.jsx    # Kanban drag-and-drop board
    │   │   ├── Contacts.jsx    # Contact cards directory
    │   │   └── auth/           # Login & Register views
    │   ├── App.jsx             # Route definitions & protected wrappers
    │   └── main.jsx            # React root with ErrorBoundary & Toast providers
    └── vercel.json             # Frontend SPA rewrite rules
```

---

## ⚡ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or free MongoDB Atlas URI)
- [Google AI Studio API Key](https://aistudio.google.com/) (For Gemini AI features)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Gourav-Sharma243/CRM.git
cd CRM
```

---

### Step 2: Configure & Run Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in `backend/`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nexus_crm?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

3. (Optional) Seed the database with sample leads & demo user:
   ```bash
   npm run seed
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   *Backend will run on [http://localhost:5000](http://localhost:5000)*

---

### Step 3: Configure & Run Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend/AICRMDashboard
   npm install
   ```

2. Create a `.env` file in `frontend/AICRMDashboard/`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will launch at [http://localhost:5173](http://localhost:5173)*

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Private |

### Leads & Deals (`/api/leads`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leads` | Retrieve all leads (supports filters & search) | Private |
| `POST` | `/api/leads` | Create a new sales lead | Private |
| `GET` | `/api/leads/:id` | Get details for a single lead | Private |
| `PUT` | `/api/leads/:id` | Update lead information / stage | Private |
| `DELETE` | `/api/leads/:id` | Remove a lead | Private |
| `PATCH` | `/api/leads/reorder` | Batch update pipeline stage & order positions | Private |

### AI Intelligence (`/api/ai`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/lead-summary` | Generate deal health score & next action via Gemini | Private |
| `POST` | `/api/ai/generate-email` | Compose contextual sales outreach email | Private |

---

## 🌐 Deployment (Vercel)

Both the backend and frontend are pre-configured for one-click deployment on **Vercel**:

1. **Backend Deployment:**
   - Set Root Directory to `backend`
   - Set Framework Preset to `Other`
   - Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `NODE_ENV=production`

2. **Frontend Deployment:**
   - Set Root Directory to `frontend/AICRMDashboard`
   - Set Framework Preset to `Vite`
   - Add environment variable: `VITE_API_URL=https://<your-backend-url>/api`

---

## 👨‍💻 Author

**Gourav Sharma**
- GitHub: [@Gourav-Sharma243](https://github.com/Gourav-Sharma243)
- Live Project: [https://nexus-crm1.vercel.app/](https://nexus-crm1.vercel.app/)

---

## 📄 License

This project is licensed under the ISC License.
